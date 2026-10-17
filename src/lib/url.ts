import type { Sukupuoli } from './generator'

export interface HakuAsetukset {
  vuosi: number
  sukupuoli: Sukupuoli
  alkukirjaimet: string[]
}

const SUKUPUOLET = ['nainen', 'mies'] as const

/**
 * Lukee hakuasetukset osoitteen kyselyosasta, esim.
 * `?vuosi=1885&sukupuoli=nainen&kirjaimet=A,E`. Puuttuvat tai virheelliset
 * arvot korvataan oletuksilla.
 */
export function lueAsetukset(
  haku: string,
  oletus: HakuAsetukset,
  sallitutVuodet: { min: number; max: number },
  sallitutKirjaimet: readonly string[],
): HakuAsetukset {
  const p = new URLSearchParams(haku)

  const vuosi = Number(p.get('vuosi'))
  const sukupuoli = p.get('sukupuoli')
  const kirjaimet = (p.get('kirjaimet') ?? '')
    .split(',')
    .map((k) => k.trim().toLocaleUpperCase('fi'))
    .filter((k) => sallitutKirjaimet.includes(k))

  return {
    vuosi:
      p.has('vuosi') &&
      Number.isInteger(vuosi) &&
      vuosi >= sallitutVuodet.min &&
      vuosi <= sallitutVuodet.max
        ? vuosi
        : oletus.vuosi,
    sukupuoli: SUKUPUOLET.find((s) => s === sukupuoli) ?? oletus.sukupuoli,
    alkukirjaimet: p.has('kirjaimet')
      ? [...new Set(kirjaimet)]
      : oletus.alkukirjaimet,
  }
}

/** Muodostaa asetuksista kyselyosan, jonka voi jakaa linkkinä. */
export function kirjoitaAsetukset({
  vuosi,
  sukupuoli,
  alkukirjaimet,
}: HakuAsetukset): string {
  const p = new URLSearchParams({ vuosi: String(vuosi), sukupuoli })
  if (alkukirjaimet.length > 0) p.set('kirjaimet', alkukirjaimet.join(','))
  return `?${p.toString().replaceAll('%2C', ',')}`
}
