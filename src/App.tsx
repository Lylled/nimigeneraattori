import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import './App.css'
import {
  HISTORIADATA,
  HISTORIARAJAT,
  OLETUSDATA,
  OLETUSRAJAT,
  generoi,
  kaytetytAlkukirjaimet,
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
} from './lib/url'

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
  const [sukupuoli, setSukupuoli] = useState(ALKUASETUKSET.sukupuoli)
  const [alkukirjaimet, setAlkukirjaimet] = useState(
    ALKUASETUKSET.alkukirjaimet,
  )
  const [siemen, setSiemen] = useState(uusiSiemen)
  const valilehdet = useRef<Partial<Record<Osio, HTMLButtonElement | null>>>({})

  const tiedot = OSIOT[osio]
  const vuosi = vuodetOsioittain[osio]

  const tulos = useMemo(
    () =>
      generoi(
        { vuosi, sukupuoli, siemen, alkukirjaimet, rajat: tiedot.rajat },
        tiedot.data,
      ),
    [tiedot, vuosi, sukupuoli, siemen, alkukirjaimet],
  )

  // Asetukset näkyvät osoitteessa, jotta haun voi jakaa linkkinä.
  useEffect(() => {
    const haku = kirjoitaAsetukset({ osio, vuosi, sukupuoli, alkukirjaimet })
    window.history.replaceState(null, '', haku)
  }, [osio, vuosi, sukupuoli, alkukirjaimet])

  const vaihdaOsio = (uusi: Osio) => {
    setOsio(uusi)
    // Pidetään vain kirjaimet, joilla uudessa osiossa on nimiä.
    setAlkukirjaimet((valitut) =>
      valitut.filter((k) => OSIOT[uusi].kirjaimet.includes(k)),
    )
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

  const vaihdaKirjain = (kirjain: string) =>
    setAlkukirjaimet((valitut) =>
      valitut.includes(kirjain)
        ? valitut.filter((k) => k !== kirjain)
        : tiedot.kirjaimet.filter((k) => k === kirjain || valitut.includes(k)),
    )

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
        {osio === 'historia' && (
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

          <details className="kentta kirjaimet">
            <summary>
              Alkukirjain:{' '}
              <span className="valittu">
                {alkukirjaimet.length > 0 ? alkukirjaimet.join(', ') : 'kaikki'}
              </span>
            </summary>
            <div
              className="kirjainvalinnat"
              role="group"
              aria-label="Alkukirjaimet"
            >
              {tiedot.kirjaimet.map((kirjain) => (
                <button
                  key={kirjain}
                  type="button"
                  className="kirjain"
                  aria-pressed={alkukirjaimet.includes(kirjain)}
                  onClick={() => vaihdaKirjain(kirjain)}
                >
                  {kirjain}
                </button>
              ))}
              <button
                type="button"
                className="tyhjenna"
                disabled={alkukirjaimet.length === 0}
                onClick={() => setAlkukirjaimet([])}
              >
                Kaikki kirjaimet
              </button>
            </div>
          </details>

          <button
            type="button"
            className="generoi"
            onClick={() => setSiemen(uusiSiemen())}
          >
            Generoi uudelleen
          </button>
        </form>

        <section className="tulokset" aria-live="polite" aria-label="Nimet">
          {KATEGORIAT.map(({ avain, otsikko }) => (
            <div key={avain} className="kategoria">
              <h2>{otsikko}</h2>
              <p className="ohje">{tiedot.kuvaukset[avain]}</p>
              {tulos[avain].length === 0 && (
                <p className="tyhja">Ei nimiä valituilla alkukirjaimilla.</p>
              )}
              <ul>
                {tulos[avain].map(({ nimi, kirjattu }) => (
                  <li key={nimi}>
                    {nimi}
                    {kirjattu && (
                      <span
                        className="kirjattu"
                        title="Kirkonkirjoihin kirjattu muoto"
                      >
                        ({kirjattu})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <footer>
          <p>{tiedot.lahde}</p>
        </footer>
      </div>
    </main>
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
