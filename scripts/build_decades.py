"""Yhdistää Nimipalvelun top 100 -listat ja ensimmäisen nimen osuudet.

Nimipalvelun luvuissa ovat mukana sekä ensimmäiset että muut etunimet. Arvio
ensimmäisinä niminä annettujen määrästä saadaan kertomalla lukumäärä nimen
ensimmäisenä käytön osuudella (avoindata.fi:n etunimitilasto). Lopuksi nimet
järjestetään jakson sisällä uudelleen arvion mukaan.

Syötteet (aja ensin parse_nimipalvelu.py ja first_name_share.py):
    data/processed/nimipalvelu_top100.csv
    data/processed/first_name_share.csv

Tuloste: data/processed/decades.csv
Sarakkeet: jakso, sukupuoli, sija, nimi, lukumaara, osuus_ensimmaisena,
           osuus_arvioitu, arvio_ensimmaisena, sija_ensimmaisena

osuus_arvioitu = 1, jos nimeä ei löydy etunimitilastosta (ei elossa olevia
haltijoita) ja osuutena on käytetty sukupuolen mediaania.

Käyttö:
    python3 scripts/build_decades.py
"""

import csv
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROCESSED = ROOT / "data" / "processed"
TOP100_FILE = PROCESSED / "nimipalvelu_top100.csv"
SHARE_FILE = PROCESSED / "first_name_share.csv"
OUT_FILE = PROCESSED / "decades.csv"


def read_csv(path):
    with path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def build(top100, shares):
    share_by_name = {(r["sukupuoli"], r["nimi"]): float(r["osuus_ensimmaisena"]) for r in shares}
    median = {
        g: statistics.median(s for (sg, _), s in share_by_name.items() if sg == g)
        for g in {g for g, _ in share_by_name}
    }

    groups = {}
    for r in top100:
        key = (r["sukupuoli"], r["nimi"])
        estimated = key not in share_by_name
        share = median[r["sukupuoli"]] if estimated else share_by_name[key]
        count = int(r["lukumaara"])
        row = {
            "jakso": int(r["jakso"]),
            "sukupuoli": r["sukupuoli"],
            "sija": int(r["sija"]),
            "nimi": r["nimi"],
            "lukumaara": count,
            "osuus_ensimmaisena": share,
            "osuus_arvioitu": int(estimated),
            "arvio_ensimmaisena": round(count * share),
        }
        groups.setdefault((row["jakso"], row["sukupuoli"]), []).append(row)

    result = []
    for key in sorted(groups):
        rows = sorted(groups[key], key=lambda r: (-r["arvio_ensimmaisena"], r["sija"]))
        for i, row in enumerate(rows, start=1):
            row["sija_ensimmaisena"] = i
        result += rows
    return result


def main():
    rows = build(read_csv(TOP100_FILE), read_csv(SHARE_FILE))
    with OUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]) if rows else ["jakso"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} riviä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
