import type { Sukupuoli } from './generator'
import type { Alue } from './sukunimet'
import type { Tyyli } from './tyylit'

/** Tilastot perustuvat DVV:n dataan, historia käsin koottuihin arvioihin. */
export type Osio = 'tilastot' | 'historia'

/** Koko Suomi käyttää osion omaa dataa, muut perinteet omia arvioitaan. */
export type Perinne = 'kaikki' | 'suomenruotsalainen' | 'ortodoksinen'

export interface HakuAsetukset {
  osio: Osio
  perinne: Perinne
  vuosi: number
  sukupuoli: Sukupuoli
  alkukirjaimet: string[]
  tyylit: Tyyli[]
  /** Näytetäänkö sukunimi, ja miltä alueelta. */
  sukunimi: boolean
  alue: Alue
}

/** Osion sallitut arvot ja oletusvuosi. */
export interface OsionRajat {
  oletusvuosi: number
  min: number
  max: number
  kirjaimet: readonly string[]
  tyylit: readonly Tyyli[]
}

const OSIOT = ['tilastot', 'historia'] as const
const PERINTEET = ['kaikki', 'suomenruotsalainen', 'ortodoksinen'] as const
const SUKUPUOLET = ['nainen', 'mies'] as const
const ALUEET = [
  'kaikki',
  'lansi',
  'ita',
  'pohjanmaa',
  'karjala',
  'lappi',
  'rannikko',
] as const

/**
 * Lukee hakuasetukset osoitteen kyselyosasta, esim.
 * `?osio=historia&perinne=ortodoksinen&vuosi=1785&sukupuoli=nainen&kirjaimet=A`.
 * Puuttuvat tai virheelliset arvot korvataan oletuksilla. Vuosi, kirjaimet ja
 * tyylit tarkistetaan valitun osion rajoja vasten.
 */
export function lueAsetukset(
  haku: string,
  oletus: { osio: Osio; sukupuoli: Sukupuoli },
  osiot: Record<Osio, OsionRajat>,
): HakuAsetukset {
  const p = new URLSearchParams(haku)

  const osio = OSIOT.find((o) => o === p.get('osio')) ?? oletus.osio
  const rajat = osiot[osio]
  const vuosi = Number(p.get('vuosi'))
  const sukupuoli = p.get('sukupuoli')
  const kirjaimet = (p.get('kirjaimet') ?? '')
    .split(',')
    .map((k) => k.trim().toLocaleUpperCase('fi'))
    .filter((k) => rajat.kirjaimet.includes(k))
  const tyylit = (p.get('tyylit') ?? '')
    .split(',')
    .flatMap((t) => rajat.tyylit.filter((sallittu) => sallittu === t.trim()))

  return {
    osio,
    perinne: PERINTEET.find((pr) => pr === p.get('perinne')) ?? 'kaikki',
    vuosi:
      p.has('vuosi') &&
      Number.isInteger(vuosi) &&
      vuosi >= rajat.min &&
      vuosi <= rajat.max
        ? vuosi
        : rajat.oletusvuosi,
    sukupuoli: SUKUPUOLET.find((s) => s === sukupuoli) ?? oletus.sukupuoli,
    alkukirjaimet: [...new Set(kirjaimet)],
    tyylit: [...new Set(tyylit)],
    sukunimi: p.get('sukunimi') === '1',
    alue: ALUEET.find((a) => a === p.get('alue')) ?? 'kaikki',
  }
}

/**
 * Muodostaa asetuksista kyselyosan, jonka voi jakaa linkkinä. Oletuksia
 * (tilastojen osio, koko Suomi, ei sukunimeä) ei kirjoiteta osoitteeseen.
 */
export function kirjoitaAsetukset({
  osio,
  perinne,
  vuosi,
  sukupuoli,
  alkukirjaimet,
  tyylit,
  sukunimi,
  alue,
}: HakuAsetukset): string {
  const p = new URLSearchParams()
  if (osio !== 'tilastot') p.set('osio', osio)
  if (perinne !== 'kaikki') p.set('perinne', perinne)
  p.set('vuosi', String(vuosi))
  p.set('sukupuoli', sukupuoli)
  if (alkukirjaimet.length > 0) p.set('kirjaimet', alkukirjaimet.join(','))
  if (tyylit.length > 0) p.set('tyylit', tyylit.join(','))
  if (sukunimi) {
    p.set('sukunimi', '1')
    if (alue !== 'kaikki') p.set('alue', alue)
  }
  return `?${p.toString().replaceAll('%2C', ',')}`
}
