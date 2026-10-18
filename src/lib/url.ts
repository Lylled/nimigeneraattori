import type { Sukupuoli } from './generator'

/** Tilastot perustuvat DVV:n dataan, historia käsin koottuihin arvioihin. */
export type Osio = 'tilastot' | 'historia'

export interface HakuAsetukset {
  osio: Osio
  vuosi: number
  sukupuoli: Sukupuoli
  alkukirjaimet: string[]
}

/** Osion sallitut arvot ja oletusvuosi. */
export interface OsionRajat {
  oletusvuosi: number
  min: number
  max: number
  kirjaimet: readonly string[]
}

const OSIOT = ['tilastot', 'historia'] as const
const SUKUPUOLET = ['nainen', 'mies'] as const

/**
 * Lukee hakuasetukset osoitteen kyselyosasta, esim.
 * `?osio=historia&vuosi=1785&sukupuoli=nainen&kirjaimet=A,E`. Puuttuvat tai
 * virheelliset arvot korvataan oletuksilla. Vuosi ja kirjaimet tarkistetaan
 * valitun osion rajoja vasten.
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
}: HakuAsetukset): string {
  const p = new URLSearchParams()
  if (osio !== 'tilastot') p.set('osio', osio)
  p.set('vuosi', String(vuosi))
  p.set('sukupuoli', sukupuoli)
  if (alkukirjaimet.length > 0) p.set('kirjaimet', alkukirjaimet.join(','))
  return `?${p.toString().replaceAll('%2C', ',')}`
}
