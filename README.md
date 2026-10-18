# nimigeneraattori

Nimigeneraattori kirjan hahmoille. Valitse syntymävuosi, niin sivu ehdottaa aikakauteen sopivia suomalaisia etunimiä kolmessa kategoriassa: **hyvin yleinen**, **yleinen** ja **hieman harvinaisempi**.

Sivusto: https://lylled.github.io/nimigeneraattori/

## Kehitys

Vaatii Node.js 22:n ja Python 3:n.

```sh
npm install
npm run dev          # kehityspalvelin
npm run build        # tuotantoversio hakemistoon dist/
npm test             # Vitest
npm run lint         # oxlint
npm run format       # Prettier
```

`main`-haaraan pushattu koodi julkaistaan automaattisesti GitHub Pagesiin (`.github/workflows/deploy.yml`).

## Data

Nimidata kootaan Python-skripteillä hakemistossa `scripts/`:

```sh
python3 scripts/parse_nimipalvelu.py   # käsin kopioidut top 100 -listat → CSV
python3 scripts/first_name_share.py    # ensimmäisen nimen osuudet (avoindata.fi)
python3 scripts/build_decades.py       # yhdistetty ja korjattu taulukko
python3 scripts/build_names_json.py    # selaimen data src/data/names.json
python3 scripts/build_historical_json.py  # historialliset arviot → src/data/historical.json
python3 -m unittest discover -s scripts -p 'test_*.py'
```

Sivulla on kaksi välilehteä. **Nimitilastot** (1900–2026) perustuu DVV:n dataan. **Historialliset nimet** (1700–1899) perustuu käsin koottuihin arvioihin (`data/historical/arviot.txt`), koska ennen vuotta 1900 syntyneistä ei ole kattavaa avointa nimitilastoa.

Datalähteet, niiden rajoitteet ja korjaukset on kuvattu tiedostossa [`docs/data-sources.md`](docs/data-sources.md) ja datan rakenne sekä generointi tiedostossa [`docs/data-schema.md`](docs/data-schema.md). Työlista on tiedostossa [`BACKLOG.md`](BACKLOG.md) ja GitHubin issueissa.

## Lähteet

Lähde: Digi- ja väestötietovirasto, Nimipalvelu ja Väestötietojärjestelmän suomalaisten nimiaineistot (CC BY 4.0).
