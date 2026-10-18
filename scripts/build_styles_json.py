"""Muuntaa nimien tyylitagit selaimen käyttämäksi JSONiksi.

Lähde on data/styles/tyylit.csv (sarakkeet nimi, tyylit; tyylit välilyönnillä
erotettuina). Tagit on tehty käsin, ja niitä voi korjata suoraan CSV:hen.
Tyylien määritelmät ovat tiedostossa docs/tyylit.md.

Skripti tarkistaa, että jokaisella names.json- ja historical.json-tiedoston
nimellä on vähintään yksi tyyli ja ettei CSV:ssä ole tuntemattomia nimiä tai
tyylejä. Näin uudet nimet eivät jää huomaamatta tagaamatta.

Tuloste: src/data/styles.json, muotoa {"nimi": ["tyyli", ...]}

Käyttö:
    python3 scripts/build_styles_json.py
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "data" / "styles" / "tyylit.csv"
DATA_FILES = [ROOT / "src" / "data" / "names.json", ROOT / "src" / "data" / "historical.json"]
OUT_FILE = ROOT / "src" / "data" / "styles.json"

STYLES = (
    "luonto",
    "raamatullinen",
    "kansallisromanttinen",
    "hyve",
    "perinteinen",
    "saatylainen",
    "kansainvalinen",
)


def read_tags(rows):
    tags = {}
    for row in rows:
        name, styles = row["nimi"].strip(), row["tyylit"].split()
        if name in tags:
            raise ValueError(f"nimi toistuu: {name}")
        if not styles:
            raise ValueError(f"nimellä ei ole tyyliä: {name}")
        unknown = [s for s in styles if s not in STYLES]
        if unknown:
            raise ValueError(f"tuntematon tyyli nimellä {name}: {', '.join(unknown)}")
        tags[name] = sorted(set(styles), key=STYLES.index)
    return tags


def data_names(datasets):
    return {
        row[0]
        for data in datasets
        for by_period in data["nimet"].values()
        for rows in by_period.values()
        for row in rows
    }


def build(tags, names):
    missing = sorted(names - tags.keys())
    if missing:
        raise ValueError(f"tagaamattomat nimet: {', '.join(missing)}")
    extra = sorted(tags.keys() - names)
    if extra:
        raise ValueError(f"nimet puuttuvat datasta: {', '.join(extra)}")
    return {name: tags[name] for name in sorted(tags)}


def main():
    with IN_FILE.open(encoding="utf-8") as f:
        tags = read_tags(csv.DictReader(f))
    datasets = [json.loads(p.read_text(encoding="utf-8")) for p in DATA_FILES]
    data = build(tags, data_names(datasets))
    with OUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"{len(data)} nimeä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
