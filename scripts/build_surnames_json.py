"""Muuntaa merkityt sukunimet selaimen käyttämäksi JSONiksi.

Lähde on data/surnames/sukunimet.tsv (sarakkeet nimi, kantajia, tyyppi,
alueet, alkaen, kuvaus; sarkaimella erotettuina). Kantajamäärät ovat DVV:n
sukunimitilastosta (avoindata.fi, CC BY 4.0). Tyyppi, alueet ja alkaen-vuosi
ovat käsin tehtyjä arvioita, ks. docs/data-sources.md.

Tuloste: src/data/surnames.json, muotoa
{"lahde": "...", "nimet": [[nimi, kantajia, tyyppi, "alue alue", alkaen, kuvaus]]}

Käyttö:
    python3 scripts/build_surnames_json.py
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "data" / "surnames" / "sukunimet.tsv"
OUT_FILE = ROOT / "src" / "data" / "surnames.json"

SOURCE = (
    "Digi- ja väestötietovirasto, Väestötietojärjestelmän suomalaisten "
    "nimiaineistot: sukunimitilasto (CC BY 4.0); tyypit ja alueet arvioita"
)
TYPES = (
    "ita_nen",
    "lansi_vanha",
    "talonnimi",
    "suomalaistettu",
    "ruotsalainen",
    "sotilasnimi",
    "saatynimi",
    "saame",
    "ortodoksinen",
    "muu",
)
REGIONS = ("lansi", "ita", "pohjanmaa", "karjala", "lappi", "rannikko")
YEARS = (1600, 1800, 1880, 1906, 1935, 1950, 1990)
MAX_LENGTH = 200


def read_rows(rows):
    names = []
    seen = set()
    for row in rows:
        name = row["nimi"].strip()
        if name in seen:
            raise ValueError(f"nimi toistuu: {name}")
        seen.add(name)
        kind = row["tyyppi"].strip()
        if kind not in TYPES:
            raise ValueError(f"tuntematon tyyppi nimellä {name}: {kind}")
        regions = row["alueet"].split()
        if not regions or any(r not in REGIONS for r in regions):
            raise ValueError(f"virheelliset alueet nimellä {name}: {row['alueet']}")
        year = int(row["alkaen"])
        if year not in YEARS:
            raise ValueError(f"virheellinen alkaen-vuosi nimellä {name}: {year}")
        text = row["kuvaus"].strip()
        if not text or len(text) > MAX_LENGTH:
            raise ValueError(f"kuvaus puuttuu tai on liian pitkä: {name}")
        count = int(row["kantajia"])
        ordered = " ".join(r for r in REGIONS if r in regions)
        names.append([name, count, kind, ordered, year, text])
    names.sort(key=lambda n: (-n[1], n[0]))
    return names


def main():
    with IN_FILE.open(encoding="utf-8", newline="") as f:
        names = read_rows(csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE))
    with OUT_FILE.open("w", encoding="utf-8") as f:
        json.dump({"lahde": SOURCE, "nimet": names}, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"{len(names)} sukunimeä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
