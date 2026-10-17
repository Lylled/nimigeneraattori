# Datalähteet: DVV 1900 →

Tarinan 2.1 ([#7](https://github.com/Lylled/nimigeneraattori/issues/7)) tulokset. Tarkistettu 17.10.2026.

## Yhteenveto

| Lähde | Vuosikymmenjako | Ensimmäiset / muut etunimet | Kattavuus | Käyttöehdot |
|---|---|---|---|---|
| **Nimipalvelu, nimihaku** | ✅ –1899, 1900–1909 … 2020–2026 | ❌ yhdessä | kaikki nimet, alle 5 piilotettu | robots.txt kieltää kyselyosoitteet |
| **Nimipalvelu, suosituimmat** | ✅ samat jaksot | ❌ yhdessä | vain top 100 / sukupuoli / jakso | robots.txt kieltää kyselyosoitteet |
| **Avoindata.fi, etunimitilasto (XLSX)** | ❌ ei syntymävuosia | ✅ erikseen | kaikki nimet, joilla ≥ 5 haltijaa | CC BY 4.0 |

Yksikään lähde ei sellaisenaan anna sitä, mitä generaattori tarvitsee: kaikki nimet syntymävuosikymmenittäin, mieluiten vain ensimmäiset etunimet, avoimella lisenssillä. Lähteitä kannattaa kuitenkin yhdistää (ks. [Suositus](#suositus)).

## 1. DVV:n Nimipalvelu

https://nimipalvelu.dvv.fi/. Aineisto päivittyy jatkuvasti (tarkistushetkellä päivitetty 12.10.2026).

### Etunimihaku: `/etunimihaku?nimi=<nimi>`

Yhdelle nimelle näytetään haltijoiden määrä syntymävuosikymmenittäin ja sukupuolittain. Esimerkki *Aino*:

| Syntymävuodet | Miehiä | Naisia | Yhteensä |
|---|---|---|---|
| –1899 | 45 | 5 127 | 5 172 |
| 1900–1909 | 21 | 8 442 | 8 463 |
| 1910–1919 | 5 | 10 594 | 10 599 |
| 1920–1929 | alle 5 | 11 504 | alle 11 509 |
| 1930–1939 | 0 | 7 166 | 7 166 |
| … | | | |
| 1970–1979 | 0 | 699 | 699 |
| 2010–2019 | 0 | 8 638 | 8 638 |
| 2020–2026 | 0 | 4 526 | 4 526 |

- Jaksot ovat –1899 (yksi yhteinen luokka), sen jälkeen vuosikymmenet ja lopuksi keskeneräinen 2020–2026.
- Alle viiden haltijan määrät näytetään muodossa "alle 5".
- Data on palvelinrenderöidyssä HTML:ssä (Next.js), joten se olisi teknisesti helppo jäsentää.

### Suosituimmat etunimet: `/suosituimmat-etunimet?vuosikymmen=<vuosi>&sivu=<1–10>`

- Lista sisältää 100 suosituinta nimeä sukupuolta kohden jokaiselta jaksolta, 10 nimeä sivulla.
- `vuosikymmen`: `1899` (= –1899), `1900`, `1910` … `2020`.
- Esimerkki 1920–1929: miehet Johannes 37 850, Olavi 34 853, Ilmari 17 359 …; naiset Maria 35 757, Annikki 21 846, Aino 16 030 …
- Sadas nimi on noin 2 000 haltijan kohdalla (1920-luvulla miehillä Veli 2 039 ja naisilla Elviira 2 279). Top 100 riittää siis kategorioille "hyvin yleinen" ja "yleinen", mutta ei kategorialle **"hieman harvinaisempi"**.

### Rajoitteet

1. **Ensimmäiset ja muut etunimet ovat samassa luvussa.** Palvelun mukaan lukuihin sisältyvät *"voimassa olevat etunimet (sekä ensimmäiset että muut etunimet)"*. Siksi listojen kärjessä ovat tyypilliset toiset nimet, kuten Johannes, Olavi, Maria ja Juhani, eivätkä nimet, joilla ihmisiä oikeasti kutsuttiin. Tämä pitää korjata (ks. [Suositus](#suositus)).
2. **Mukana ovat myös kuolleet**, joista käytetään kuolinhetkellä voimassa olleita nimiä. Vanhimmat ikäluokat kattavat kuitenkin vain ihmiset, jotka ovat päätyneet väestötietojärjestelmään. Siksi käytetään **osuuksia jakson sisällä**, ei absoluuttisia määriä.
3. **Luokka –1899 on yksi kasa**, eikä sitä voi jakaa vuosikymmeniin. Historiallinen data (E6) kattaa tämän ajan paremmin.
4. **robots.txt** (`User-Agent: * / Disallow: /*?*`) kieltää kaikkien kyselyparametrillisten osoitteiden automaattisen haun. Juuri niissä data on. **Nimipalvelua ei siis pidä kaapia automaattisesti.** Tätä selvitystä varten haettiin käsin muutama yksittäinen sivu.

## 2. Avoindata.fi: Väestötietojärjestelmän suomalaisten nimiaineistot

- Aineistosivu: https://www.avoindata.fi/data/fi/dataset/none
- Tiedosto: `etunimitilasto-2026-08-04-dvv.xlsx` (sukunimet erikseen tiedostossa `sukunimitilasto-…`)
- **Lisenssi: CC BY 4.0.** Julkaisija on Digi- ja väestötietovirasto, ja aineisto päivitetään muutaman kerran vuodessa.

Välilehdet (rivejä otsikko mukaan lukien):

| Välilehti | Sisältö | Rivejä |
|---|---|---|
| Miehet kaikki | kaikki etunimet | 11 019 |
| Miehet ens | vain ensimmäiset etunimet | 7 396 |
| Miehet muut | vain muut etunimet | 5 981 |
| Naiset kaikki / ens / muut | vastaavat naisille | 14 333 / 9 745 / 7 342 |
| Saate | kuvaus | – |

- Mukana ovat vain **elossa olevat** Suomen kansalaiset.
- Nimet, joilla on alle 5 haltijaa, puuttuvat.
- **Syntymävuosia ei ole**, joten tiedostoa ei voi yksinään käyttää aikakauden mukaan.
- Esimerkki: miesten kaikkien nimien kärjessä on Juhani (270 972), josta 263 917 on toisena nimenä. Ensimmäisten nimien kärjessä ovat Juha, Timo ja Mikko.

## 3. Muut havainnot

- DVV on aiemmin julkaissut suosituimmat etunimet syntymävuosittain ja kunnittain vuosilta 1969–2019. Aineistoa ei löytynyt avoindata.fi:n hausta, joten sen nykyinen sijainti on selvittämättä. Siitä voisi olla hyötyä validoinnissa (#10).
- Lehdistössä julkaistaan vuosittaiset vastasyntyneiden suosikkinimet (esim. STT:n tiedotteet). Niillä voi tarkistaa uusimpien vuosikymmenten tuloksia.

## Suositus

1. **Pyydetään DVV:ltä aineisto suoraan.** Pyydettävä sisältö: etunimet × sukupuoli × syntymävuosikymmen, mieluiten ensimmäiset ja muut etunimet erikseen.
   - Perustelut: ei-kaupallinen harrastus- ja esittelyprojekti, ja vastaava data on jo julkisesti nähtävillä Nimipalvelussa.
   - Yhteystieto avoindata.fi:n mukaan: organisaatiopalvelut@dvv.fi.
   - Jos aineisto saadaan, ongelmat 1 ja 4 ratkeavat kerralla, ja tarinan 2.2 keruuskripti muuttuu tiedoston jäsentämiseksi.
2. **Varasuunnitelma, jos DVV ei toimita aineistoa**:
   - Ensimmäisten ja muiden nimien osuus lasketaan avoindata-XLSX:stä nimikohtaisesti. Esimerkiksi Juhani on ensimmäisenä nimenä vain noin 3 %:ssa tapauksista.
   - Nimipalvelun vuosikymmenluvut kerrotaan tällä kertoimella. Näin saadaan arvio ensimmäisten nimien määrästä jaksoittain.
   - Vuosikymmenluvut haetaan Nimipalvelusta **käsin** vain rajatulle nimijoukolle (esim. top 100 per jakso). Kerroin on arvio, koska nimen käyttö toisena nimenä on vaihdellut aikakausittain.
   - Tällä tavalla "hieman harvinaisempi" -kategorialle jää vähän nimiä. Se on varasuunnitelman suurin heikkous.
3. **Tekijänmerkintä** lisätään sivulle ja READMEen: *"Lähde: Digi- ja väestötietovirasto, Väestötietojärjestelmän suomalaisten nimiaineistot, CC BY 4.0."*

## Avoimet päätökset

- [ ] Lähetetäänkö DVV:lle aineistopyyntö? Pyyntöä ei ole lähetetty.
- [ ] Jos DVV ei vastaa: hyväksytäänkö varasuunnitelma rajoitteineen?
