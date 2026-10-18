import csv
import json
import unittest

from build_styles_json import DATA_FILES, IN_FILE, build, data_names, read_tags


def rows(*pairs):
    return [{"nimi": n, "tyylit": t} for n, t in pairs]


class ReadTagsTest(unittest.TestCase):
    def test_orders_styles_and_drops_duplicates(self):
        tags = read_tags(rows(("Aurora", "kansainvalinen luonto luonto")))
        self.assertEqual(tags, {"Aurora": ["luonto", "kansainvalinen"]})

    def test_rejects_unknown_style_empty_tags_and_duplicates(self):
        with self.assertRaisesRegex(ValueError, "tuntematon tyyli"):
            read_tags(rows(("Aino", "kalevala")))
        with self.assertRaisesRegex(ValueError, "ei ole tyyliä"):
            read_tags(rows(("Aino", " ")))
        with self.assertRaisesRegex(ValueError, "toistuu"):
            read_tags(rows(("Aino", "hyve"), ("Aino", "luonto")))


class BuildTest(unittest.TestCase):
    def test_requires_every_name_to_be_tagged(self):
        with self.assertRaisesRegex(ValueError, "tagaamattomat nimet: Väinö"):
            build({"Aino": ["kansallisromanttinen"]}, {"Aino", "Väinö"})
        with self.assertRaisesRegex(ValueError, "puuttuvat datasta: Aino"):
            build({"Aino": ["kansallisromanttinen"]}, set())

    def test_reads_names_from_all_periods_and_sexes(self):
        data = {"nimet": {"nainen": {"1900": [["Aino", 1, 1]]}, "mies": {"1910": [["Eino", 1, 1]]}}}
        self.assertEqual(data_names([data]), {"Aino", "Eino"})

    def test_tag_file_covers_the_data(self):
        with IN_FILE.open(encoding="utf-8") as f:
            tags = read_tags(csv.DictReader(f))
        datasets = [json.loads(p.read_text(encoding="utf-8")) for p in DATA_FILES]
        self.assertTrue(build(tags, data_names(datasets)))


if __name__ == "__main__":
    unittest.main()
