import sukunimidata from '../data/surnames.json'
import type { Sukupuoli } from './generator'
import type { Alue } from './alueet'
import { painotettuOtos } from './random'

export { ALUEET, type Alue } from './alueet'

/**
 * Miten hahmo nimetään: aikakauden mukaan, pelkällä isännimellä,
 * isännimellä ja talonnimellä vai perinnöllisellä sukunimellä.
 */
export type Nimimuoto = 'auto' | 'isa' | 'isatalo' | 'suku'

export type Sukunimityyppi =
  | 'ita_nen'
  | 'lansi_vanha'
  | 'talonnimi'
  | 'suomalaistettu'
  | 'ruotsalainen'
  | 'sotilasnimi'
  | 'saatynimi'
  | 'saame'
  | 'ortodoksinen'
  | 'muu'

/** src/data/surnames.json, ks. scripts/build_surnames_json.py. */
export interface SukunimiTieto {
  nimi: string
  /** Nykyisten kantajien määrä DVV:n sukunimitilastossa. */
  kantajia: number
  tyyppi: Sukunimityyppi
  alueet: Exclude<Alue, 'kaikki'>[]
  /** Arvioitu vuosi, josta lähtien nimi oli yleisesti sukunimenä käytössä. */
  alkaen: number
  kuvaus: string
}

/** [nimi, kantajia, tyyppi, alueet, alkaen, kuvaus] */
type SukunimiRivi = [string, number, Sukunimityyppi, string, number, string]

export const SUKUNIMET: SukunimiTieto[] = (
  sukunimidata as unknown as { nimet: SukunimiRivi[] }
).nimet.map(([nimi, kantajia, tyyppi, alueet, alkaen, kuvaus]) => ({
  nimi,
  kantajia,
  tyyppi,
  alueet: alueet.split(' ') as SukunimiTieto['alueet'],
  alkaen,
  kuvaus,
}))

export const SUKUNIMI = new Map(SUKUNIMET.map((s) => [s.nimi, s]))

export const TYYPIT: Record<Sukunimityyppi, string> = {
  ita_nen: 'Vanha itäsuomalainen -nen-nimi',
  lansi_vanha: 'Vanha länsisuomalainen sukunimi',
  talonnimi: 'Talonnimestä vakiintunut sukunimi',
  suomalaistettu: 'Suomalaistamisen aikana otettu nimi',
  ruotsalainen: 'Ruotsinkielinen sukunimi',
  sotilasnimi: 'Sotilasnimi',
  saatynimi: 'Sääty- tai pappissuvun nimi',
  saame: 'Saamelainen sukunimi',
  ortodoksinen: 'Karjalainen tai ortodoksinen nimi',
  muu: 'Muu sukunimi',
}

/** Alueet, joilla isännimet olivat käytössä ennen sukunimiä. */
const ISANNIMIALUEET: Alue[] = ['lansi', 'pohjanmaa', 'lappi', 'rannikko']

/** Siirtymä isännimistä sukunimiin (1880–1919) ja sukunimilaki 1920. */
export const SIIRTYMA = { alku: 1880, loppu: 1920 }

/**
 * Sukunimi on uskottava, jos se oli käytössä viimeistään hahmon
 * aikuistuessa: esimerkiksi 1880 syntynyt saattoi suomalaistaa nimensä 1906.
 */
const AIKUISTUMINEN = 25

/** Näin harvoista ehdokkaista samat nimet toistuisivat; käytetään koko maata. */
const VAHIMMAISMAARA = 10

/** Suomenkielinen genetiivi isännimeä varten (Matti → Matin, Tuomas → Tuomaksen). */
export function genetiivi(nimi: string): string {
  if (/[aeiouyäö]s$/.test(nimi)) {
    // Tuomas → Tuomaksen, Johannes → Johanneksen, Markus → Markuksen
    return `${nimi.slice(0, -1)}ksen`
  }
  if (/[aeiouyäö]$/.test(nimi)) {
    // Astevaihtelu: Matti → Matin, Pekka → Pekan, Jooseppi → Joosepin
    const heikko = nimi.replace(
      /(kk|tt|pp)([aeiouyäö])$/,
      (_, kk, v) => kk[0] + v,
    )
    return `${heikko}n`
  }
  return `${nimi}in`
}

/** Ruotsalainen isännimi kirkonkirjoihin (Johan → Johansson, Anders → Andersdotter). */
export function ruotsalainenIsannimi(
  isa: string,
  sukupuoli: Sukupuoli,
): string {
  const pohja = isa.endsWith('s') ? isa : `${isa}s`
  return pohja + (sukupuoli === 'mies' ? 'son' : 'dotter')
}

/** Suomenkielinen isännimi (Juho → Juhonpoika, Juhontytär). */
export function isannimi(isa: string, sukupuoli: Sukupuoli): string {
  return genetiivi(isa) + (sukupuoli === 'mies' ? 'poika' : 'tytär')
}

/**
 * Isän nimen ruotsalainen kirjoitusasu kirkonkirjoissa, jos nimi oli
 * suomenkielinen (Juho → Johan). Muut nimet kirjattiin sellaisinaan.
 */
const RUOTSALAISET_MUODOT: Record<string, string> = {
  Juho: 'Johan',
  Juhana: 'Johan',
  Matti: 'Matts',
  Antti: 'Anders',
  Heikki: 'Henrik',
  Kalle: 'Karl',
  Kaarle: 'Carl',
  Kaarlo: 'Karl',
  Pekka: 'Petter',
  Jaakko: 'Jakob',
  Mikko: 'Mikael',
  Erkki: 'Erik',
  Kustaa: 'Gustaf',
  Iisakki: 'Isak',
  Taavetti: 'David',
  Tuomas: 'Thomas',
  Simo: 'Simon',
  Aapo: 'Abraham',
  Vihtori: 'Viktor',
  Eemeli: 'Emil',
  Oskari: 'Oskar',
  Aleksanteri: 'Alexander',
  Jalmari: 'Hjalmar',
  Lauri: 'Lars',
  Yrjö: 'Georg',
  Olli: 'Olof',
  Paavo: 'Paul',
  Martti: 'Mårten',
  Niilo: 'Nils',
  Eljas: 'Elias',
  Samuli: 'Samuel',
}

export interface Isa {
  nimi: string
  kirjattu?: string
  /** Arvontapaino; oletuksena kaikki isät yhtä todennäköisiä. */
  paino?: number
}

export interface GeneroituSukunimi {
  muoto: Exclude<Nimimuoto, 'auto'>
  /** Perinnöllinen sukunimi tai talonnimi (tiedot: SUKUNIMI). */
  sukunimi?: string
  /** Suomenkielinen isännimi, esim. Juhonpoika. */
  isannimi?: string
  /** Isännimi kirkonkirjojen ruotsalaisessa asussa, esim. Johansson. */
  kirjattuIsannimi?: string
}

export interface SukunimiAsetukset {
  vuosi: number
  sukupuoli: Sukupuoli
  alue: Alue
  muoto: Nimimuoto
  /** Isän nimen ehdokkaat noin 30 vuotta aiemmin syntyneistä. */
  isat: readonly Isa[]
  /** Suomenruotsalaisessa perinteessä isännimi on suoraan ruotsiksi. */
  ruotsiksi?: boolean
}

/** Sukunimet, jotka sopivat alueelle ja olivat käytössä viimeistään vuonna. */
export function sukunimiehdokkaat(
  vuosi: number,
  alue: Alue,
  tyypit?: readonly Sukunimityyppi[],
): SukunimiTieto[] {
  return SUKUNIMET.filter(
    (s) =>
      s.alkaen <= vuosi + AIKUISTUMINEN &&
      (alue === 'kaikki' || s.alueet.includes(alue)) &&
      (!tyypit || tyypit.includes(s.tyyppi)),
  )
}

/**
 * Päättää nimimuodon aikakauden ja alueen mukaan: idässä sukunimi, lännessä
 * isännimi ja talonnimi ennen vuotta 1880. Siirtymäaikana sukunimen
 * todennäköisyys kasvaa tasaisesti sukunimilakiin (1920) asti.
 */
export function aikakaudenMuoto(
  vuosi: number,
  alue: Alue,
  satunnainen: () => number,
): Exclude<Nimimuoto, 'auto'> {
  // Koko Suomessa arvotaan, onko hahmo isännimialueelta.
  const lannesta =
    alue === 'kaikki' ? satunnainen() < 0.6 : ISANNIMIALUEET.includes(alue)
  if (!lannesta || vuosi >= SIIRTYMA.loppu) return 'suku'
  const osuus = (vuosi - SIIRTYMA.alku) / (SIIRTYMA.loppu - SIIRTYMA.alku)
  if (satunnainen() < osuus) return 'suku'
  return alue === 'rannikko' ? 'isa' : 'isatalo'
}

const arvo = <T>(
  alkiot: readonly T[],
  paino: (t: T) => number,
  satunnainen: () => number,
): T | undefined => painotettuOtos(alkiot, paino, 1, satunnainen)[0]

/** Arpoo hahmolle sukunimen, isännimen tai molemmat. */
export function generoiSukunimi(
  { vuosi, sukupuoli, alue, muoto, isat, ruotsiksi = false }: SukunimiAsetukset,
  satunnainen: () => number,
): GeneroituSukunimi {
  const valittu =
    muoto === 'auto' ? aikakaudenMuoto(vuosi, alue, satunnainen) : muoto
  const tulos: GeneroituSukunimi = { muoto: valittu }

  if (valittu === 'suku') {
    // Alueen nimistä, tai koko maasta, jos alueelle on aikakaudelta vain
    // muutama nimi (esim. rannikko 1700-luvulla).
    const ehdokkaat = sukunimiehdokkaat(vuosi, alue)
    const valinta =
      ehdokkaat.length >= VAHIMMAISMAARA
        ? ehdokkaat
        : sukunimiehdokkaat(vuosi, 'kaikki')
    tulos.sukunimi = arvo(valinta, (s) => s.kantajia, satunnainen)?.nimi
    return tulos
  }

  const isa = arvo(isat, (i) => i.paino ?? 1, satunnainen)
  if (isa) {
    const kirjattu = isa.kirjattu ?? RUOTSALAISET_MUODOT[isa.nimi] ?? isa.nimi
    if (ruotsiksi) {
      tulos.isannimi = ruotsalainenIsannimi(kirjattu, sukupuoli)
    } else {
      tulos.isannimi = isannimi(isa.nimi, sukupuoli)
      tulos.kirjattuIsannimi = ruotsalainenIsannimi(kirjattu, sukupuoli)
    }
  }

  if (valittu === 'isatalo') {
    // Talonnimet ovat vanhoja, joten niitä ei rajata vuoden mukaan. Jos
    // alueelta ei ole talonnimiä (esim. idästä), käytetään koko maan nimiä.
    const talot = SUKUNIMET.filter((s) => s.tyyppi === 'talonnimi')
    const alueelta = talot.filter(
      (s) => alue === 'kaikki' || s.alueet.includes(alue),
    )
    tulos.sukunimi = arvo(
      alueelta.length > 0 ? alueelta : talot,
      (s) => s.kantajia,
      satunnainen,
    )?.nimi
  }
  return tulos
}
