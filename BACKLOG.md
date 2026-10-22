# Nimigeneraattori – product backlog

Nimigeneraattori kirjan hahmoille: käyttäjä valitsee syntymävuoden (1650 →) ja sukupuolen, ja sivu ehdottaa aikakauteen sopivia nimiä kolmessa kategoriassa: **hyvin yleinen**, **yleinen** ja **hieman harvinaisempi**.

## Työtapa

- Työ etenee oman aikataulun mukaan, ilman sprinttejä tai määräaikoja.
- **Epic** on isompi kokonaisuus, ja **tarina** on yksi kerralla tehtävä työ.
- Epicit ovat tärkeysjärjestyksessä: E1–E4 muodostavat ensimmäisen toimivan version (MVP), ja loput ovat jatkokehitystä.
- **SP** (story point) kuvaa tarinan suhteellista kokoa (1, 2, 3, 5, 8), ei aikaa. Yli 8 pisteen tarinat pilkotaan.

### Definition of Done

- [ ] Koodi on `main`-haarassa ja build menee läpi
- [ ] Generointilogiikalla on yksikkötestit
- [ ] Ominaisuus toimii julkaistulla sivulla (GitHub Pages)
- [ ] Datan lähteet ja käsittelyvaiheet on dokumentoitu
- [ ] Tekoälyn tuottama sisältö on tarkistettu käsin ennen julkaisua

---

## E1 – Projektin pystytys

**Tavoite:** tyhjä mutta toimiva sivu on julkaistuna, ja datan muoto on sovittu.

| # | Tarina | SP |
|---|---|---|
| 1.1 | **Frontend-projekti:** Vite + React + TypeScript, ESLint ja Prettier.<br>*Valmis kun:* `npm run dev` ja `npm run build` toimivat. | 2 |
| 1.2 | **Julkaisu:** GitHub Actions -workflow julkaisee `main`-haaran GitHub Pagesiin.<br>*Valmis kun:* sivu aukeaa julkisesta osoitteesta. | 2 |
| 1.3 | **Datan skeema:** määritellään `names.json`-rakenne (nimi, sukupuoli, jakso, osuus, kirjattu ja puhuttu muoto, tyylitagit, lähde, datan laatu) ja sille TypeScript-tyypit.<br>*Valmis kun:* skeema on dokumentoitu ja esimerkkitiedosto validoituu. | 3 |
| 1.4 | **README:** projektin kuvaus, ajo-ohjeet ja datalähteiden luettelo. | 1 |

## E2 – DVV-data 1900 →

**Tavoite:** luotettavat nimien osuudet vuosikymmenittäin 1900-luvun alusta tähän päivään.

| # | Tarina | SP |
|---|---|---|
| 2.1 | **Lähdeselvitys:** mitä DVV:n Nimipalvelusta ja avoindata.fi:stä saa (vuosikymmenjako, sukupuoli, ensimmäinen vs. muut etunimet) ja millä lisenssillä.<br>*Valmis kun:* lähteet, rajoitteet ja valittu hakutapa on kirjattu `docs/data-sources.md`:hen. | 3 |
| 2.2 | **Keruuskripti (Python):** lataa ja parsii nimet vuosikymmenittäin ja tallentaa raakadatan välimuistiin, jotta sivustoa ei kuormiteta turhaan.<br>*Valmis kun:* kaikki vuosikymmenet on haettu kumpaankin sukupuoleen. | 5 |
| 2.3 | **Normalisointi:** lukumäärät osuuksiksi syntyneistä ja tallennus skeeman mukaiseen JSONiin.<br>*Valmis kun:* jokaiselle vuosikymmenelle on osuudet. | 3 |
| 2.4 | **Datan validointi:** vertaillaan muutamaa vuosikymmentä tunnettuihin top-listoihin ja tarkistetaan, vääristävätkö toiset etunimet tuloksia.<br>*Valmis kun:* havainnot on dokumentoitu ja tarvittavat korjaukset tehty. | 2 |

## E3 – Generointilogiikka

**Tavoite:** puhdas, testattu moduuli, joka palauttaa nimet kategorioittain.

| # | Tarina | SP |
|---|---|---|
| 3.1 | **Yleisyyskategoriat:** nimet jaetaan osuuden perusteella kolmeen ryhmään (alkuarvot: hyvin yleinen > 1 %, yleinen 0,2–1 %, hieman harvinaisempi 0,03–0,2 %). Rajat ovat konfiguroitavissa.<br>*Valmis kun:* kategoriat tuntuvat järkeviltä usealla vuosikymmenellä. | 3 |
| 3.2 | **Vuosiluvun interpolointi:** tarkka vuosi painottaa viereisiä jaksoja (esim. 1919 ≈ 1910-luku + vähän 1920-lukua), joten raja ei ole jyrkkä. | 3 |
| 3.3 | **Painotettu arvonta:** kategorian sisällä yleisemmät nimet tulevat useammin, eikä sama nimi toistu yhdellä generointikerralla.<br>Tuetaan siemenlukua, jotta testit ovat toistettavia. | 2 |
| 3.4 | **Yksikkötestit (Vitest):** testit kategorioille, interpoloinnille ja arvonnalle. | 2 |

## E4 – Käyttöliittymä (MVP)

**Tavoite:** käyttäjä saa sivulta aikakauteen sopivia nimiä.

| # | Tarina | SP |
|---|---|---|
| 4.1 | **Hakulomake:** vuosi tai vuosikymmen (liukusäädin ja tekstikenttä) sekä sukupuoli (nainen / mies / molemmat). | 3 |
| 4.2 | **Tulosnäkymä:** kolme saraketta kategorioittain ja *Generoi uudelleen* -nappi. | 3 |
| 4.3 | **Suosikit:** nimen voi tallentaa listaan (localStorage) ja kopioida leikepöydälle. | 2 |
| 4.4 | **Responsiivisuus ja saavutettavuus:** sivu toimii mobiilissa ja näppäimistöllä, ja kontrastit ovat kunnossa. | 2 |

## E5 – Lisäsuodattimet

| # | Tarina | SP |
|---|---|---|
| 5.1 | **Alkukirjain:** suodatin yhdelle tai useammalle kirjaimelle.<br>Jos kategoriaan ei jää nimiä, näytetään selkeä ilmoitus. | 2 |
| 5.4 | **Jaettava URL:** hakuasetukset tallentuvat osoitteeseen (`?v=1885&s=n`). | 1 |

## E6 – Historiallinen data 1650–1899

**Tavoite:** nimien yleisyydet kirkonkirjoista (HisKi) 25 vuoden jaksoille.

**Tilanne:** HisKin robots.txt kieltää automaattiset haut, ja käsin haettu otos jää pieneksi. Siksi vuodet 1700–1899 on toteutettu ensin **arvioina** omalle välilehdelleen (`data/historical/arviot.txt`, ks. docs/data-sources.md). Kirjattu ja puhuttu muoto (6.5) ja UI (6.7) on tehty arvioiden osalta. Arvioita voi myöhemmin tarkentaa tai korvata HisKi-otoksilla.

| # | Tarina | SP |
|---|---|---|
| 6.1 | **HisKin käyttöehdot ja hakutapa:** selvitetään, mitä saa hakea ja kuinka tiheästi, sekä miten kastettujen tiedot saadaan ulos.<br>*Valmis kun:* menetelmä on kirjattu ja käyttöehdot tarkistettu. | 3 |
| 6.2 | **Otantasuunnitelma:** valitaan pitäjät eri puolilta Suomea (länsi, itä, pohjoinen, rannikon ruotsinkieliset alueet) ja määritellään jaksot (1650–1674, …, 1875–1899).<br>*Valmis kun:* jokaisella jaksolla on riittävä otos (tavoite vähintään muutama tuhat kastetta). | 2 |
| 6.3 | **Keruuskripti:** kohtuullinen hakutahti ja välimuisti. | 5 |
| 6.4 | **Nimimuotojen yhdistäminen:** kirjoitusasun variantit yhdistetään yhdeksi lemmaksi (Matts / Mattias / Matthias → Matts).<br>Tekoäly ehdottaa ryhmittelyt, jotka tarkistetaan käsin. | 5 |
| 6.5 | **Kirjattu ja puhuttu muoto:** jokaiselle nimelle aikakauden suomenkielinen puhemuoto (Carin → Kaarina / Kaisa).<br>Tekoäly ehdottaa, käsin tarkistetaan. | 3 |
| 6.6 | **Liitos DVV-dataan:** vuoden 1900 ympäristö tarkistetaan, ettei kategorioissa ole hyppäyksiä.<br>Jaksot yhdistetään yhdeksi aikajanaksi. | 3 |
| 6.7 | **UI historialliselle datalle:** näytetään kirjattu ja puhuttu muoto sekä datan laatuindikaattori (esim. "otos 3 200 kastetta"). | 3 |

## E7 – Nimityylit tekoälyn avulla

**Periaate:** tekoäly ajetaan kerran datan rakennusvaiheessa, ei sivun käytön aikana.

**Tilanne:** tyylit on toteutettu. Nimiä oli vain 592, joten ne tagattiin käsin istunnossa ilman API-skriptiä (7.2). Tagit ovat tiedostossa `data/styles/tyylit.csv` ja niitä korjataan suoraan siihen (7.3). Tyylit: luonto, raamatullinen, kansallisromanttinen, hyve- ja tunne, perinteinen, säätyläinen (vain historia) ja kansainvälinen; ks. docs/tyylit.md. Suomenruotsalaiset ja ortodoksiset nimet on toteutettu erikseen nimiperinteinä (arviot, lähteet tiedostoissa data/traditions/*.txt).

| # | Tarina | SP |
|---|---|---|
| 7.1 | **Tyylikategoriat:** sovitaan luokittelu (esim. luonto, raamatullinen, kansallisromanttinen / kalevalainen, ruotsalainen, kuninkaallinen / säätyläis, pyhimys / almanakka, moderni) ja kirjoitetaan jokaiselle määritelmä ja esimerkit. | 2 |
| 7.2 | **Batch-skripti (Claude API):** nimet tagataan tyyleillä, ja tulos tallennetaan JSONiin. API-avain pidetään vain paikallisesti, ei repossa. | 3 |
| 7.3 | **Käsintarkistus:** tagit käydään läpi ja korjaukset tallennetaan erilliseen override-tiedostoon, jotta ne säilyvät uudelleenajoissa. | 3 |
| 7.4 | **Tyylisuodatin UI:hin.** | 2 |

## E8 – Nimien lisätiedot (valinnainen)

**Tilanne:** suosiokäyrä (8.1) ja kuvaukset (8.2) on tehty nimikorttiin. Kuvaukset on kirjoitettu tekoälyn avustamana, ja ne odottavat käsintarkistusta (`data/info/kuvaukset.tsv`). Nimipäivä (8.3) jätetään pois: suomalaisten ja suomenruotsalaisten nimipäiväluetteloiden tekijänoikeus kuuluu Helsingin yliopistolle.

| # | Tarina | SP |
|---|---|---|
| 8.1 | **Suosiokäyrä:** nimen osuus aikajanalla pienenä kaaviona. | 3 |
| 8.2 | **Lyhyt kuvaus nimestä:** alkuperä ja muotikausi. Tekoälyn tuottama ja käsin tarkistettu. | 3 |
| 8.3 | **Nimipäivä:** nykyisen almanakan mukainen nimipäivä, jos sellainen on. | 2 |

## E9 – Esittelyprojektin viimeistely

| # | Tarina | SP |
|---|---|---|
| 9.1 | **Metodologia-sivu:** datalähteet, otanta, kategorioiden rajat, rajoitteet ja tekoälyn osuus. | 2 |
| 9.2 | **Ulkoasu:** typografia, värit ja aikakauden henki (esim. kirkonkirja-teema historiallisille vuosille). | 3 |
| 9.3 | **README esittelyä varten:** kuvakaappaukset, arkkitehtuuri ja linkki julkaistuun sivuun. | 1 |
| 9.4 | **Suorituskyky:** JSON jaetaan aikajaksoittain, ja Lighthouse-pisteet ovat yli 90. | 2 |

## E10 – Sukunimet ja talonnimet

**Tilanne:** toteutettu. Mukana on 621 sukunimeä DVV:n sukunimitilastosta, ja niille on arvioitu tyyppi, alue ja käyttöönottovuosi. Historiallisille nimille generoidaan aikakauden mukainen isännimi ja talonnimi. Merkinnät odottavat käsintarkistusta (`data/surnames/sukunimet.tsv`).

| # | Tarina | SP |
|---|---|---|
| 10.1 | **Lähdeselvitys:** DVV:n sukunimitilasto, historialliset sukunimet ja talonnimet (HisKi). | 3 |
| 10.2 | **Aikakauden ja alueen mukainen logiikka:** ennen vuoden 1920 nimilakia Länsi-Suomessa patronyymi ja talonnimi (*Matti Juhonpoika Ylitalo*), Itä-Suomessa vanhat sukunimet, säätyläisillä ruotsalaiset nimet. | 8 |
| 10.3 | **Alueen valinta UI:hin** ja koko nimen generointi. | 3 |
