import csv
import json
import unittest

from build_info_json import IN_FILE, build, read_info
from build_styles_json import DATA_FILES, data_names


def row(name, origin="heprea", text="Kuvaus."):
    return {"nimi": name, "alkupera": origin, "kuvaus": text}


class ReadInfoTest(unittest.TestCase):
    def test_reads_origin_and_text(self):
        self.assertEqual(read_info([row("Juho")]), {"Juho": ["heprea", "Kuvaus."]})

    def test_rejects_bad_rows(self):
        with self.assertRaisesRegex(ValueError, "tuntematon alkuperä"):
            read_info([row("Juho", origin="hebrea")])
        with self.assertRaisesRegex(ValueError, "liian pitkä"):
            read_info([row("Juho", text="x" * 300)])
        with self.assertRaisesRegex(ValueError, "toistuu"):
            read_info([row("Juho"), row("Juho")])


class BuildTest(unittest.TestCase):
    def test_requires_every_name(self):
        with self.assertRaisesRegex(ValueError, "kuvaamattomat nimet: Aino"):
            build({"Juho": ["heprea", "x"]}, {"Juho", "Aino"})
        with self.assertRaisesRegex(ValueError, "puuttuvat datasta: Juho"):
            build({"Juho": ["heprea", "x"]}, set())

    def test_info_file_covers_the_data(self):
        with IN_FILE.open(encoding="utf-8", newline="") as f:
            info = read_info(csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE))
        datasets = [json.loads(p.read_text(encoding="utf-8")) for p in DATA_FILES]
        self.assertTrue(build(info, data_names(datasets)))


if __name__ == "__main__":
    unittest.main()
