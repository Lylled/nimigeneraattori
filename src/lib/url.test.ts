import { describe, expect, it } from 'vitest'
import { kirjoitaAsetukset, lueAsetukset, type HakuAsetukset } from './url'

const OLETUS: HakuAsetukset = {
  vuosi: 1925,
  sukupuoli: 'nainen',
  alkukirjaimet: [],
}
const VUODET = { min: 1900, max: 2026 }
const KIRJAIMET = ['A', 'E', 'Ä']

const lue = (haku: string) => lueAsetukset(haku, OLETUS, VUODET, KIRJAIMET)

describe('lueAsetukset', () => {
  it('lukee kaikki asetukset', () => {
    expect(lue('?vuosi=1985&sukupuoli=mies&kirjaimet=a,Ä')).toEqual({
      vuosi: 1985,
      sukupuoli: 'mies',
      alkukirjaimet: ['A', 'Ä'],
    })
  })

  it('käyttää oletuksia puuttuville ja virheellisille arvoille', () => {
    expect(lue('')).toEqual(OLETUS)
    expect(lue('?vuosi=1850&sukupuoli=molemmat&kirjaimet=Q,E,E')).toEqual({
      ...OLETUS,
      alkukirjaimet: ['E'],
    })
    expect(lue('?vuosi=abc').vuosi).toBe(1925)
  })
})

describe('kirjoitaAsetukset', () => {
  it('tuottaa luettavan osoitteen, jonka voi lukea takaisin', () => {
    const asetukset: HakuAsetukset = {
      vuosi: 1905,
      sukupuoli: 'mies',
      alkukirjaimet: ['A', 'E'],
    }
    const haku = kirjoitaAsetukset(asetukset)
    expect(haku).toBe('?vuosi=1905&sukupuoli=mies&kirjaimet=A,E')
    expect(lue(haku)).toEqual(asetukset)
  })

  it('jättää kirjaimet pois, kun niitä ei ole valittu', () => {
    expect(kirjoitaAsetukset(OLETUS)).toBe('?vuosi=1925&sukupuoli=nainen')
  })
})
