"""Muuntaa data/processed/decades.csv:n selaimen käyttämäksi JSONiksi.

Mukaan otetaan Nimipalvelun virheen osalta korjattu lukumäärä
(build_decades.py). Nimet, joiden korjattu määrä on 0, jätetään pois.
Rakenne on kuvattu tiedostossa docs/data-schema.md.

Tuloste: src/data/names.json

Käyttö:
    python3 scripts/build_names_json.py
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "data" / "processed" / "decades.csv"
OUT_FILE = ROOT / "src" / "data" / "names.json"

LAST_YEAR = 2026
SOURCE = (
    "Digi- ja väestötietovirasto, Nimipalvelu (aineisto päivitetty 12.10.2026) "
    "ja Väestötietojärjestelmän suomalaisten nimiaineistot (CC BY 4.0)"
)


def build(rows):
    periods = sorted({int(r["jakso"]) for r in rows})
    names = {"nainen": {}, "mies": {}}
    for r in rows:
        count = int(r["lukumaara_korjattu"])
        if count == 0:
            continue
        names[r["sukupuoli"]].setdefault(r["jakso"], []).append(
            [r["nimi"], count, round(float(r["osuus_ensimmaisena"]), 3)]
        )
    for by_period in names.values():
        for entries in by_period.values():
            entries.sort(key=lambda e: (-e[1], e[0]))
    return {
        "lahde": SOURCE,
        "jaksot": [
            {"alku": p, "loppu": min(p + 9, LAST_YEAR)} for p in periods
        ],
        "nimet": names,
    }


def main():
    with IN_FILE.open(encoding="utf-8") as f:
        data = build(list(csv.DictReader(f)))
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    count = sum(len(e) for g in data["nimet"].values() for e in g.values())
    print(f"{count} nimeä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
