const REPO = 'https://github.com/Lylled/nimigeneraattori'

const tiedosto = (polku: string) => (
  <a href={`${REPO}/blob/main/${polku}`}>
    <code>{polku}</code>
  </a>
)

/** Metodologia: mistä nimet tulevat, miten ne luokitellaan ja mitä rajoitteita on. */
export default function Menetelmat() {
  return (
    <article className="menetelmat">
      <p>
        <a href="#">← Takaisin generaattoriin</a>
      </p>
      <h1>Menetelmät ja lähteet</h1>
      <p className="lead">
        Mistä nimet tulevat, miten niiden yleisyys arvioidaan ja mihin tuloksiin
        voi luottaa.
      </p>

      <section>
        <h2>Lyhyesti</h2>
        <p>
          Generaattori arpoo nimiä, jotka olivat käytössä valittuna
          syntymävuonna. Vuodesta 1900 alkaen nimet perustuvat Digi- ja
          väestötietoviraston tilastoihin. Sitä vanhemmat nimet ja
          nimiperinteiden listat ovat <strong>arvioita</strong>, koska kattavaa
          avointa tilastoa ei ole. Koko aineisto on sivun mukana, eikä sivu
          lähetä hakuja minnekään.
        </p>
      </section>

      <section>
        <h2>Nimitilastot 1900–2026</h2>
        <ul>
          <li>
            <strong>Lähde:</strong> DVV:n Nimipalvelun 100 yleisintä etunimeä
            jokaiselta syntymävuosikymmeneltä kummallekin sukupuolelle (CC BY
            4.0). Palvelu kieltää automaattiset haut, joten listat kopioitiin
            käsin.
          </li>
          <li>
            <strong>Korjaus:</strong> Nimipalvelun listoilla jokaisen
            vuosikymmenen lukuun oli lisätty myös 2020–2026 syntyneet, jolloin
            nykyiset suosikkinimet näkyivät jo 1900-luvun alussa. Luvut on
            korjattu vähentämällä uusimman jakson määrä.
          </li>
          <li>
            <strong>Toiset nimet mukana:</strong> luvuissa ovat kaikki etunimet,
            joten listoilla korostuvat tyypilliset toiset nimet, kuten Johannes,
            Olavi ja Maria.
          </li>
          <li>
            <strong>Osuudet, ei määrät:</strong> vanhimmista ikäluokista
            tilastossa ovat vain väestötietojärjestelmään päätyneet, joten nimiä
            verrataan osuuksina oman vuosikymmenensä sisällä.
          </li>
        </ul>
      </section>

      <section>
        <h2>Historialliset nimet 1700–1899</h2>
        <p>
          Ennen vuotta 1900 syntyneistä ei ole avointa nimitilastoa. Siksi
          historialliset nimet ovat käsin koottuja yleisyysjärjestyksiä kuudelle
          jaksolle ({tiedosto('data/historical/arviot.txt')}). Ne on verrattu
          HisKi-hakemiston kastettujen otokseen vuodelta 1890, Tuomas Salsteen
          vuosikymmenlistoihin 1860–1899 sekä Hellevi Arjavan ja Eero Kiviniemen
          nimitutkimuksiin.
        </p>
        <p>
          Koska lukumääriä ei ole, nimen painoksi annetaan 1 / sija. Ennen
          vuotta 1860 nimet ovat suomenkielisinä puhemuotoina, ja suluissa on
          muoto, jolla ne kirjattiin ruotsinkielisiin kirkonkirjoihin (Matti →
          Matts).
        </p>
      </section>

      <section>
        <h2>Nimiperinteet</h2>
        <p>
          Väestötiedoissa nimiä ei eritellä äidinkielen tai uskontokunnan
          mukaan, joten suomenruotsalaisen ja ortodoksisen perinteen listat ovat
          arvioita. Suomenruotsalaisten uusimmat nimet perustuvat DVV:n
          tiedotteisiin, ortodoksiset Outi Patronen ja Denis Kuzminin
          tutkimuksiin karjalaisten nimistä. Lähteet on lueteltu tiedostoissa{' '}
          {tiedosto('data/traditions/suomenruotsalainen.txt')} ja{' '}
          {tiedosto('data/traditions/ortodoksinen.txt')}.
        </p>
      </section>

      <section>
        <h2>Yleisyysluokat ja arvonta</h2>
        <ul>
          <li>
            <strong>Vuosien välissä:</strong> syntymävuosi painottaa kahta
            lähintä jaksoa, joten esimerkiksi 1919 on hieman yli puoliksi
            1910-lukua ja loput 1920-lukua. Raja ei siis ole jyrkkä.
          </li>
          <li>
            <strong>Tilastoissa</strong> 20 yleisintä nimeä ovat{' '}
            <em>hyvin yleisiä</em>, sijat 21–60 <em>yleisiä</em> ja loput{' '}
            <em>hieman harvinaisempia</em>. Arvioiduissa listoissa rajat ovat 12
            ja 30, koska listat ovat lyhyempiä ja nimistö keskittyi harvoihin
            nimiin.
          </li>
          <li>
            <strong>Harvinaisempiin</strong> lisätään viereisten jaksojen nimiä,
            jotka eivät ole valitun vuoden listalla. Ne olivat käytössä, mutta
            eivät aivan yleisimpiä.
          </li>
          <li>
            <strong>Arvonta</strong> painottaa yleisempiä nimiä, eikä sama nimi
            toistu samalla kerralla. Tyyli- ja alkukirjainsuodattimet eivät
            muuta nimen luokkaa.
          </li>
        </ul>
      </section>

      <section>
        <h2>Sukunimet</h2>
        <p>
          Sukunimet ovat DVV:n sukunimitilastosta (CC BY 4.0): 500 yleisintä ja
          121 täydentävää nimeä, kuten saamelaisia, karjalaisia, sääty- ja
          sotilasnimiä. Tilasto kertoo vain nykyiset kantajat, joten jokaisen
          nimen tyyppi, alue ja käyttöönottoaika on arvioitu (
          {tiedosto('data/surnames/sukunimet.tsv')}).
        </p>
        <p>
          Nimimuoto valitaan aikakauden ja alueen mukaan: Itä-Suomessa
          perinnöllinen sukunimi, Länsi-Suomessa ennen 1880-lukua isännimi ja
          talonnimi. Siirtymä sukunimiin etenee tasaisesti sukunimilakiin 1920
          asti. Sukunimi kelpaa, jos se oli käytössä viimeistään hahmon ollessa
          25-vuotias.
        </p>
      </section>

      <section>
        <h2>Tekoälyn osuus</h2>
        <p>
          Tekoälyä ei käytetä sivun käytön aikana: kaikki nimet ja tiedot ovat
          valmiina aineistona. Tekoäly on avustanut seuraavissa:
        </p>
        <ul>
          <li>
            historiallisten ja nimiperinteiden arvioiden kokoaminen lähteiden ja
            nimihistorian yleistiedon pohjalta
          </li>
          <li>nimien tyylimerkinnät ({tiedosto('data/styles/tyylit.csv')})</li>
          <li>
            etu- ja sukunimien alkuperät ja kuvaukset sekä sukunimien tyypit,
            alueet ja käyttöönottoajat
          </li>
          <li>sivuston koodi</li>
        </ul>
        <p>
          Merkinnät ovat tekstitiedostoissa, joita voi korjata käsin, mutta
          niitä ei ole vielä tarkistettu kokonaan. Niissä voi siis olla
          virheitä.
        </p>
      </section>

      <section>
        <h2>Rajoitteet</h2>
        <ul>
          <li>
            Tilastoissa on vain 100 yleisintä nimeä vuosikymmentä ja sukupuolta
            kohden, joten todella harvinaisia nimiä ei tule.
          </li>
          <li>
            Toiset etunimet nostavat esimerkiksi Johanneksen ja Marian
            yleisemmiksi kuin ne olivat kutsumaniminä.
          </li>
          <li>
            Ennen vuotta 1900 ja nimiperinteissä yleisyys on arvio, ei
            tilastotieto. Alueellisia eroja etunimissä ei ole mallinnettu.
          </li>
          <li>
            Sukunimien tyypit, alueet ja ajat ovat yleistyksiä; moni nimi on
            syntynyt useaan kertaan eri tavoin.
          </li>
        </ul>
      </section>

      <section>
        <h2>Lisätietoja</h2>
        <p>
          Tarkempi kuvaus lähteistä ja korjauksista on tiedostossa{' '}
          {tiedosto('docs/data-sources.md')} ja datan rakenteesta tiedostossa{' '}
          {tiedosto('docs/data-schema.md')}. Lähdekoodi:{' '}
          <a href={REPO}>github.com/Lylled/nimigeneraattori</a>.
        </p>
        <p>
          Lähde: Digi- ja väestötietovirasto, Nimipalvelu ja
          Väestötietojärjestelmän suomalaisten nimiaineistot (CC BY 4.0).
        </p>
      </section>
    </article>
  )
}
