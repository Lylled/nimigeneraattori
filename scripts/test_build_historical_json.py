import unittest

from build_historical_json import IN_FILE, JOBS, build, parse

SAMPLE = """
# kommentti
[1800-1849 nainen]
Maria
Kaisa (Catharina)

[1800-1849 mies]
Matti (Matts)

[1850-1899 nainen]
Anna
[1850-1899 mies]
Juho
Kalle
"""


class ParseTest(unittest.TestCase):
    def test_reads_names_and_recorded_forms_in_order(self):
        periods = parse(SAMPLE)
        self.assertEqual(
            periods[(1800, 1849)]["nainen"],
            [("Maria", None), ("Kaisa", "Catharina")],
        )
        self.assertEqual(periods[(1850, 1899)]["mies"], [("Juho", None), ("Kalle", None)])

    def test_rejects_duplicate_names_and_stray_lines(self):
        with self.assertRaisesRegex(ValueError, "nimi toistuu"):
            parse("[1800-1849 nainen]\nMaria\nMaria")
        with self.assertRaisesRegex(ValueError, "tuntematon rivi"):
            parse("Maria")


class BuildTest(unittest.TestCase):
    def test_weight_follows_rank_and_recorded_form_is_kept(self):
        data = build(parse(SAMPLE), "testi")
        self.assertEqual(
            data["jaksot"], [{"alku": 1800, "loppu": 1849}, {"alku": 1850, "loppu": 1899}]
        )
        self.assertEqual(
            data["nimet"]["nainen"]["1800"],
            [["Maria", 1.0, 1], ["Kaisa", 0.5, 1, "Catharina"]],
        )

    def test_rejects_gaps_and_missing_sex(self):
        with self.assertRaisesRegex(ValueError, "eivät jatku"):
            build(parse("[1800-1849 nainen]\nA\n[1800-1849 mies]\nB\n[1851-1899 nainen]\nC\n[1851-1899 mies]\nD"), "testi")
        with self.assertRaisesRegex(ValueError, "puuttuu"):
            build(parse("[1800-1849 nainen]\nMaria"), "testi")

    def test_estimate_file_is_valid(self):
        data = build(parse(IN_FILE.read_text(encoding="utf-8")), "testi")
        self.assertEqual(data["jaksot"][0]["alku"], 1700)
        self.assertEqual(data["jaksot"][-1]["loppu"], 1899)
        for sex in ("nainen", "mies"):
            for rows in data["nimet"][sex].values():
                self.assertGreaterEqual(len(rows), 30)

    def test_tradition_files_cover_both_tabs(self):
        # Perinteiden jaksojen on katettava 1700–2026, ja vuodesta 1900 on
        # alettava uusi jakso, jotta nimet jakautuvat välilehdille.
        for in_file, _, source in JOBS[1:]:
            data = build(parse(in_file.read_text(encoding="utf-8")), source)
            starts = [j["alku"] for j in data["jaksot"]]
            self.assertEqual(starts[0], 1700, in_file.name)
            self.assertEqual(data["jaksot"][-1]["loppu"], 2026, in_file.name)
            self.assertIn(1900, starts, in_file.name)
            for sex in ("nainen", "mies"):
                for rows in data["nimet"][sex].values():
                    self.assertGreaterEqual(len(rows), 30, in_file.name)


if __name__ == "__main__":
    unittest.main()
