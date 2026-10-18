import type { Sukupuoli } from './generator'
import type { Tyyli } from './tyylit'

/** Tilastot perustuvat DVV:n dataan, historia käsin koottuihin arvioihin. */
export type Osio = 'tilastot' | 'historia'

export interface HakuAsetukset {
  osio: Osio
  vuosi: number
  sukupuoli: Sukupuoli
  alkukirjaimet: string[]
  tyylit: Tyyli[]
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
const SUKUPUOLET = ['nainen', 'mies'] as const

/**
 * Lukee hakuasetukset osoitteen kyselyosasta, esim.
 * `?osio=historia&vuosi=1785&sukupuoli=nainen&kirjaimet=A,E&tyylit=luonto`.
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
  }
}

/**
 * Muodostaa asetuksista kyselyosan, jonka voi jakaa linkkinä. Tilastojen
 * osio on oletus, joten sitä ei kirjoiteta osoitteeseen.
 */
export function kirjoitaAsetukset({
  osio,
  vuosi,
  sukupuoli,
  alkukirjaimet,
  tyylit,
}: HakuAsetukset): string {
  const p = new URLSearchParams()
  if (osio !== 'tilastot') p.set('osio', osio)
  p.set('vuosi', String(vuosi))
  p.set('sukupuoli', sukupuoli)
  if (alkukirjaimet.length > 0) p.set('kirjaimet', alkukirjaimet.join(','))
  if (tyylit.length > 0) p.set('tyylit', tyylit.join(','))
  return `?${p.toString().replaceAll('%2C', ',')}`
}
