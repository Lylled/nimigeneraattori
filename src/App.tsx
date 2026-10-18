import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import './App.css'
import { NimiKortti } from './NimiKortti'
import {
  HISTORIADATA,
  HISTORIARAJAT,
  OLETUSDATA,
  OLETUSRAJAT,
  PERINNEDATA,
  generoi,
  kaytetytAlkukirjaimet,
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
  const [siemen, setSiemen] = useState(uusiSiemen)
  const [valittuNimi, setValittuNimi] = useState<GeneroituNimi | null>(null)
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

  // Asetukset näkyvät osoitteessa, jotta haun voi jakaa linkkinä.
  useEffect(() => {
    const haku = kirjoitaAsetukset({
      osio,
      perinne,
      vuosi,
      sukupuoli,
      alkukirjaimet,
      tyylit,
    })
    window.history.replaceState(null, '', haku)
  }, [osio, perinne, vuosi, sukupuoli, alkukirjaimet, tyylit])

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
          Aikakauteen sopivia suomalaisia etunimiä kirjan hahmoille.
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
          Valitse nimi nähdäksesi sen alkuperän ja suosion.
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
                {tulos[avain].map((n) => (
                  <li key={n.nimi}>
                    <button
                      type="button"
                      className="nimi"
                      aria-haspopup="dialog"
                      onClick={() => setValittuNimi(n)}
                    >
                      {n.nimi}
                      {n.kirjattu && (
                        <span
                          className="kirjattu"
                          title="Kirkonkirjoihin kirjattu muoto"
                        >
                          ({n.kirjattu})
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {valittuNimi && (
          <NimiKortti
            key={valittuNimi.nimi}
            {...valittuNimi}
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
            onClose={() => setValittuNimi(null)}
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
