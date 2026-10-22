import csv
import unittest

from build_surnames_json import IN_FILE, REGIONS, read_rows


def row(name="Korhonen", count="100", kind="ita_nen", regions="ita karjala", year="1600"):
    return {
        "nimi": name,
        "kantajia": count,
        "tyyppi": kind,
        "alueet": regions,
        "alkaen": year,
        "kuvaus": "Kuvaus.",
    }


class ReadRowsTest(unittest.TestCase):
    def test_orders_by_count_and_normalises_regions(self):
        names = read_rows([row("Hyvönen", "10", regions="karjala ita"), row()])
        self.assertEqual(names[0], ["Korhonen", 100, "ita_nen", "ita karjala", 1600, "Kuvaus."])
        self.assertEqual(names[1][3], "ita karjala")

    def test_rejects_bad_values(self):
        with self.assertRaisesRegex(ValueError, "tuntematon tyyppi"):
            read_rows([row(kind="itäinen")])
        with self.assertRaisesRegex(ValueError, "virheelliset alueet"):
            read_rows([row(regions="savo")])
        with self.assertRaisesRegex(ValueError, "alkaen-vuosi"):
            read_rows([row(year="1700")])
        with self.assertRaisesRegex(ValueError, "toistuu"):
            read_rows([row(), row()])

    def test_surname_file_is_valid_and_covers_every_region(self):
        with IN_FILE.open(encoding="utf-8", newline="") as f:
            names = read_rows(csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE))
        self.assertGreaterEqual(len(names), 500)
        for region in REGIONS:
            in_region = [n for n in names if region in n[3].split()]
            self.assertGreaterEqual(len(in_region), 20, region)


if __name__ == "__main__":
    unittest.main()
