# Nimipalvelun top 100 -listat (kerätään käsin)

Nimipalvelun robots.txt kieltää automaattisen haun, joten listat kopioidaan selaimesta käsin.

## Ohje

Jokaiselle jaksolle tehdään oma tiedosto tähän hakemistoon:

| Tiedosto | Jakso | Sivun osoite (vaihda `sivu=1` … `sivu=10`) |
|---|---|---|
| `1900.txt` | 1900–1909 | https://nimipalvelu.dvv.fi/suosituimmat-etunimet?vuosikymmen=1900&sivu=1 |
| `1910.txt` … `2010.txt` | 1910–1919 … 2010–2019 | sama kaava |
| `2020.txt` | 2020–2026 | https://nimipalvelu.dvv.fi/suosituimmat-etunimet?vuosikymmen=2020&sivu=1 |

Jokaiselle sivulle 1–10:

1. Avaa sivu selaimessa.
2. Valitse hiirellä alue otsikosta **Sija** (miesten taulukon yläpuolella) aina naisten taulukon viimeiseen riviin asti. Koko sivunkin voi valita (Ctrl+A), sillä ylimääräinen teksti ei haittaa.
3. Kopioi ja liitä jakson tiedoston loppuun. Sivujen järjestyksellä ei ole väliä, eikä kahdesti liitetty sivu haittaa.

Kun tiedosto on valmis, aja:

```sh
python3 scripts/parse_nimipalvelu.py
```

Skripti kertoo, jos jakson sijoja puuttuu (esim. `1920 mies: puuttuvat sijat 31–40`). Silloin jokin sivu on jäänyt liittämättä.

Aloita uusimmasta tai kiinnostavimmasta jaksosta, sillä jaksot voi kerätä missä järjestyksessä tahansa.
