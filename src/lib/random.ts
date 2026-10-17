/** Siemenluvulla toimiva satunnaislukugeneraattori (mulberry32). */
export function luoSatunnainen(siemen: number): () => number {
  let tila = siemen >>> 0
  return () => {
    tila = (tila + 0x6d2b79f5) >>> 0
    let t = tila
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Arpoo enintään n alkiota ilman toistoja. Alkion todennäköisyys tulla
 * valituksi on verrannollinen sen painoon.
 */
export function painotettuOtos<T>(
  alkiot: readonly T[],
  paino: (alkio: T) => number,
  n: number,
  satunnainen: () => number,
): T[] {
  const jaljella = [...alkiot]
  const valitut: T[] = []
  while (valitut.length < n && jaljella.length > 0) {
    const summa = jaljella.reduce((s, a) => s + paino(a), 0)
    let kohta = satunnainen() * summa
    let i = 0
    while (i < jaljella.length - 1 && kohta >= paino(jaljella[i])) {
      kohta -= paino(jaljella[i])
      i++
    }
    valitut.push(jaljella.splice(i, 1)[0])
  }
  return valitut
}
