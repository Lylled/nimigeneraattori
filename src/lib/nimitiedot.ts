import infodata from '../data/info.json'
import {
  OLETUSDATA,
  type Jakso,
  type Kategoria,
  type NimiData,
  type Rajat,
  type Sukupuoli,
} from './generator'

/** Nimi → [alkuperä, kuvaus] (src/data/info.json, ks. scripts/build_info_json.py). */
export const NIMITIEDOT = infodata as unknown as Record<
  string,
  [string, string]
>

export interface SuosioPiste {
  jakso: Jakso
  /** Nimen osuus jakson top-listan haltijoista (0–1); null, jos ei listalla. */
  osuus: number | null
  /** Sijoitus jakson listalla; null, jos ei listalla. */
  sija: number | null
}

/**
 * Nimen suosio jaksoittain DVV:n top 100 -listoista. Osuus lasketaan listan
 * haltijoista, jotta eri kokoiset ikäluokat ovat vertailukelpoisia.
 */
export function suosiokayra(
  nimi: string,
  sukupuoli: Sukupuoli,
  data: NimiData = OLETUSDATA,
): SuosioPiste[] {
  return data.jaksot.map((jakso) => {
    const rivit = data.nimet[sukupuoli][jakso.alku] ?? []
    const i = rivit.findIndex(([n]) => n === nimi)
    if (i < 0) return { jakso, osuus: null, sija: null }
    const yhteensa = rivit.reduce((s, [, maara]) => s + maara, 0)
    return { jakso, osuus: rivit[i][1] / yhteensa, sija: i + 1 }
  })
}

/**
 * Arvioitujen aineistojen yleisyys jaksoittain: sijoitus muunnetaan samaksi
 * kategoriaksi, jota generaattori käyttää (null = ei jakson listalla).
 */
export function arvioidutTasot(
  nimi: string,
  sukupuoli: Sukupuoli,
  data: NimiData,
  rajat: Rajat,
): { jakso: Jakso; taso: Kategoria | null }[] {
  return data.jaksot.map((jakso) => {
    const rivit = data.nimet[sukupuoli][jakso.alku] ?? []
    const sija = rivit.findIndex(([n]) => n === nimi) + 1
    const taso: Kategoria | null =
      sija === 0
        ? null
        : sija <= rajat.hyvinYleinen
          ? 'hyvinYleinen'
          : sija <= rajat.yleinen
            ? 'yleinen'
            : 'harvinaisempi'
    return { jakso, taso }
  })
}
