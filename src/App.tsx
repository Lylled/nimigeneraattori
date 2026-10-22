import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import './App.css'
import { NimiKortti, SukunimiKortti } from './NimiKortti'
import {
  HISTORIADATA,
  HISTORIARAJAT,
  OLETUSDATA,
  OLETUSRAJAT,
  PERINNEDATA,
  generoi,
  kaytetytAlkukirjaimet,
  luokittele,
  rajaaJaksot,
  type GeneroituNimi,
  type Kategoria,
  type NimiData,
  type Rajat,
  type Sukupuoli,
} from './lib/generator'
import {
  kirjoitaAsetukset,
  lueAsetukset,
  type Osio,
  type OsionRajat,
  type Perinne,
} from './lib/url'
import { luoSatunnainen } from './lib/random'
import {
  ALUEET,
  generoiSukunimi,
  type Alue,
  type GeneroituSukunimi,
} from './lib/sukunimet'
import { TYYLIT, type Tyyli } from './lib/tyylit'

interface OsionTiedot extends OsionRajat {
  otsikko: string
  data: NimiData
  rajat: Rajat
  kuvaukset: Record<Kategoria, string>
  lahde: string
}

const vuodet = (data: NimiData) => ({
  min: data.jaksot[0].alku,
  max: data.jaksot[data.jaksot.length - 1].loppu,
})

const OSIOT: Record<Osio, OsionTiedot> = {
  tilastot: {
    otsikko: 'Nimitilastot',
    data: OLETUSDATA,
    rajat: OLETUSRAJAT,
    ...vuodet(OLETUSDATA),
    oletusvuosi: 1925,
    kirjaimet: kaytetytAlkukirjaimet(OLETUSDATA),
    tyylit: TYYLIT.filter((t) => !t.vainHistoria).map((t) => t.avain),
    kuvaukset: {
      hyvinYleinen: 'Aikakauden 20 suosituinta',
      yleinen: 'Sijat 21–60',
      harvinaisempi: 'Tuttu, mutta ei tavallisin',
    },
    lahde:
      'Nimet perustuvat syntymävuosikymmenen yleisimpiin etunimiin. Luvuissa ovat mukana myös toiset ja kolmannet etunimet. Lähde: Digi- ja väestötietovirasto, Nimipalvelu ja Väestötietojärjestelmän suomalaisten nimiaineistot (CC BY 4.0).',
  },
  historia: {
    otsikko: 'Historialliset nimet',
    data: HISTORIADATA,
    rajat: HISTORIARAJAT,
    ...vuodet(HISTORIADATA),
    oletusvuosi: 1850,
    kirjaimet: kaytetytAlkukirjaimet(HISTORIADATA),
    tyylit: TYYLIT.map((t) => t.avain),
    kuvaukset: {
      hyvinYleinen: 'Aikakauden yleisimpiä',
      yleinen: 'Tavallisia nimiä',
      harvinaisempi: 'Tuttu, mutta ei tavallisin',
    },
    lahde:
      'Arviot on koottu nimihistorian yleistiedon pohjalta ja tarkistettu suuntaa antavasti HisKi-hakemiston kastettujen otosta (1890) ja julkaistuja nimitutkimuksia vasten.',
  },
}

const OSIOJARJESTYS: Osio[] = ['tilastot', 'historia']

const PERINTEET: {
  arvo: Perinne
  nimi: string
  huomio?: { otsikko: string; teksti: string }
  lahde?: string
  /** Tiedosto, jonka alussa lähteet on lueteltu. */
  lahdetiedosto?: string
}[] = [
  { arvo: 'kaikki', nimi: 'Koko Suomi' },
  {
    arvo: 'suomenruotsalainen',
    nimi: 'Suomenruotsalainen',
    huomio: {
      otsikko: 'Suomenruotsalaiset nimet ovat arvioita, eivät tilastotietoa.',
      teksti:
        'Väestötiedoissa nimiä ei eritellä äidinkielen mukaan, joten listat on koottu nimihistorian ja DVV:n vuosittaisten nimitiedotteiden pohjalta.',
    },
    lahde:
      'Arviot perustuvat nimihistorian yleistietoon ja DVV:n tiedotteisiin ruotsinkielisille lapsille annetuista nimistä.',
    lahdetiedosto: 'data/traditions/suomenruotsalainen.txt',
  },
  {
    arvo: 'ortodoksinen',
    nimi: 'Ortodoksinen',
    huomio: {
      otsikko: 'Ortodoksiset nimet ovat arvioita, eivät tilastotietoa.',
      teksti:
        'Listat perustuvat karjalaisten ortodoksien nimistön tutkimuksiin ja uudemmilta ajoilta yleistietoon; 1990-luvulta mukana ovat myös venäjänkielisten nimet. Suluissa on kirkonkirjoihin kirjattu kirkkoslaavilainen tai venäläinen muoto.',
    },
    lahde:
      'Arviot perustuvat Outi Patronen (Virittäjä 1/2020) ja Denis Kuzminin (ESUKA – JEFUL 2022) tutkimuksiin karjalaisten ortodoksien nimistä.',
    lahdetiedosto: 'data/traditions/ortodoksinen.txt',
  },
]

/** Osion aineisto valitulle nimiperinteelle. */
const aineisto = (osio: Osio, perinne: Perinne): NimiData =>
  perinne === 'kaikki'
    ? OSIOT[osio].data
    : rajaaJaksot(PERINNEDATA[perinne], OSIOT[osio].min, OSIOT[osio].max)

// Osoitteesta luettavat kirjaimet sallitaan kaikista osion perinteistä.
for (const osio of Object.keys(OSIOT) as Osio[]) {
  const kirjaimet = PERINTEET.flatMap(({ arvo }) =>
    kaytetytAlkukirjaimet(aineisto(osio, arvo)),
  )
  OSIOT[osio].kirjaimet = [...new Set(kirjaimet)].sort((a, b) =>
    a.localeCompare(b, 'fi'),
  )
}

/** Nimiperinne määrää alueen: suomenruotsalaiset rannikolta, ortodoksit Karjalasta. */
const PERINTEEN_ALUE: Partial<Record<Perinne, Alue>> = {
  suomenruotsalainen: 'rannikko',
  ortodoksinen: 'karjala',
}

/** Isän nimi arvotaan noin 30 vuotta aiemmin syntyneiden nimistä. */
const ISAN_IKA = 30

const KATEGORIAT: { avain: Kategoria; otsikko: string }[] = [
  { avain: 'hyvinYleinen', otsikko: 'Hyvin yleinen' },
  { avain: 'yleinen', otsikko: 'Yleinen' },
  { avain: 'harvinaisempi', otsikko: 'Hieman harvinaisempi' },
]

const SUKUPUOLET: { arvo: Sukupuoli; nimi: string }[] = [
  { arvo: 'nainen', nimi: 'Nainen' },
  { arvo: 'mies', nimi: 'Mies' },
]

const ALKUASETUKSET = lueAsetukset(
  window.location.search,
  { osio: 'tilastot', sukupuoli: 'nainen' },
  OSIOT,
)

const uusiSiemen = () => Math.floor(Math.random() * 2 ** 32)

function App() {
  const [osio, setOsio] = useState(ALKUASETUKSET.osio)
  // Kummallakin osiolla on oma vuotensa, joka säilyy välilehteä vaihdettaessa.
  const [vuodetOsioittain, setVuodet] = useState<Record<Osio, number>>({
    tilastot: OSIOT.tilastot.oletusvuosi,
    historia: OSIOT.historia.oletusvuosi,
    [ALKUASETUKSET.osio]: ALKUASETUKSET.vuosi,
  })
  const [perinne, setPerinne] = useState(ALKUASETUKSET.perinne)
  const [sukupuoli, setSukupuoli] = useState(ALKUASETUKSET.sukupuoli)
  const [alkukirjaimet, setAlkukirjaimet] = useState(
    ALKUASETUKSET.alkukirjaimet,
  )
  const [tyylit, setTyylit] = useState(ALKUASETUKSET.tyylit)
  const [sukunimi, setSukunimi] = useState(ALKUASETUKSET.sukunimi)
  const [alue, setAlue] = useState(ALKUASETUKSET.alue)
  const [siemen, setSiemen] = useState(uusiSiemen)
  // Klikattu nimi ja sen osa: etunimi tai suku- / isännimi.
  const [valittu, setValittu] = useState<{
    nimi: GeneroituNimi
    osa: 'etu' | 'suku'
  } | null>(null)
  const valilehdet = useRef<Partial<Record<Osio, HTMLButtonElement | null>>>({})

  const tiedot = OSIOT[osio]
  const vuosi = vuodetOsioittain[osio]
  const perinteenTiedot = PERINTEET.find((p) => p.arvo === perinne)!
  const data = useMemo(() => aineisto(osio, perinne), [osio, perinne])
  const kirjaimet = useMemo(() => kaytetytAlkukirjaimet(data), [data])
  // Perinteiden arviot ovat lyhyitä listoja kuten historialliset nimet.
  const rajat = perinne === 'kaikki' ? tiedot.rajat : HISTORIARAJAT
  const kuvaukset =
    perinne === 'kaikki' ? tiedot.kuvaukset : OSIOT.historia.kuvaukset

  const tulos = useMemo(
    () =>
      generoi(
        {
          vuosi,
          sukupuoli,
          siemen,
          alkukirjaimet,
          tyylit,
          rajat,
        },
        data,
      ),
    [data, rajat, vuosi, sukupuoli, siemen, alkukirjaimet, tyylit],
  )

  const perinteenAlue = PERINTEEN_ALUE[perinne]
  // Nimimuoto valitaan aikakauden ja alueen mukaan; vuodesta 1900 alkaen
  // hahmolla on aina sukunimi.
  const kaytettyMuoto = osio === 'tilastot' ? 'suku' : 'auto'

  const sukunimet = useMemo(() => {
    const tuloksia = new Map<string, GeneroituSukunimi>()
    if (!sukunimi) return tuloksia
    const isanVuosi = Math.max(data.jaksot[0].alku, vuosi - ISAN_IKA)
    const isat = luokittele(isanVuosi, 'mies', data, rajat)
    const satunnainen = luoSatunnainen((siemen ^ 0x9e3779b9) >>> 0)
    for (const n of Object.values(tulos).flat()) {
      tuloksia.set(
        n.nimi,
        generoiSukunimi(
          {
            vuosi,
            sukupuoli: n.sukupuoli,
            alue: perinteenAlue ?? alue,
            muoto: kaytettyMuoto,
            isat,
            ruotsiksi: perinne === 'suomenruotsalainen',
          },
          satunnainen,
        ),
      )
    }
    return tuloksia
  }, [
    sukunimi,
    tulos,
    data,
    rajat,
    vuosi,
    siemen,
    perinteenAlue,
    alue,
    kaytettyMuoto,
    perinne,
  ])

  // Asetukset näkyvät osoitteessa, jotta haun voi jakaa linkkinä.
  useEffect(() => {
    const haku = kirjoitaAsetukset({
      osio,
      perinne,
      vuosi,
      sukupuoli,
      alkukirjaimet,
      tyylit,
      sukunimi,
      alue,
    })
    window.history.replaceState(null, '', haku)
  }, [osio, perinne, vuosi, sukupuoli, alkukirjaimet, tyylit, sukunimi, alue])

  // Pidetään vain kirjaimet, joilla uudessa aineistossa on nimiä.
  const rajaaKirjaimet = (uusi: NimiData) => {
    const sallitut = kaytetytAlkukirjaimet(uusi)
    setAlkukirjaimet((valitut) => valitut.filter((k) => sallitut.includes(k)))
  }

  const vaihdaOsio = (uusi: Osio) => {
    setOsio(uusi)
    rajaaKirjaimet(aineisto(uusi, perinne))
    setTyylit((valitut) =>
      valitut.filter((t) => OSIOT[uusi].tyylit.includes(t)),
    )
  }

  const vaihdaPerinne = (uusi: Perinne) => {
    setPerinne(uusi)
    rajaaKirjaimet(aineisto(osio, uusi))
  }

  const valilehtiNappain = (e: KeyboardEvent) => {
    const i = OSIOJARJESTYS.indexOf(osio)
    const seuraava = {
      ArrowRight: OSIOJARJESTYS[(i + 1) % OSIOJARJESTYS.length],
      ArrowLeft:
        OSIOJARJESTYS[(i - 1 + OSIOJARJESTYS.length) % OSIOJARJESTYS.length],
      Home: OSIOJARJESTYS[0],
      End: OSIOJARJESTYS[OSIOJARJESTYS.length - 1],
    }[e.key]
    if (!seuraava) return
    e.preventDefault()
    vaihdaOsio(seuraava)
    valilehdet.current[seuraava]?.focus()
  }

  return (
    <main className="app">
      <header>
        <h1>Nimigeneraattori</h1>
        <p className="lead">
          Aikakauteen sopivia suomalaisia etunimiä luoviin projekteihin.
        </p>
      </header>

      <div
        className="valilehdet"
        role="tablist"
        aria-label="Aineisto"
        onKeyDown={valilehtiNappain}
      >
        {OSIOJARJESTYS.map((o) => (
          <button
            key={o}
            ref={(el) => {
              valilehdet.current[o] = el
            }}
            type="button"
            role="tab"
            id={`valilehti-${o}`}
            aria-selected={osio === o}
            aria-controls="osio"
            tabIndex={osio === o ? 0 : -1}
            onClick={() => vaihdaOsio(o)}
          >
            {OSIOT[o].otsikko}
            <span className="vuosivali">
              {OSIOT[o].min}–{OSIOT[o].max}
            </span>
          </button>
        ))}
      </div>

      <div id="osio" role="tabpanel" aria-labelledby={`valilehti-${osio}`}>
        {perinteenTiedot.huomio && (
          <p className="huomio">
            <strong>{perinteenTiedot.huomio.otsikko}</strong>{' '}
            {perinteenTiedot.huomio.teksti}
          </p>
        )}
        {osio === 'historia' && perinne === 'kaikki' && (
          <p className="huomio">
            <strong>Nimet ovat arvioita, eivät tilastotietoa.</strong> Ennen
            vuotta 1900 syntyneistä ei ole kattavaa nimitilastoa, joten
            yleisyysjärjestys on suuntaa antava. Suluissa on muoto, jolla nimi
            tavallisesti kirjattiin ruotsinkielisiin kirkonkirjoihin.
          </p>
        )}

        <form className="haku" onSubmit={(e) => e.preventDefault()}>
          <VuosiKentta
            key={osio}
            min={tiedot.min}
            max={tiedot.max}
            vuosi={vuosi}
            onChange={(v) => setVuodet((vanhat) => ({ ...vanhat, [osio]: v }))}
          />

          <fieldset className="kentta">
            <legend>Sukupuoli</legend>
            <div className="valinnat">
              {SUKUPUOLET.map(({ arvo, nimi }) => (
                <label key={arvo} className="valinta">
                  <input
                    type="radio"
                    name="sukupuoli"
                    value={arvo}
                    checked={sukupuoli === arvo}
                    onChange={() => setSukupuoli(arvo)}
                  />
                  {nimi}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="kentta">
            <legend>Nimiperinne</legend>
            <div className="valinnat">
              {PERINTEET.map(({ arvo, nimi }) => (
                <label key={arvo} className="valinta">
                  <input
                    type="radio"
                    name="perinne"
                    value={arvo}
                    checked={perinne === arvo}
                    onChange={() => vaihdaPerinne(arvo)}
                  />
                  {nimi}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="kentta sukunimet">
            <legend>Sukunimi</legend>
            <label className="valinta">
              <input
                type="checkbox"
                checked={sukunimi}
                onChange={(e) => setSukunimi(e.target.checked)}
              />
              Näytä sukunimi
            </label>
            {sukunimi && (
              <div className="sukunimiasetukset">
                <label className="alue">
                  Alue{' '}
                  <select
                    value={perinteenAlue ?? alue}
                    disabled={perinteenAlue !== undefined}
                    aria-describedby="alue-ohje"
                    onChange={(e) => setAlue(e.target.value as Alue)}
                  >
                    {ALUEET.map(({ arvo, nimi }) => (
                      <option key={arvo} value={arvo}>
                        {nimi}
                      </option>
                    ))}
                  </select>
                </label>
                <p id="alue-ohje" className="ohje">
                  {perinteenAlue
                    ? 'Alue määräytyy valitun nimiperinteen mukaan.'
                    : 'Sukunimet ovat alueelle tyypillisiä; aluejako on arvio.'}
                </p>
                <SukunimiInfo />
              </div>
            )}
          </fieldset>

          <Monivalinta
            otsikko="Tyyli"
            ryhma="Tyylit"
            kaikki="Kaikki tyylit"
            vaihtoehdot={TYYLIT.filter((t) => tiedot.tyylit.includes(t.avain))}
            valitut={tyylit}
            onChange={(v: Tyyli[]) => setTyylit(v)}
          />

          <Monivalinta
            otsikko="Alkukirjain"
            ryhma="Alkukirjaimet"
            kaikki="Kaikki kirjaimet"
            vaihtoehdot={kirjaimet.map((k) => ({ avain: k, nimi: k }))}
            valitut={alkukirjaimet}
            onChange={setAlkukirjaimet}
          />

          <button
            type="button"
            className="generoi"
            onClick={() => setSiemen(uusiSiemen())}
          >
            Generoi uudelleen
          </button>
        </form>

        <p className="ohje vihje">
          Valitse etu- tai sukunimi nähdäksesi sen tiedot.
        </p>

        <section className="tulokset" aria-live="polite" aria-label="Nimet">
          {KATEGORIAT.map(({ avain, otsikko }) => (
            <div key={avain} className="kategoria">
              <h2>{otsikko}</h2>
              <p className="ohje">{kuvaukset[avain]}</p>
              {tulos[avain].length === 0 && (
                <p className="tyhja">Ei nimiä valituilla rajauksilla.</p>
              )}
              <ul>
                {tulos[avain].map((n) => {
                  const suku = sukunimet.get(n.nimi)
                  const sukuosa = [suku?.isannimi, suku?.sukunimi]
                    .filter(Boolean)
                    .join(' ')
                  const kirjattu = suku?.kirjattuIsannimi
                    ? `${n.kirjattu ?? n.nimi} ${suku.kirjattuIsannimi}`
                    : n.kirjattu
                  return (
                    <li key={n.nimi}>
                      <span className="kokonimi">
                        <button
                          type="button"
                          className="nimi"
                          aria-haspopup="dialog"
                          onClick={() => setValittu({ nimi: n, osa: 'etu' })}
                        >
                          {n.nimi}
                        </button>
                        {sukuosa && (
                          <button
                            type="button"
                            className="nimi"
                            aria-haspopup="dialog"
                            onClick={() => setValittu({ nimi: n, osa: 'suku' })}
                          >
                            {sukuosa}
                          </button>
                        )}
                      </span>
                      {kirjattu && (
                        <span
                          className="kirjattu"
                          title="Kirkonkirjoihin kirjattu muoto"
                        >
                          ({kirjattu})
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>

        {valittu?.osa === 'etu' && (
          <NimiKortti
            key={valittu.nimi.nimi}
            {...valittu.nimi}
            arvio={
              osio === 'historia' || perinne !== 'kaikki'
                ? {
                    otsikko:
                      perinne === 'kaikki'
                        ? `Arvioitu yleisyys ${tiedot.min}–${tiedot.max}`
                        : `Arvioitu yleisyys ${tiedot.min}–${tiedot.max}, ${perinteenTiedot.nimi.toLocaleLowerCase('fi')} nimiperinne`,
                    data,
                    rajat,
                  }
                : undefined
            }
            onClose={() => setValittu(null)}
          />
        )}
        {valittu?.osa === 'suku' && sukunimet.has(valittu.nimi.nimi) && (
          <SukunimiKortti
            key={`suku-${valittu.nimi.nimi}`}
            suku={sukunimet.get(valittu.nimi.nimi)!}
            sukupuoli={valittu.nimi.sukupuoli}
            onClose={() => setValittu(null)}
          />
        )}

        <footer>
          <p>
            {perinteenTiedot.lahde ?? tiedot.lahde}
            {perinteenTiedot.lahdetiedosto && (
              <>
                {' '}
                <a
                  href={`https://github.com/Lylled/nimigeneraattori/blob/main/${perinteenTiedot.lahdetiedosto}`}
                >
                  Lähdeluettelo
                </a>
              </>
            )}
          </p>
        </footer>
      </div>
    </main>
  )
}

/** Taustatietoa siitä, miksi hahmolla on isännimi, talonnimi tai sukunimi. */
function SukunimiInfo() {
  return (
    <details className="infolaatikko">
      <summary>Miten sukunimet muotoutuivat?</summary>
      <ul>
        <li>
          <strong>Itä-Suomessa</strong> (Savo, Karjala) perinnöllisiä sukunimiä
          käytettiin jo 1500-luvulla. Ne päättyivät usein -nen-päätteeseen,
          esimerkiksi Korhonen ja Hyvönen.
        </li>
        <li>
          <strong>Länsi-Suomessa ja Pohjanmaalla</strong> ihminen tunnettiin
          isännimestä ja talon nimestä. <em>Matti Juhonpoika Mäkelä</em> oli
          Juhon poika Mäkelän talosta, ja talosta toiseen muuttaessa myös
          talonnimi vaihtui. Kirkonkirjoihin isännimi kirjattiin ruotsiksi:{' '}
          <em>Matts Johansson</em>.
        </li>
        <li>
          <strong>Ruotsinkielisellä rannikolla</strong> isännimet kuten
          Johansson ja Eriksdotter vakiintuivat vähitellen sukunimiksi.
        </li>
        <li>
          <strong>Säätyläisillä, papeilla ja porvareilla</strong> oli sukunimi
          jo varhain, usein latinalainen tai ruotsalainen (Castrén, Lagus).
          Sotilaat saivat lyhyitä sotilasnimiä (Rask, Frisk).
        </li>
        <li>
          <strong>1800-luvun lopulla</strong> talonnimet alkoivat vakiintua
          sukunimiksi myös lännessä. Vuodesta 1875 alkaen ja erityisesti vuosina
          1906 ja 1935 kymmenet tuhannet suomalaistivat ruotsalaisen nimensä.
          Moni nykyään yleinen nimi, kuten Virtanen tai Laine, on syntynyt
          silloin.
        </li>
        <li>
          <strong>Sukunimilaki 1920</strong> velvoitti jokaisen ottamaan
          sukunimen.
        </li>
      </ul>
      <p className="ohje">
        Generaattori valitsee nimimuodon alueen ja syntymävuoden mukaan.
        Siirtymäaikana 1880–1919 sukunimi yleistyy vähitellen. Rajat ovat
        yleistyksiä.{' '}
        <a href="https://github.com/Lylled/nimigeneraattori/blob/main/docs/data-sources.md#sukunimet">
          Lähteet
        </a>
      </p>
    </details>
  )
}

/**
 * Avattava valikko, josta voi valita useita vaihtoehtoja. Tyhjä valinta
 * tarkoittaa kaikkia. Valitut pidetään vaihtoehtojen järjestyksessä.
 */
function Monivalinta<T extends string>({
  otsikko,
  ryhma,
  kaikki,
  vaihtoehdot,
  valitut,
  onChange,
}: {
  otsikko: string
  ryhma: string
  kaikki: string
  vaihtoehdot: readonly { avain: T; nimi: string; kuvaus?: string }[]
  valitut: readonly T[]
  onChange: (valitut: T[]) => void
}) {
  const vaihda = (avain: T) =>
    onChange(
      vaihtoehdot
        .map((v) => v.avain)
        .filter((a) => (a === avain) !== valitut.includes(a)),
    )
  const nimi = (avain: T) => vaihtoehdot.find((v) => v.avain === avain)?.nimi
  const kuvaukset = vaihtoehdot.filter((v) => v.kuvaus)

  return (
    <details className="kentta monivalinta">
      <summary>
        {otsikko}:{' '}
        <span className="valittu">
          {valitut.length > 0 ? valitut.map(nimi).join(', ') : 'kaikki'}
        </span>
      </summary>
      <div className="vaihtoehdot" role="group" aria-label={ryhma}>
        {vaihtoehdot.map((v) => (
          <button
            key={v.avain}
            type="button"
            className="vaihtoehto"
            aria-pressed={valitut.includes(v.avain)}
            onClick={() => vaihda(v.avain)}
          >
            {v.nimi}
          </button>
        ))}
        <button
          type="button"
          className="tyhjenna"
          disabled={valitut.length === 0}
          onClick={() => onChange([])}
        >
          {kaikki}
        </button>
      </div>
      {kuvaukset.length > 0 && (
        <dl className="kuvaukset">
          {kuvaukset.map((v) => (
            <div key={v.avain}>
              <dt>{v.nimi}</dt>
              <dd>{v.kuvaus}</dd>
            </div>
          ))}
        </dl>
      )}
    </details>
  )
}

/** Syntymävuoden valinta liukusäätimellä tai kirjoittamalla. */
function VuosiKentta({
  min,
  max,
  vuosi,
  onChange,
}: {
  min: number
  max: number
  vuosi: number
  onChange: (vuosi: number) => void
}) {
  const [teksti, setTeksti] = useState(String(vuosi))

  const vaihda = (uusi: string) => {
    setTeksti(uusi)
    const luku = Number(uusi)
    if (Number.isInteger(luku) && luku >= min && luku <= max) onChange(luku)
  }
  const virheellinen = String(vuosi) !== teksti

  return (
    <div className="kentta">
      <label htmlFor="vuosi">Syntymävuosi</label>
      <div className="vuosi">
        <input
          type="range"
          min={min}
          max={max}
          value={vuosi}
          aria-label="Syntymävuosi liukusäätimellä"
          onChange={(e) => vaihda(e.target.value)}
        />
        <input
          id="vuosi"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={teksti}
          aria-invalid={virheellinen}
          aria-describedby="vuosi-ohje"
          onChange={(e) => vaihda(e.target.value)}
          onBlur={() => setTeksti(String(vuosi))}
        />
      </div>
      <p id="vuosi-ohje" className="ohje" aria-live="polite">
        {virheellinen && `Anna vuosi väliltä ${min}–${max}.`}
      </p>
    </div>
  )
}

export default App
