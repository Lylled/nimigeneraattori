"""Muuntaa käsin kootut historialliset nimiarviot selaimen käyttämäksi JSONiksi.

Lähde on data/historical/arviot.txt, jossa nimet ovat jaksoittain arvioidussa
yleisyysjärjestyksessä. Lukumääriä ei ole, joten nimen paino johdetaan
sijoituksesta Zipfin lain mukaan (paino = 1 / sija). Se vastaa karkeasti
historiallista nimistöä, jossa muutama nimi kattoi suuren osan kastetuista.

Tuloste: src/data/historical.json (sama rakenne kuin names.json, ks.
docs/data-schema.md)

Käyttö:
    python3 scripts/build_historical_json.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN_FILE = ROOT / "data" / "historical" / "arviot.txt"
OUT_FILE = ROOT / "src" / "data" / "historical.json"

SOURCE = (
    "Arvio, joka perustuu nimihistorian yleistietoon, HisKi-otokseen "
    "vuodelta 1890 ja julkaistuihin nimitutkimuksiin"
)
SEXES = ("nainen", "mies")
HEADER = re.compile(r"^\[(\d{4})-(\d{4}) (nainen|mies)\]$")
NAME = re.compile(r"^(\S+)(?: \(([^()]+)\))?$")


def parse(text):
    """Palauttaa {(alku, loppu): {sukupuoli: [(nimi, kirjattu | None)]}}."""
    periods = {}
    current = None
    for number, raw in enumerate(text.splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        header = HEADER.match(line)
        if header:
            start, end, sex = int(header[1]), int(header[2]), header[3]
            current = periods.setdefault((start, end), {}).setdefault(sex, [])
            if current:
                raise ValueError(f"rivi {number}: jakso toistuu: {line}")
            continue
        name = NAME.match(line)
        if current is None or not name:
            raise ValueError(f"rivi {number}: tuntematon rivi: {line}")
        if any(n == name[1] for n, _ in current):
            raise ValueError(f"rivi {number}: nimi toistuu: {name[1]}")
        current.append((name[1], name[2]))
    return periods


def build(periods):
    ordered = sorted(periods)
    for (start, end), (next_start, _) in zip(ordered, ordered[1:]):
        if next_start != end + 1:
            raise ValueError(f"jaksot eivät jatku: {end} → {next_start}")
    names = {sex: {} for sex in SEXES}
    for (start, end), by_sex in periods.items():
        for sex in SEXES:
            if sex not in by_sex:
                raise ValueError(f"jaksolta {start}-{end} puuttuu: {sex}")
            names[sex][str(start)] = [
                # Arviot koskevat ensimmäistä etunimeä, joten osuus on 1.
                [name, round(1 / rank, 4), 1] + ([recorded] if recorded else [])
                for rank, (name, recorded) in enumerate(by_sex[sex], start=1)
            ]
    return {
        "lahde": SOURCE,
        "jaksot": [{"alku": s, "loppu": e} for s, e in ordered],
        "nimet": names,
    }


def main():
    data = build(parse(IN_FILE.read_text(encoding="utf-8")))
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    count = sum(len(e) for g in data["nimet"].values() for e in g.values())
    print(f"{count} nimeä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
