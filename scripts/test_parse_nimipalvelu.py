import unittest

from parse_nimipalvelu import parse_text, validate

# Kopioitu selaimesta: taulukon solut sarkaimilla erotettuina.
TAB_PASTE = """Sija\tMiehet\tLukumäärä
1.\tJohannes\t37 850
2.\tOlavi\t34 853
Sija\tNaiset\tLukumäärä
1.\tMaria\t35 757
2.\tAnna-Liisa\t21 846
"""

# Kopioitu selaimesta, joka laittaa jokaisen solun omalle rivilleen.
LINE_PASTE = """Valitse sukupuoli
Miehet
Naiset
Sija
Miehet
Lukumäärä
99.
Albert
2 098
100.
Veli
2 039
Sija
Naiset
Lukumäärä
100.
Elviira
2 279
Sivu 10 / 10
"""


class ParseTextTest(unittest.TestCase):
    def test_tab_separated(self):
        self.assertEqual(
            parse_text(TAB_PASTE),
            [
                ("mies", 1, "Johannes", 37850),
                ("mies", 2, "Olavi", 34853),
                ("nainen", 1, "Maria", 35757),
                ("nainen", 2, "Anna-Liisa", 21846),
            ],
        )

    def test_one_cell_per_line_and_three_digit_rank(self):
        # Lukumäärää "2 098" ei saa lukea yhteen seuraavan sijan "100." kanssa.
        self.assertEqual(
            parse_text(LINE_PASTE),
            [
                ("mies", 99, "Albert", 2098),
                ("mies", 100, "Veli", 2039),
                ("nainen", 100, "Elviira", 2279),
            ],
        )

    def test_duplicate_page_is_ignored(self):
        self.assertEqual(parse_text(TAB_PASTE + TAB_PASTE), parse_text(TAB_PASTE))

    def test_validate_reports_missing_ranks(self):
        warnings = validate(1920, parse_text(TAB_PASTE))
        self.assertIn("1920 mies: puuttuvat sijat 3–100", warnings)


if __name__ == "__main__":
    unittest.main()
