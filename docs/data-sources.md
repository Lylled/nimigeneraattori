# Datalähteet: DVV 1900 →

Tarinan 2.1 ([#7](https://github.com/Lylled/nimigeneraattori/issues/7)) tulokset. Tarkistettu 17.10.2026.

## Yhteenveto

| Lähde | Vuosikymmenjako | Ensimmäiset / muut etunimet | Kattavuus | Käyttöehdot |
|---|---|---|---|---|
| **Nimipalvelu, nimihaku** | ✅ –1899, 1900–1909 … 2020–2026 | ❌ yhdessä | kaikki nimet, alle 5 piilotettu | robots.txt kieltää kyselyosoitteet |
| **Nimipalvelu, suosituimmat** | ✅ samat jaksot | ❌ yhdessä | vain top 100 / sukupuoli / jakso | robots.txt kieltää kyselyosoitteet |
| **Avoindata.fi, etunimitilasto (XLSX)** | ❌ ei syntymävuosia | ✅ erikseen | kaikki nimet, joilla ≥ 5 haltijaa | CC BY 4.0 |

Yksikään lähde ei sellaisenaan anna sitä, mitä generaattori tarvitsee: kaikki nimet syntymävuosikymmenittäin, mieluiten vain ensimmäiset etunimet, avoimella lisenssillä. Lähteitä kannattaa kuitenkin yhdistää (ks. [Valittu toteutustapa](#valittu-toteutustapa)).

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

1. **Ensimmäiset ja muut etunimet ovat samassa luvussa.** Palvelun mukaan lukuihin sisältyvät *"voimassa olevat etunimet (sekä ensimmäiset että muut etunimet)"*. Siksi listojen kärjessä ovat tyypilliset toiset nimet, kuten Johannes, Olavi, Maria ja Juhani, eivätkä nimet, joilla ihmisiä oikeasti kutsuttiin. Korjausyrityksestä ks. [Havainto](#havainto-ensimmäisen-nimen-osuus-vääristää-vanhoja-jaksoja).
2. **Mukana ovat myös kuolleet**, joista käytetään kuolinhetkellä voimassa olleita nimiä. Vanhimmat ikäluokat kattavat kuitenkin vain ihmiset, jotka ovat päätyneet väestötietojärjestelmään. Siksi käytetään **osuuksia jakson sisällä**, ei absoluuttisia määriä.
3. **Luokka –1899 on yksi kasa**, josta ei näe syntymävuosikymmentä. Siksi se **jätetään pois**, ja Nimipalvelun data alkaa vuodesta 1900. Ennen vuotta 1900 syntyneiden nimet tulevat historiallisesta datasta (E6).
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

## Valittu toteutustapa

DVV:ltä ei pyydetä aineistoa, vaan data kootaan itse.

1. **Top 100 -listat kerätään Nimipalvelusta käsin.** Ohje on tiedostossa [`data/raw/nimipalvelu/README.md`](../data/raw/nimipalvelu/README.md). Jäsennin `scripts/parse_nimipalvelu.py` tuottaa niistä tiedoston `data/processed/nimipalvelu_top100.csv`.
2. **Ensimmäisen nimen osuus** lasketaan avoindata.fi:n etunimitilastosta skriptillä `scripts/first_name_share.py`. Tulos on tiedostossa `data/processed/first_name_share.csv`.
3. **Yhdistäminen:** `scripts/build_decades.py` tuottaa tiedoston `data/processed/decades.csv`. Siinä jokaisen nimen luku on korjattu Nimipalvelun virheen osalta (ks. alla), ja mukana on myös ensimmäisen nimen osuudella korjattu sija.
4. **Kategoriat sijoituksen mukaan** (tarkennetaan tarinassa 3.1):
   - hyvin yleinen: sijat 1–20
   - yleinen: sijat 21–60
   - hieman harvinaisempi: sijat 61–100 sekä nimet, jotka olivat top 100:ssa viereisellä jaksolla mutta eivät tällä

### Havainto: top 100 -listoissa on mukana 2020–2026 syntyneet

Kaikki 13 jaksoa 1900–1909 … 2020–2026 on kerätty (2 600 riviä). Kerätessä huomattiin, että Nimipalvelun **Suosituimmat etunimet** -listoilla jokaisen vanhemman jakson lukuun on lisätty myös vuosina 2020–2026 syntyneet. Esimerkiksi Ainon luvut nimihaussa (17.10.2026) ja top 100 -listoilla:

| Jakso | Nimihaku | Top 100 -lista | Erotus |
|---|---|---|---|
| –1899 | 5 127 | 9 653 | 4 526 |
| 1920–1929 | 11 504 | 16 030 | 4 526 |
| 1970–1979 | 699 | 5 225 | 4 526 |
| 2020–2026 | 4 526 | 4 526 | 0 |

Erotus on kaikilla jaksoilla täsmälleen sama kuin 2020–2026 syntyneiden Ainojen määrä. Virheen takia nykyään suositut nimet päätyvät vanhoille listoille. Esimerkiksi *Aava* (2 350), *Isla*, *Noel*, *Hilla* ja *Livia* olivat jakson –1899 top 100:ssa, vaikka niiden todellinen määrä on 0. Myös esimerkiksi Isla (2 078) on 1900–1909-listalla.

**Korjaus** (`scripts/build_decades.py`): jokaisen vanhemman jakson luvusta vähennetään nimen 2020–2026-luku (`lukumaara_korjattu`), ja nimet järjestetään uudelleen (`sija_korjattu`).
- Jos nimi ei ole 2020–2026 top 100:ssa, sen 2020–2026-luku on alle listan pienimmän luvun (noin 800) mutta muuten tuntematon. Silloin mitään ei vähennetä, ja rivi merkitään `korjaus_epavarma = 1`.
- Virheen takia osa todellisista sijoista 90–100 on jäänyt listoilta pois. Korjattuja listoja kannattaa siksi käyttää noin 90 ensimmäiseen sijaan asti.

Korjauksen jälkeen jakso 1900–1909 näyttää aikakaudelle uskottavalta. Miehillä kärjessä ovat Johannes, Eino, Väinö, Toivo ja Juho, naisilla Maria, Anna, Martta, Hilja ja Tyyne.

### Havainto: ensimmäisen nimen osuus vääristää vanhoja jaksoja

Testiajo vuoden 1920 sivuilla 1 ja 10 osoitti, että osuus kuvaa **nykyisiä elossa olevia** haltijoita, ei 1920-luvulla syntyneitä:

- *Leevi* (osuus 0,86), *Ella* (0,80) ja *Aava* (0,63) ovat nykyään suosittuja kutsumanimiä. Korjaus nostaa ne 1920-luvulla kärkeen, vaikka silloin ne olivat todennäköisemmin toisia nimiä.
- *Armas* (0,06) ja *Kyllikki* (0,03) olivat 1920-luvulla yleisiä kutsumanimiä, mutta elossa olevilla haltijoilla ne ovat enimmäkseen toisia nimiä. Korjaus pudottaa ne liian alas.
- Klassiset toiset nimet, kuten *Johannes* (0,03), *Olavi* (0,04) ja *Antero* (0,01), korjautuvat oikeaan suuntaan.

**Johtopäätös:** korjausta ei käytetä sellaisenaan sijoitusten uudelleenjärjestämiseen, ainakaan ennen 1960-lukua. `decades.csv` sisältää kuitenkin molemmat sijat, joten ratkaisu tehdään tarinassa 3.1 oikean, kerätyn datan perusteella. Vaihtoehtoja ovat esimerkiksi:
- alkuperäiset sijat sellaisinaan
- korjaus vain uusimmille jaksoille
- matalan osuuden nimien merkitseminen "usein toisena nimenä" ja niiden käyttö toisen etunimen generoinnissa (#23)

### Tekijänmerkintä

Sivulle ja READMEen lisätään: *"Lähde: Digi- ja väestötietovirasto, Väestötietojärjestelmän suomalaisten nimiaineistot, CC BY 4.0."*
