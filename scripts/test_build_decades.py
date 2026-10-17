import unittest

from build_decades import build


def top(period, name, count, rank=1):
    return {"jakso": str(period), "sukupuoli": "nainen", "sija": str(rank), "nimi": name, "lukumaara": str(count)}


SHARES = [
    {"sukupuoli": "nainen", "nimi": "Aino", "osuus_ensimmaisena": "0.5"},
    {"sukupuoli": "nainen", "nimi": "Aava", "osuus_ensimmaisena": "0.6"},
]


class BuildTest(unittest.TestCase):
    def test_latest_period_is_subtracted_from_older_periods(self):
        rows = build(
            [top(1920, "Aino", 16030), top(2020, "Aino", 4526)],
            SHARES,
        )
        by_period = {r["jakso"]: r for r in rows}
        self.assertEqual(by_period[1920]["lukumaara_korjattu"], 11504)
        self.assertEqual(by_period[2020]["lukumaara_korjattu"], 4526)
        self.assertEqual(by_period[1920]["korjaus_epavarma"], 0)

    def test_phantom_name_drops_to_last_rank(self):
        rows = build(
            [top(1920, "Aava", 2350, rank=1), top(1920, "Aino", 2000, rank=2), top(2020, "Aava", 2350)],
            SHARES,
        )
        old = [r for r in rows if r["jakso"] == 1920]
        self.assertEqual([(r["nimi"], r["lukumaara_korjattu"]) for r in old], [("Aino", 2000), ("Aava", 0)])
        self.assertEqual(old[0]["korjaus_epavarma"], 1)


if __name__ == "__main__":
    unittest.main()
