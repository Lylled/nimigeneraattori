"""Muuntaa nimien kuvaukset selaimen käyttämäksi JSONiksi.

Lähde on data/info/kuvaukset.tsv (sarakkeet nimi, alkupera, kuvaus;
sarkaimella erotettuina). Kuvaukset on kirjoitettu tekoälyn avustamana, ja
niitä korjataan suoraan TSV:hen.

Skripti tarkistaa, että jokaisella src/data-hakemiston nimiaineiston nimellä
on kuvaus, että alkuperä on sallittu ja ettei TSV:ssä ole tuntemattomia nimiä.

Tuloste: src/data/info.json, muotoa {"nimi": ["alkuperä", "kuvaus"]}

Käyttö:
    python3 scripts/build_info_json.py
"""

import csv
import json
from pathlib import Path

from build_styles_json import DATA_FILES, data_names

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "data" / "info" / "kuvaukset.tsv"
OUT_FILE = ROOT / "src" / "data" / "info.json"

ORIGINS = (
    "heprea",
    "aramea",
    "kreikka",
    "latina",
    "germaaninen",
    "muinaispohjoismainen",
    "kelttiläinen",
    "slaavilainen",
    "suomi",
    "karjala",
    "unkari",
    "arabia",
    "persia",
    "uudismuodoste",
    "epäselvä",
)
MAX_LENGTH = 260


def read_info(rows):
    info = {}
    for row in rows:
        name, origin, text = row["nimi"].strip(), row["alkupera"].strip(), row["kuvaus"].strip()
        if name in info:
            raise ValueError(f"nimi toistuu: {name}")
        if origin not in ORIGINS:
            raise ValueError(f"tuntematon alkuperä nimellä {name}: {origin}")
        if not text or len(text) > MAX_LENGTH:
            raise ValueError(f"kuvaus puuttuu tai on liian pitkä: {name}")
        info[name] = [origin, text]
    return info


def build(info, names):
    missing = sorted(names - info.keys())
    if missing:
        raise ValueError(f"kuvaamattomat nimet: {', '.join(missing)}")
    extra = sorted(info.keys() - names)
    if extra:
        raise ValueError(f"nimet puuttuvat datasta: {', '.join(extra)}")
    return {name: info[name] for name in sorted(info)}


def main():
    with IN_FILE.open(encoding="utf-8", newline="") as f:
        info = read_info(csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE))
    datasets = [json.loads(p.read_text(encoding="utf-8")) for p in DATA_FILES]
    data = build(info, data_names(datasets))
    with OUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"{len(data)} nimeä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
