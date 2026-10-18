import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Kategoria, NimiData, Rajat, Sukupuoli } from './lib/generator'
import {
  NIMITIEDOT,
  arvioidutTasot,
  suosiokayra,
  type SuosioPiste,
} from './lib/nimitiedot'
import { NIMITYYLIT, TYYLIT } from './lib/tyylit'

const TASOT: Record<Kategoria, string> = {
  hyvinYleinen: 'hyvin yleinen',
  yleinen: 'yleinen',
  harvinaisempi: 'harvinaisempi',
}

const prosentti = (osuus: number) =>
  `${(osuus * 100).toLocaleString('fi', { maximumFractionDigits: 1 })} %`

const jaksoTeksti = ({ alku, loppu }: { alku: number; loppu: number }) =>
  `${alku}–${loppu}`

export interface ArvioTiedot {
  otsikko: string
  data: NimiData
  rajat: Rajat
}

/** Nimen tiedot modaalina: alkuperä, tyylit, suosiokäyrä ja arvioitu yleisyys. */
export function NimiKortti({
  nimi,
  sukupuoli,
  kirjattu,
  arvio,
  onClose,
}: {
  nimi: string
  sukupuoli: Sukupuoli
  kirjattu?: string
  arvio?: ArvioTiedot
  onClose: () => void
}) {
  const dialogi = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialogi.current?.showModal()
  }, [])

  const [alkupera, kuvaus] = NIMITIEDOT[nimi] ?? []
  const tyylit = TYYLIT.filter((t) => NIMITYYLIT[nimi]?.includes(t.avain))
  const kayra = suosiokayra(nimi, sukupuoli)
  const tasot =
    arvio && arvioidutTasot(nimi, sukupuoli, arvio.data, arvio.rajat)

  return (
    <dialog
      ref={dialogi}
      className="nimikortti"
      aria-labelledby="nimikortti-otsikko"
      onClose={onClose}
      onClick={(e) => {
        // Klikkaus taustalle sulkee kortin.
        if (e.target === e.currentTarget) dialogi.current?.close()
      }}
    >
      <div className="sisalto">
        <header>
          <h2 id="nimikortti-otsikko">
            {nimi}
            {kirjattu && <span className="kirjattu"> ({kirjattu})</span>}
          </h2>
          <button
            type="button"
            className="sulje"
            aria-label="Sulje"
            onClick={() => dialogi.current?.close()}
          >
            ×
          </button>
        </header>

        {kuvaus && (
          <section>
            <h3>Alkuperä</h3>
            <p>
              <span className="alkupera">{alkupera}</span> · {kuvaus}
            </p>
          </section>
        )}

        {tyylit.length > 0 && (
          <section>
            <h3>Tyylit</h3>
            <ul className="tunnisteet">
              {tyylit.map((t) => (
                <li key={t.avain}>{t.nimi}</li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3>Suosio 1900–2026</h3>
          {kayra.some((p) => p.osuus !== null) ? (
            <SuosioKayra pisteet={kayra} nimi={nimi} />
          ) : (
            <p className="ohje">
              Nimi ei ole ollut minkään vuosikymmenen 100 yleisimmän joukossa.
            </p>
          )}
        </section>

        {tasot && tasot.some((t) => t.taso) && (
          <section>
            <h3>{arvio.otsikko}</h3>
            <dl className="tasot">
              {tasot.map(({ jakso, taso }) => (
                <div key={jakso.alku}>
                  <dt>{jaksoTeksti(jakso)}</dt>
                  <dd>{taso ? TASOT[taso] : '–'}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <p className="ohje huomautus">
          Kuvaukset on kirjoitettu tekoälyn avustamana, eikä niitä ole vielä
          tarkistettu kokonaan; ne voivat sisältää virheitä.
        </p>
      </div>
    </dialog>
  )
}

const LEVEYS = 320
const KORKEUS = 150
const VASEN = 50
const OIKEA = 20
const YLA = 10
const ALA = 24

/** Pyöristää ylöspäin selkeään arvoon (1, 2, 5 × 10^n). */
function selkeaYlaraja(arvo: number) {
  const potenssi = 10 ** Math.floor(Math.log10(arvo))
  return [1, 2, 5, 10].map((k) => k * potenssi).find((r) => r >= arvo)!
}

/** Yhden sarjan viivakaavio: osuus jaksoittain, puuttuvat jaksot aukkoina. */
function SuosioKayra({
  pisteet,
  nimi,
}: {
  pisteet: SuosioPiste[]
  nimi: string
}) {
  const [aktiivinen, setAktiivinen] = useState<number | null>(null)
  const max = selkeaYlaraja(Math.max(...pisteet.map((p) => p.osuus ?? 0)))
  const x = (i: number) =>
    VASEN + (i * (LEVEYS - VASEN - OIKEA)) / (pisteet.length - 1)
  const y = (osuus: number) => YLA + (1 - osuus / max) * (KORKEUS - YLA - ALA)

  // Viiva katkeaa jaksoissa, joissa nimi ei ole listalla.
  const polku = pisteet
    .map((p, i) =>
      p.osuus === null
        ? ''
        : `${i > 0 && pisteet[i - 1].osuus !== null ? 'L' : 'M'}${x(i)},${y(p.osuus)}`,
    )
    .join(' ')

  const valittu = aktiivinen === null ? null : pisteet[aktiivinen]
  const huippu = pisteet.reduce((a, b) =>
    (b.osuus ?? 0) > (a.osuus ?? 0) ? b : a,
  )

  const nappain = (e: KeyboardEvent) => {
    const siirto = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!siirto) return
    e.preventDefault()
    setAktiivinen((i) =>
      Math.min(pisteet.length - 1, Math.max(0, (i ?? -siirto) + siirto)),
    )
  }

  return (
    <figure className="kayra">
      <p className="tooltip" aria-live="polite">
        {valittu
          ? `${jaksoTeksti(valittu.jakso)}: ${
              valittu.osuus === null
                ? 'ei 100 yleisimmän joukossa'
                : `${prosentti(valittu.osuus)} (sija ${valittu.sija})`
            }`
          : `Huippu ${jaksoTeksti(huippu.jakso)}: ${prosentti(huippu.osuus!)}`}
      </p>
      <svg
        viewBox={`0 0 ${LEVEYS} ${KORKEUS}`}
        role="img"
        aria-label={`Nimen ${nimi} osuus vuosikymmenen 100 yleisimmän nimen haltijoista. Siirry nuolinäppäimillä.`}
        tabIndex={0}
        onKeyDown={nappain}
        onBlur={() => setAktiivinen(null)}
        onPointerLeave={() => setAktiivinen(null)}
        onPointerMove={(e) => {
          const laatikko = e.currentTarget.getBoundingClientRect()
          const kohta = ((e.clientX - laatikko.left) / laatikko.width) * LEVEYS
          const i = Math.round(
            ((kohta - VASEN) / (LEVEYS - VASEN - OIKEA)) * (pisteet.length - 1),
          )
          setAktiivinen(Math.min(pisteet.length - 1, Math.max(0, i)))
        }}
      >
        {[0, max / 2, max].map((arvo) => (
          <g key={arvo}>
            <line
              className="ruudukko"
              x1={VASEN}
              x2={LEVEYS - OIKEA}
              y1={y(arvo)}
              y2={y(arvo)}
            />
            <text
              className="akseli"
              x={VASEN - 6}
              y={y(arvo) + 4}
              textAnchor="end"
            >
              {prosentti(arvo)}
            </text>
          </g>
        ))}
        {pisteet.map((p, i) =>
          p.jakso.alku % 40 === 20 || i === 0 ? (
            <text
              key={p.jakso.alku}
              className="akseli"
              x={x(i)}
              y={KORKEUS - 6}
              textAnchor="middle"
            >
              {p.jakso.alku}
            </text>
          ) : null,
        )}
        {aktiivinen !== null && (
          <line
            className="kohdistin"
            x1={x(aktiivinen)}
            x2={x(aktiivinen)}
            y1={YLA}
            y2={KORKEUS - ALA}
          />
        )}
        <path className="viiva" d={polku} />
        {pisteet.map((p, i) =>
          p.osuus === null ? null : (
            <circle
              key={p.jakso.alku}
              className="piste"
              cx={x(i)}
              cy={y(p.osuus)}
              r={i === aktiivinen ? 5 : 4}
            />
          ),
        )}
      </svg>
      <details>
        <summary>Näytä taulukkona</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Syntyneet</th>
              <th scope="col">Osuus</th>
              <th scope="col">Sija</th>
            </tr>
          </thead>
          <tbody>
            {pisteet.map((p) => (
              <tr key={p.jakso.alku}>
                <td>{jaksoTeksti(p.jakso)}</td>
                <td>{p.osuus === null ? '–' : prosentti(p.osuus)}</td>
                <td>{p.sija ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <figcaption className="ohje">
        Osuus vuosikymmenen 100 yleisimmän nimen haltijoista (DVV). Mukana myös
        toisina etuniminä annetut.
      </figcaption>
    </figure>
  )
}
