"""Yhdistää Nimipalvelun top 100 -listat ja ensimmäisen nimen osuudet.

1. Korjataan Nimipalvelun virhe: top 100 -listoilla jokaisen jakson lukuun on
   lisätty myös vuosina 2020–2026 syntyneet. (Esim. Aino 1920–1929:
   nimihaku 11 504, lista 16 030; erotus 4 526 = Ainot 2020–2026.) Korjattu määrä saadaan
   vähentämällä nimen 2020–2026-luku. Jos nimi ei ole 2020–2026 top 100:ssa,
   sen luku on listan pienintä pienempi mutta tuntematon; silloin mitään ei
   vähennetä ja rivi merkitään (korjaus_epavarma = 1).
2. Nimipalvelun luvuissa ovat mukana sekä ensimmäiset että muut etunimet.
   Arvio ensimmäisinä niminä annettujen määrästä saadaan kertomalla korjattu
   lukumäärä nimen ensimmäisenä käytön osuudella (avoindata.fi:n
   etunimitilasto). Osuus kuvaa elossa olevia haltijoita, joten se vääristää
   vanhoja jaksoja (ks. docs/data-sources.md).

Syötteet (aja ensin parse_nimipalvelu.py ja first_name_share.py):
    data/processed/nimipalvelu_top100.csv
    data/processed/first_name_share.csv

Tuloste: data/processed/decades.csv
Sarakkeet: jakso, sukupuoli, sija, nimi, lukumaara, lukumaara_korjattu,
           korjaus_epavarma, sija_korjattu, osuus_ensimmaisena,
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

# Jakso, jonka luvut Nimipalvelu on lisännyt kaikkiin aiempiin jaksoihin.
LATEST_PERIOD = 2020


def read_csv(path):
    with path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def build(top100, shares):
    share_by_name = {(r["sukupuoli"], r["nimi"]): float(r["osuus_ensimmaisena"]) for r in shares}
    median = {
        g: statistics.median(s for (sg, _), s in share_by_name.items() if sg == g)
        for g in {g for g, _ in share_by_name}
    }
    latest = {
        (r["sukupuoli"], r["nimi"]): int(r["lukumaara"])
        for r in top100
        if int(r["jakso"]) == LATEST_PERIOD
    }

    groups = {}
    for r in top100:
        period = int(r["jakso"])
        key = (r["sukupuoli"], r["nimi"])
        count = int(r["lukumaara"])
        if period == LATEST_PERIOD:
            corrected, uncertain = count, False
        else:
            corrected = max(0, count - latest.get(key, 0))
            uncertain = key not in latest
        estimated = key not in share_by_name
        share = median[r["sukupuoli"]] if estimated else share_by_name[key]
        row = {
            "jakso": period,
            "sukupuoli": r["sukupuoli"],
            "sija": int(r["sija"]),
            "nimi": r["nimi"],
            "lukumaara": count,
            "lukumaara_korjattu": corrected,
            "korjaus_epavarma": int(uncertain),
            "osuus_ensimmaisena": share,
            "osuus_arvioitu": int(estimated),
            "arvio_ensimmaisena": round(corrected * share),
        }
        groups.setdefault((period, row["sukupuoli"]), []).append(row)

    result = []
    for key in sorted(groups):
        rows = groups[key]
        for field, rank_field in [
            ("lukumaara_korjattu", "sija_korjattu"),
            ("arvio_ensimmaisena", "sija_ensimmaisena"),
        ]:
            ordered = sorted(rows, key=lambda r: (-r[field], r["sija"]))
            for i, row in enumerate(ordered, start=1):
                row[rank_field] = i
        result += sorted(rows, key=lambda r: r["sija_korjattu"])
    return result


FIELDS = [
    "jakso", "sukupuoli", "sija", "nimi", "lukumaara", "lukumaara_korjattu",
    "korjaus_epavarma", "sija_korjattu", "osuus_ensimmaisena", "osuus_arvioitu",
    "arvio_ensimmaisena", "sija_ensimmaisena",
]


def main():
    rows = build(read_csv(TOP100_FILE), read_csv(SHARE_FILE))
    with OUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} riviä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
