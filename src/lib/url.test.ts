import { describe, expect, it } from 'vitest'
import {
  kirjoitaAsetukset,
  lueAsetukset,
  type HakuAsetukset,
  type Osio,
  type OsionRajat,
} from './url'

const OSIOT: Record<Osio, OsionRajat> = {
  tilastot: {
    oletusvuosi: 1925,
    min: 1900,
    max: 2026,
    kirjaimet: ['A', 'E', 'Ä'],
    tyylit: ['luonto', 'hyve'],
  },
  historia: {
    oletusvuosi: 1850,
    min: 1700,
    max: 1899,
    kirjaimet: ['A', 'K'],
    tyylit: ['luonto', 'saatylainen'],
  },
}
const OLETUS: HakuAsetukset = {
  osio: 'tilastot',
  perinne: 'kaikki',
  vuosi: 1925,
  sukupuoli: 'nainen',
  alkukirjaimet: [],
  tyylit: [],
  sukunimi: false,
  alue: 'kaikki',
}

const lue = (haku: string) =>
  lueAsetukset(haku, { osio: 'tilastot', sukupuoli: 'nainen' }, OSIOT)

describe('lueAsetukset', () => {
  it('lukee kaikki asetukset', () => {
    expect(lue('?vuosi=1985&sukupuoli=mies&kirjaimet=a,Ä')).toEqual({
      osio: 'tilastot',
      perinne: 'kaikki',
      vuosi: 1985,
      sukupuoli: 'mies',
      alkukirjaimet: ['A', 'Ä'],
      tyylit: [],
      sukunimi: false,
      alue: 'kaikki',
    })
  })

  it('käyttää oletuksia puuttuville ja virheellisille arvoille', () => {
    expect(lue('')).toEqual(OLETUS)
    expect(lue('?vuosi=1850&sukupuoli=molemmat&kirjaimet=Q,E,E')).toEqual({
      ...OLETUS,
      alkukirjaimet: ['E'],
    })
    expect(lue('?vuosi=abc').vuosi).toBe(1925)
    expect(lue('?osio=muu').osio).toBe('tilastot')
  })

  it('tarkistaa vuoden ja kirjaimet valitun osion rajoista', () => {
    expect(lue('?osio=historia&vuosi=1785&kirjaimet=K,E')).toEqual({
      osio: 'historia',
      perinne: 'kaikki',
      vuosi: 1785,
      sukupuoli: 'nainen',
      alkukirjaimet: ['K'],
      tyylit: [],
      sukunimi: false,
      alue: 'kaikki',
    })
    expect(lue('?osio=historia&vuosi=1925').vuosi).toBe(1850)
  })
})

describe('tyylit', () => {
  it('lukee ja kirjoittaa osion sallitut tyylit', () => {
    expect(lue('?tyylit=hyve,saatylainen,hyve,muu').tyylit).toEqual(['hyve'])
    expect(lue('?osio=historia&tyylit=saatylainen').tyylit).toEqual([
      'saatylainen',
    ])
    const asetukset: HakuAsetukset = { ...OLETUS, tyylit: ['luonto', 'hyve'] }
    const haku = kirjoitaAsetukset(asetukset)
    expect(haku).toBe('?vuosi=1925&sukupuoli=nainen&tyylit=luonto,hyve')
    expect(lue(haku)).toEqual(asetukset)
  })
})

describe('nimiperinne', () => {
  it('lukee ja kirjoittaa perinteen, oletus jää pois', () => {
    expect(lue('?perinne=muu').perinne).toBe('kaikki')
    const asetukset: HakuAsetukset = {
      ...OLETUS,
      osio: 'historia',
      perinne: 'ortodoksinen',
      vuosi: 1850,
    }
    const haku = kirjoitaAsetukset(asetukset)
    expect(haku).toBe(
      '?osio=historia&perinne=ortodoksinen&vuosi=1850&sukupuoli=nainen',
    )
    expect(lue(haku)).toEqual(asetukset)
  })
})

describe('sukunimi', () => {
  it('lukee ja kirjoittaa alueen vain, kun sukunimi on päällä', () => {
    const asetukset: HakuAsetukset = {
      ...OLETUS,
      osio: 'historia',
      vuosi: 1850,
      sukunimi: true,
      alue: 'pohjanmaa',
    }
    const haku = kirjoitaAsetukset(asetukset)
    expect(haku).toBe(
      '?osio=historia&vuosi=1850&sukupuoli=nainen&sukunimi=1&alue=pohjanmaa',
    )
    expect(lue(haku)).toEqual(asetukset)
    expect(kirjoitaAsetukset({ ...OLETUS, alue: 'ita' })).toBe(
      '?vuosi=1925&sukupuoli=nainen',
    )
    expect(lue('?alue=savo')).toMatchObject({
      alue: 'kaikki',
    })
  })
})

describe('kirjoitaAsetukset', () => {
  it('tuottaa luettavan osoitteen, jonka voi lukea takaisin', () => {
    const asetukset: HakuAsetukset = {
      osio: 'tilastot',
      perinne: 'kaikki',
      vuosi: 1905,
      sukupuoli: 'mies',
      alkukirjaimet: ['A', 'E'],
      tyylit: [],
      sukunimi: false,
      alue: 'kaikki',
    }
    const haku = kirjoitaAsetukset(asetukset)
    expect(haku).toBe('?vuosi=1905&sukupuoli=mies&kirjaimet=A,E')
    expect(lue(haku)).toEqual(asetukset)
  })

  it('jättää kirjaimet pois, kun niitä ei ole valittu', () => {
    expect(kirjoitaAsetukset(OLETUS)).toBe('?vuosi=1925&sukupuoli=nainen')
  })

  it('kirjoittaa historiaosion osoitteeseen', () => {
    const asetukset: HakuAsetukset = {
      ...OLETUS,
      osio: 'historia',
      vuosi: 1785,
    }
    const haku = kirjoitaAsetukset(asetukset)
    expect(haku).toBe('?osio=historia&vuosi=1785&sukupuoli=nainen')
    expect(lue(haku)).toEqual(asetukset)
  })
})
