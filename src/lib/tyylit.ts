import tyylidata from '../data/styles.json'

export type Tyyli =
  | 'luonto'
  | 'raamatullinen'
  | 'kansallisromanttinen'
  | 'hyve'
  | 'perinteinen'
  | 'saatylainen'
  | 'kansainvalinen'

export interface TyylinTiedot {
  avain: Tyyli
  nimi: string
  kuvaus: string
  /** Säätyläisyys on mielekäs jako vain historiallisilla nimillä. */
  vainHistoria?: boolean
}

/** Tyylien määritelmät, ks. docs/tyylit.md. */
export const TYYLIT: TyylinTiedot[] = [
  {
    avain: 'luonto',
    nimi: 'Luonto',
    kuvaus:
      'Kasvit, eläimet, sää, taivas ja luonnon aarteet, esim. Lumi, Pihla, Helmi',
  },
  {
    avain: 'raamatullinen',
    nimi: 'Raamatullinen',
    kuvaus: 'Raamatusta tunnistettavat nimet, esim. Saara, Elias, Joona',
  },
  {
    avain: 'kansallisromanttinen',
    nimi: 'Kansallisromanttinen',
    kuvaus: 'Kalevala, muinaisnimet ja kansallisen heräämisen nimet',
  },
  {
    avain: 'hyve',
    nimi: 'Hyve- ja tunne',
    kuvaus: 'Hyveitä ja tunteita, esim. Toivo, Lempi, Rauha, Onni',
  },
  {
    avain: 'perinteinen',
    nimi: 'Perinteinen',
    kuvaus: 'Suomalaistuneet almanakkanimet, esim. Matti, Kaisa, Pirjo',
  },
  {
    avain: 'saatylainen',
    nimi: 'Säätyläinen',
    kuvaus: 'Aatelin, papiston ja porvariston nimet, esim. Fredrik, Charlotta',
    vainHistoria: true,
  },
  {
    avain: 'kansainvalinen',
    nimi: 'Kansainvälinen',
    kuvaus: 'Samanlaisia monessa kielessä, esim. Anna, Leo, Sofia',
  },
]

/** Nimi → tyylit (src/data/styles.json, ks. scripts/build_styles_json.py). */
export const NIMITYYLIT = tyylidata as Record<string, Tyyli[]>
