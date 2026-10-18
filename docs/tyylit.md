# Nimityylit

Jokaisella nimellä on yksi tai useampi tyyli. Tagit ovat tiedostossa [`data/styles/tyylit.csv`](../data/styles/tyylit.csv), josta `scripts/build_styles_json.py` tekee selaimen käyttämän tiedoston `src/data/styles.json`. Tyylisuodatin näyttää nimet, joilla on **jokin** valituista tyyleistä.

Tagit on tehty käsin (Claude, tarkistettavissa). Korjaukset tehdään suoraan CSV:hen ja ajetaan skripti uudelleen. Skripti pysähtyy virheeseen, jos jokin datan nimi on tagaamatta. Siksi uudet nimet on tagattava ennen kuin ne pääsevät sivulle.

| Tyyli | Avain | Määritelmä | Esimerkkejä |
|---|---|---|---|
| Luonto | `luonto` | Nimen taustalla on luontoon liittyvä sana: kasvi, eläin, sää, vuodenaika, taivaankappale tai maisema. | Lumi, Pihla, Vuokko, Suvi, Otso, Vesa, Luna |
| Raamatullinen | `raamatullinen` | Raamatusta tunnistettava nimi tai sen läheinen muoto. Kansanomaiset muunnelmat (Matti, Antti, Pekka) eivät kuulu tähän, koska niitä ei enää mielletä raamatullisiksi. | Saara, Ester, Elias, Joona, Samuel, Iisakki |
| Kansallisromanttinen | `kansallisromanttinen` | Kalevalan ja kansanrunouden nimet, muinaisnimet sekä kansallisen heräämisen aikana suosiin nostetut suomenkieliset nimet. | Aino, Kyllikki, Väinö, Ilmari, Untamo, Suoma |
| Hyve- ja tunne | `hyve` | Nimi on hyveen, tunteen tai hellittelyn sana. | Toivo, Lempi, Rauha, Onni, Armas, Sulo, Tyyne |
| Perinteinen | `perinteinen` | Suomalaistuneet almanakkanimet. Ne ovat vierasperäisiä (useimmiten kristillisiä tai germaanisia) nimiä suomalaisessa asussa, ja mukana ovat myös 1900-luvun lyhentyneet muodot. | Matti, Kaisa, Juho, Liisa, Pirjo, Timo |
| Säätyläinen | `saatylainen` | Aatelin, papiston ja porvariston suosimat eurooppalaiset nimet. **Valittavissa vain Historialliset nimet -välilehdellä.** 1900-luvulta alkaen samoista nimistä tuli valtavirtaa, joten jako ei enää kerro säädystä. | Fredrik, Gustaf, Charlotta, Ottilia, Aurora |
| Kansainvälinen | `kansainvalinen` | Nimi on samanlainen monessa eri kielessä. | Anna, Maria, Emma, Leo, Daniel, Sofia |

## Huomioita

- Nimellä voi olla useita tyylejä, esim. Aurora (luonto, säätyläinen, kansainvälinen) ja Lempi (kansallisromanttinen, hyve).
- Ennen 1880-lukua syntyneillä ei ole luonto-, hyve- eikä kansallisromanttisia nimiä. Tämä on historiallisesti oikein, koska nimet tulivat käyttöön vasta kansallisen heräämisen aikaan. Sivu kertoo tyhjästä tuloksesta.
- Miesten luontonimiä on top 100 -listoilla vähän (Otso, Ahti, Tapio, Vesa). Harvinaisempia nimiä voidaan myöhemmin lisätä top 100 -listojen ulkopuolelta.
