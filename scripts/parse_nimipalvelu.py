"""Jäsentää Nimipalvelusta käsin kopioidut top 100 -listat CSV-tiedostoksi.

Syöte: data/raw/nimipalvelu/<jakso>.txt, esim. 1920.txt tai 1899.txt (= –1899).
Tiedostoon liitetään jakson kaikki 10 sivua peräkkäin sellaisenaan.

Tuloste: data/processed/nimipalvelu_top100.csv
Sarakkeet: jakso, sukupuoli, sija, nimi, lukumaara

Käyttö:
    python3 scripts/parse_nimipalvelu.py
"""

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw" / "nimipalvelu"
OUT_FILE = ROOT / "data" / "processed" / "nimipalvelu_top100.csv"

# Jaksot Nimipalvelun vuosikymmen-parametrin mukaan; 1899 tarkoittaa "–1899".
PERIODS = [1899] + list(range(1900, 2030, 10))

HEADER_RE = re.compile(r"Sija\s+(Miehet|Naiset)")
# Lukumäärän tuhaterottimena voi olla välilyönti, sitova välilyönti tai ohut
# välilyönti. Tuhatryhmä ei saa jatkua pisteellä, ettei seuraavan rivin
# sijaa ("100.") lueta osaksi lukua.
ROW_RE = re.compile(
    r"(?<![\d.])(\d{1,3})\.\s+([^\d\t\r\n.]+?)\s+"
    r"(\d{1,3}(?:[   ]\d{3}(?![\d.]))*)(?![\d.])"
)
GENDERS = {"Miehet": "mies", "Naiset": "nainen"}


def parse_text(text):
    """Palauttaa listan (sukupuoli, sija, nimi, lukumäärä) -tupleja.

    Rivi kuuluu sukupuolelle, jonka "Sija Miehet/Naiset" -otsikko on viimeksi
    ennen riviä. Toistuvat rivit (sama sivu liitetty kahdesti) poistetaan.
    """
    headers = [(m.start(), GENDERS[m.group(1)]) for m in HEADER_RE.finditer(text)]
    rows = {}
    for m in ROW_RE.finditer(text):
        gender = None
        for pos, g in headers:
            if pos > m.start():
                break
            gender = g
        if gender is None:
            continue
        rank = int(m.group(1))
        name = m.group(2).strip()
        count = int(re.sub(r"\D", "", m.group(3)))
        rows[(gender, rank)] = (gender, rank, name, count)
    return sorted(rows.values(), key=lambda r: (r[0], r[1]))


def validate(period, rows):
    """Palauttaa listan varoituksia puuttuvista tai epäilyttävistä riveistä."""
    warnings = []
    for gender in GENDERS.values():
        g_rows = [r for r in rows if r[0] == gender]
        missing = sorted(set(range(1, 101)) - {r[1] for r in g_rows})
        if missing:
            warnings.append(f"{period} {gender}: puuttuvat sijat {_ranges(missing)}")
        for prev, cur in zip(g_rows, g_rows[1:]):
            if cur[3] > prev[3]:
                warnings.append(
                    f"{period} {gender}: sijan {cur[1]} lukumäärä ({cur[3]}) "
                    f"on suurempi kuin sijan {prev[1]} ({prev[3]})"
                )
    return warnings


def _ranges(numbers):
    parts, start = [], numbers[0]
    for a, b in zip(numbers, numbers[1:] + [None]):
        if b != a + 1:
            parts.append(str(start) if start == a else f"{start}–{a}")
            start = b
    return ", ".join(parts)


def main():
    all_rows, warnings = [], []
    for period in PERIODS:
        path = RAW_DIR / f"{period}.txt"
        if not path.exists():
            warnings.append(f"{period}: tiedostoa {path.name} ei ole vielä")
            continue
        rows = parse_text(path.read_text(encoding="utf-8"))
        warnings += validate(period, rows)
        all_rows += [(period, *r) for r in rows]

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["jakso", "sukupuoli", "sija", "nimi", "lukumaara"])
        writer.writerows(all_rows)

    for w in warnings:
        print("Varoitus:", w, file=sys.stderr)
    print(f"{len(all_rows)} riviä → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
