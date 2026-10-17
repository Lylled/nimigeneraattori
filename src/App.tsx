import { useMemo, useState } from 'react'
import './App.css'
import {
  OLETUSDATA,
  generoi,
  type Kategoria,
  type Sukupuoli,
} from './lib/generator'

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

const SUKUPUOLET: { arvo: Sukupuoli | 'molemmat'; nimi: string }[] = [
  { arvo: 'nainen', nimi: 'Nainen' },
  { arvo: 'mies', nimi: 'Mies' },
  { arvo: 'molemmat', nimi: 'Molemmat' },
]

const uusiSiemen = () => Math.floor(Math.random() * 2 ** 32)

function App() {
  const [vuosi, setVuosi] = useState(1925)
  const [vuosiTeksti, setVuosiTeksti] = useState('1925')
  const [sukupuoli, setSukupuoli] = useState<Sukupuoli | 'molemmat'>('nainen')
  const [siemen, setSiemen] = useState(uusiSiemen)

  const tulos = useMemo(
    () => generoi({ vuosi, sukupuoli, siemen }),
    [vuosi, sukupuoli, siemen],
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

        <button type="button" onClick={() => setSiemen(uusiSiemen())}>
          Generoi uudelleen
        </button>
      </form>

      <section className="tulokset" aria-live="polite" aria-label="Nimet">
        {KATEGORIAT.map(({ avain, otsikko, kuvaus }) => (
          <div key={avain} className="kategoria">
            <h2>{otsikko}</h2>
            <p className="ohje">{kuvaus}</p>
            <ul>
              {tulos[avain].map(({ nimi, sukupuoli: s }) => (
                <li key={`${s}-${nimi}`}>
                  {nimi}
                  {sukupuoli === 'molemmat' && (
                    <span className="merkki" aria-label={s}>
                      {s === 'nainen' ? 'N' : 'M'}
                    </span>
                  )}
                </li>
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
