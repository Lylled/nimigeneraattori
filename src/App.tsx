import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  OLETUSDATA,
  generoi,
  kaytetytAlkukirjaimet,
  type Kategoria,
  type Sukupuoli,
} from './lib/generator'
import { kirjoitaAsetukset, lueAsetukset, type HakuAsetukset } from './lib/url'

const ENSIMMAINEN = OLETUSDATA.jaksot[0].alku
const VIIMEINEN = OLETUSDATA.jaksot[OLETUSDATA.jaksot.length - 1].loppu

const KATEGORIAT: { avain: Kategoria; otsikko: string; kuvaus: string }[] = [
  {
    avain: 'hyvinYleinen',
    otsikko: 'Hyvin yleinen',
    kuvaus: 'Aikakauden 20 suosituinta',
  },
  { avain: 'yleinen', otsikko: 'Yleinen', kuvaus: 'Sijat 21–60' },
  {
    avain: 'harvinaisempi',
    otsikko: 'Hieman harvinaisempi',
    kuvaus: 'Tuttu, mutta ei tavallisin',
  },
]

const SUKUPUOLET: { arvo: Sukupuoli; nimi: string }[] = [
  { arvo: 'nainen', nimi: 'Nainen' },
  { arvo: 'mies', nimi: 'Mies' },
]

const KIRJAIMET = kaytetytAlkukirjaimet()

const ALKUASETUKSET = lueAsetukset(
  window.location.search,
  { vuosi: 1925, sukupuoli: 'nainen', alkukirjaimet: [] },
  { min: ENSIMMAINEN, max: VIIMEINEN },
  KIRJAIMET,
)

const uusiSiemen = () => Math.floor(Math.random() * 2 ** 32)

function App() {
  const [vuosi, setVuosi] = useState(ALKUASETUKSET.vuosi)
  const [vuosiTeksti, setVuosiTeksti] = useState(String(ALKUASETUKSET.vuosi))
  const [sukupuoli, setSukupuoli] = useState<HakuAsetukset['sukupuoli']>(
    ALKUASETUKSET.sukupuoli,
  )
  const [alkukirjaimet, setAlkukirjaimet] = useState(
    ALKUASETUKSET.alkukirjaimet,
  )
  const [siemen, setSiemen] = useState(uusiSiemen)

  const tulos = useMemo(
    () => generoi({ vuosi, sukupuoli, siemen, alkukirjaimet }),
    [vuosi, sukupuoli, siemen, alkukirjaimet],
  )

  // Asetukset näkyvät osoitteessa, jotta haun voi jakaa linkkinä.
  useEffect(() => {
    const haku = kirjoitaAsetukset({ vuosi, sukupuoli, alkukirjaimet })
    window.history.replaceState(null, '', haku)
  }, [vuosi, sukupuoli, alkukirjaimet])

  const vaihdaKirjain = (kirjain: string) =>
    setAlkukirjaimet((valitut) =>
      valitut.includes(kirjain)
        ? valitut.filter((k) => k !== kirjain)
        : KIRJAIMET.filter((k) => k === kirjain || valitut.includes(k)),
    )

  const vaihdaVuosi = (teksti: string) => {
    setVuosiTeksti(teksti)
    const luku = Number(teksti)
    if (Number.isInteger(luku) && luku >= ENSIMMAINEN && luku <= VIIMEINEN) {
      setVuosi(luku)
    }
  }
  const vuosiVirheellinen = String(vuosi) !== vuosiTeksti

  return (
    <main className="app">
      <header>
        <h1>Nimigeneraattori</h1>
        <p className="lead">
          Aikakauteen sopivia suomalaisia etunimiä kirjan hahmoille.
        </p>
      </header>

      <form className="haku" onSubmit={(e) => e.preventDefault()}>
        <div className="kentta">
          <label htmlFor="vuosi">Syntymävuosi</label>
          <div className="vuosi">
            <input
              type="range"
              min={ENSIMMAINEN}
              max={VIIMEINEN}
              value={vuosi}
              aria-label="Syntymävuosi liukusäätimellä"
              onChange={(e) => vaihdaVuosi(e.target.value)}
            />
            <input
              id="vuosi"
              type="number"
              inputMode="numeric"
              min={ENSIMMAINEN}
              max={VIIMEINEN}
              value={vuosiTeksti}
              aria-invalid={vuosiVirheellinen}
              aria-describedby="vuosi-ohje"
              onChange={(e) => vaihdaVuosi(e.target.value)}
              onBlur={() => setVuosiTeksti(String(vuosi))}
            />
          </div>
          <p id="vuosi-ohje" className="ohje" aria-live="polite">
            {vuosiVirheellinen &&
              `Anna vuosi väliltä ${ENSIMMAINEN}–${VIIMEINEN}.`}
          </p>
        </div>

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
            {KIRJAIMET.map((kirjain) => (
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
        {KATEGORIAT.map(({ avain, otsikko, kuvaus }) => (
          <div key={avain} className="kategoria">
            <h2>{otsikko}</h2>
            <p className="ohje">{kuvaus}</p>
            {tulos[avain].length === 0 && (
              <p className="tyhja">Ei nimiä valituilla alkukirjaimilla.</p>
            )}
            <ul>
              {tulos[avain].map(({ nimi }) => (
                <li key={nimi}>{nimi}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer>
        <p>
          Nimet perustuvat syntymävuosikymmenen yleisimpiin etunimiin. Luvuissa
          ovat mukana myös toiset ja kolmannet etunimet.
        </p>
        <p>
          Lähde: Digi- ja väestötietovirasto, Nimipalvelu ja
          Väestötietojärjestelmän suomalaisten nimiaineistot (CC BY 4.0).
        </p>
      </footer>
    </main>
  )
}

export default App
