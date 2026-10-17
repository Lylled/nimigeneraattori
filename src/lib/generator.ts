import nimidata from '../data/names.json'
import { luoSatunnainen, painotettuOtos } from './random'

export type Sukupuoli = 'nainen' | 'mies'
export type Kategoria = 'hyvinYleinen' | 'yleinen' | 'harvinaisempi'

/** [nimi, haltijoiden määrä jaksolla, osuus ensimmäisenä etunimenä] */
export type NimiRivi = [string, number, number]

export interface Jakso {
  alku: number
  loppu: number
}

/** src/data/names.json, ks. docs/data-schema.md */
export interface NimiData {
  lahde: string
  jaksot: Jakso[]
  nimet: Record<Sukupuoli, Record<string, NimiRivi[]>>
}

/** Sijoitusten ylärajat: sijat 1–20 hyvin yleisiä, 21–60 yleisiä, loput hieman harvinaisempia. */
export interface Rajat {
  hyvinYleinen: number
  yleinen: number
}

export const OLETUSRAJAT: Rajat = { hyvinYleinen: 20, yleinen: 60 }

export interface Ehdokas {
  nimi: string
  sukupuoli: Sukupuoli
  /** Nimen painotettu osuus valitun vuoden ympäristössä; käytetään arvonnassa. */
  paino: number
  kategoria: Kategoria
}

export interface GeneroituNimi {
  nimi: string
  sukupuoli: Sukupuoli
}

export type Tulos = Record<Kategoria, GeneroituNimi[]>

export const OLETUSDATA = nimidata as unknown as NimiData

/**
 * Laskee, kuinka paljon kukin jakso painaa annettuna syntymävuonna.
 * Paino jakautuu lineaarisesti kahden lähimmän jakson keskikohtien välillä,
 * jotta jaksojen raja ei ole jyrkkä (esim. 1919 ≈ 1910-luku + vähän 1920-lukua).
 */
export function jaksoPainot(
  vuosi: number,
  jaksot: readonly Jakso[],
): Map<number, number> {
  const ensimmainen = jaksot[0]
  const viimeinen = jaksot[jaksot.length - 1]
  if (vuosi < ensimmainen.alku || vuosi > viimeinen.loppu) {
    throw new RangeError(
      `Vuoden pitää olla välillä ${ensimmainen.alku}–${viimeinen.loppu}`,
    )
  }
  const keskikohta = (j: Jakso) => (j.alku + j.loppu) / 2
  if (vuosi <= keskikohta(ensimmainen)) return new Map([[ensimmainen.alku, 1]])
  if (vuosi >= keskikohta(viimeinen)) return new Map([[viimeinen.alku, 1]])

  const i = jaksot.findIndex(
    (j, k) => vuosi >= keskikohta(j) && vuosi < keskikohta(jaksot[k + 1]),
  )
  const [a, b] = [jaksot[i], jaksot[i + 1]]
  const t = (vuosi - keskikohta(a)) / (keskikohta(b) - keskikohta(a))
  // Nollapainoinen jakso jätetään pois, jotta sen nimet käsitellään
  // naapurijakson niminä eivätkä jää arvonnassa painoon 0.
  if (t === 0) return new Map([[a.alku, 1]])
  return new Map([
    [a.alku, 1 - t],
    [b.alku, t],
  ])
}

/**
 * Luokittelee yhden sukupuolen nimet kategorioihin annetun vuoden mukaan.
 *
 * Nimen paino on sen osuus jakson top-listasta painotettuna jaksojen
 * painoilla. Nimet järjestetään painon mukaan, ja kategoria määräytyy
 * sijoituksesta. "Hieman harvinaisempiin" lisätään myös nimet, jotka ovat
 * viereisen jakson listalla mutta eivät tämän vuoden listoilla: ne olivat
 * aikalaisille tuttuja, mutta eivät tavallisimpia.
 */
export function luokittele(
  vuosi: number,
  sukupuoli: Sukupuoli,
  data: NimiData = OLETUSDATA,
  rajat: Rajat = OLETUSRAJAT,
): Ehdokas[] {
  const painot = jaksoPainot(vuosi, data.jaksot)
  const nimet = data.nimet[sukupuoli]

  const pisteet = new Map<string, number>()
  for (const [jakso, paino] of painot) {
    const rivit = nimet[jakso] ?? []
    const yhteensa = rivit.reduce((s, [, maara]) => s + maara, 0)
    for (const [nimi, maara] of rivit) {
      pisteet.set(nimi, (pisteet.get(nimi) ?? 0) + (paino * maara) / yhteensa)
    }
  }

  const jarjestetty = [...pisteet].sort((a, b) => b[1] - a[1])
  const ehdokkaat: Ehdokas[] = jarjestetty.map(([nimi, paino], i) => ({
    nimi,
    sukupuoli,
    paino,
    kategoria:
      i < rajat.hyvinYleinen
        ? 'hyvinYleinen'
        : i < rajat.yleinen
          ? 'yleinen'
          : 'harvinaisempi',
  }))

  const pienin = jarjestetty[jarjestetty.length - 1]?.[1] ?? 1
  for (const jakso of viereisetJaksot(painot, data.jaksot)) {
    for (const [nimi] of nimet[jakso] ?? []) {
      if (pisteet.has(nimi)) continue
      pisteet.set(nimi, pienin / 2)
      ehdokkaat.push({
        nimi,
        sukupuoli,
        paino: pienin / 2,
        kategoria: 'harvinaisempi',
      })
    }
  }
  return ehdokkaat
}

/** Painavimman jakson naapurijaksot, joita ei jo käytetty painoissa. */
function viereisetJaksot(
  painot: Map<number, number>,
  jaksot: readonly Jakso[],
): number[] {
  const [paajakso] = [...painot].sort((a, b) => b[1] - a[1])[0]
  const i = jaksot.findIndex((j) => j.alku === paajakso)
  return [jaksot[i - 1], jaksot[i + 1]]
    .filter((j): j is Jakso => j !== undefined && !painot.has(j.alku))
    .map((j) => j.alku)
}

export interface GenerointiAsetukset {
  vuosi: number
  sukupuoli: Sukupuoli | 'molemmat'
  /** Montako nimeä kuhunkin kategoriaan arvotaan. */
  maara?: number
  /** Sama siemen tuottaa samat nimet; oletuksena satunnainen. */
  siemen?: number
  rajat?: Rajat
}

/** Arpoo nimet kuhunkin kategoriaan. Sama nimi ei toistu yhdellä kerralla. */
export function generoi(
  {
    vuosi,
    sukupuoli,
    maara = 5,
    siemen = Math.floor(Math.random() * 2 ** 32),
    rajat = OLETUSRAJAT,
  }: GenerointiAsetukset,
  data: NimiData = OLETUSDATA,
): Tulos {
  const sukupuolet: Sukupuoli[] =
    sukupuoli === 'molemmat' ? ['nainen', 'mies'] : [sukupuoli]
  const ehdokkaat = sukupuolet.flatMap((s) => luokittele(vuosi, s, data, rajat))
  const satunnainen = luoSatunnainen(siemen)

  const arvo = (kategoria: Kategoria) =>
    painotettuOtos(
      ehdokkaat.filter((e) => e.kategoria === kategoria),
      (e) => e.paino,
      maara,
      satunnainen,
    ).map(({ nimi, sukupuoli }) => ({ nimi, sukupuoli }))

  return {
    hyvinYleinen: arvo('hyvinYleinen'),
    yleinen: arvo('yleinen'),
    harvinaisempi: arvo('harvinaisempi'),
  }
}
