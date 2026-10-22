/**
 * Sukunimien alueet. Erillään sukunimidatasta, jotta valikko ei lataa
 * sukunimiä ennen kuin niitä tarvitaan.
 */
export type Alue =
  'kaikki' | 'lansi' | 'ita' | 'pohjanmaa' | 'karjala' | 'lappi' | 'rannikko'

export const ALUEET: { arvo: Alue; nimi: string }[] = [
  { arvo: 'kaikki', nimi: 'Koko Suomi' },
  { arvo: 'lansi', nimi: 'Länsi-Suomi' },
  { arvo: 'ita', nimi: 'Itä-Suomi' },
  { arvo: 'pohjanmaa', nimi: 'Pohjanmaa' },
  { arvo: 'karjala', nimi: 'Karjala' },
  { arvo: 'lappi', nimi: 'Lappi' },
  { arvo: 'rannikko', nimi: 'Ruotsinkielinen rannikko' },
]
