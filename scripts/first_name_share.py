"""Laskee jokaiselle etunimelle, kuinka suuri osa haltijoista käyttää sitä
ensimmäisenä etunimenä.

Lähde: Digi- ja väestötietovirasto, Väestötietojärjestelmän suomalaisten
nimiaineistot (avoindata.fi), CC BY 4.0. Uusin etunimitilasto haetaan
avoindata.fi:n rajapinnasta ja tallennetaan hakemistoon data/raw/ (ei gitissä).

Tuloste: data/processed/first_name_share.csv
Sarakkeet: sukupuoli, nimi, kaikki, ensimmaisena, osuus_ensimmaisena

Käyttö:
    python3 scripts/first_name_share.py            # lataa uusimman tiedoston
    python3 scripts/first_name_share.py tiedosto.xlsx
"""

import csv
import json
import sys
import urllib.request
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
OUT_FILE = ROOT / "data" / "processed" / "first_name_share.csv"

PACKAGE_URL = "https://www.avoindata.fi/data/api/3/action/package_show?id=none"
SHEETS = {"mies": "Miehet", "nainen": "Naiset"}


def download_latest():
    with urllib.request.urlopen(PACKAGE_URL) as resp:
        resources = json.load(resp)["result"]["resources"]
    resource = next(r for r in resources if r["name"].startswith("Etunimitilasto"))
    path = RAW_DIR / Path(resource["url"]).name
    if not path.exists():
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(resource["url"], path)
    return path


def read_sheet(wb, title):
    rows = wb[title].iter_rows(min_row=2, values_only=True)
    return {name: count for name, count in rows if name}


def compute_shares(xlsx_path):
    wb = openpyxl.load_workbook(xlsx_path, read_only=True)
    result = []
    for gender, prefix in SHEETS.items():
        total = read_sheet(wb, f"{prefix} kaikki")
        first = read_sheet(wb, f"{prefix} ens")
        for name, count in total.items():
            # Alle viiden haltijan määriä ei julkaista, joten puuttuva arvo
            # tarkoittaa käytännössä nollaa.
            n_first = first.get(name, 0)
            result.append((gender, name, count, n_first, round(n_first / count, 4)))
    return result


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else download_latest()
    rows = compute_shares(path)
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["sukupuoli", "nimi", "kaikki", "ensimmaisena", "osuus_ensimmaisena"])
        writer.writerows(rows)
    print(f"{len(rows)} nimeä ({path.name}) → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
