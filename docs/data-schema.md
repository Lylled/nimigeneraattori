# Nimidatan rakenne (`src/data/names.json`)

Tiedosto tehdään skriptillä `scripts/build_names_json.py` taulukosta `data/processed/decades.csv` (ks. [data-sources.md](data-sources.md)). Sitä ei muokata käsin. TypeScript-tyypit ovat tiedostossa `src/lib/generator.ts` (`NimiData`).

```json
{
  "lahde": "Digi- ja väestötietovirasto, …",
  "jaksot": [
    { "alku": 1900, "loppu": 1909 },
    { "alku": 2020, "loppu": 2026 }
  ],
  "nimet": {
    "nainen": {
      "1900": [["Maria", 45557, 0.101], ["Anna", 17788, 0.613]]
    },
    "mies": {
      "1900": [["Johannes", 19621, 0.032]]
    }
  }
}
```

| Kenttä | Sisältö |
|---|---|
| `lahde` | Tekijänmerkintä sivulle |
| `jaksot` | Syntymävuosijaksot vanhimmasta uusimpaan. Viimeinen jakso on keskeneräinen (2020–2026). |
| `nimet.<sukupuoli>.<jakson alkuvuosi>` | Jakson nimet yleisimmästä harvinaisimpaan. Rivin kentät ovat `[nimi, lukumäärä, osuus ensimmäisenä etunimenä]`. |

- **Lukumäärä** on Nimipalvelun luku, josta on vähennetty virheellisesti mukana olleet 2020–2026 syntyneet. Siinä ovat mukana sekä ensimmäiset että muut etunimet.
- **Osuus ensimmäisenä etunimenä** (0–1) tulee avoindata.fi:n etunimitilastosta ja kuvaa elossa olevia haltijoita. Generaattori ei vielä käytä sitä (ks. #12).
- Nimet, joiden korjattu lukumäärä on 0, jätetään pois. Siksi jaksolla voi olla alle 100 nimeä.

## Historialliset arviot (`src/data/historical.json`)

Tiedosto tehdään skriptillä `scripts/build_historical_json.py` tiedostosta `data/historical/arviot.txt`. Rakenne on sama kuin yllä, mutta:

- **Lukumäärän tilalla on paino** 1 / sija, koska arvioissa on vain järjestys.
- **Osuus ensimmäisenä etunimenä** on aina 1, koska arviot koskevat ensimmäistä etunimeä.
- **Valinnainen neljäs kenttä** on muoto, jolla nimi kirjattiin kirkonkirjoihin, esim. `["Matti", 1.0, 1, "Matts"]`.
- **Kategoriarajat** ovat `HISTORIARAJAT`: sijat 1–12 ovat hyvin yleisiä, 13–30 yleisiä ja loput hieman harvinaisempia, koska listat ovat lyhyempiä ja nimistö keskittyi harvoihin nimiin.

## Generointi (`src/lib/generator.ts`)

1. **Jaksojen painot** (`jaksoPainot`): syntymävuoden paino jakautuu lineaarisesti kahden lähimmän jakson keskikohtien välillä. Esimerkiksi vuosi 1919 on 55 % 1910-lukua ja 45 % 1920-lukua.
2. **Nimen paino** on sen osuus jakson nimilistan yhteismäärästä kerrottuna jakson painolla, laskettuna yhteen jaksojen yli.
3. **Kategoriat** (`luokittele`) määräytyvät painon mukaisen sijoituksen perusteella:
   - sijat 1–20: hyvin yleinen
   - sijat 21–60: yleinen
   - loput: hieman harvinaisempi

   "Hieman harvinaisempiin" lisätään myös painavimman jakson naapurijaksojen nimet, jotka eivät ole valitun vuoden listoilla.
4. **Arvonta** (`generoi`): kustakin kategoriasta arvotaan painotetusti ilman toistoja. Siemenluvulla tulos on toistettava.
