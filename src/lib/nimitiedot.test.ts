import { describe, expect, it } from 'vitest'
import { HISTORIADATA, HISTORIARAJAT, type NimiData } from './generator'
import { NIMITIEDOT, arvioidutTasot, suosiokayra } from './nimitiedot'

const DATA: NimiData = {
  lahde: 'testi',
  jaksot: [
    { alku: 1900, loppu: 1909 },
    { alku: 1910, loppu: 1919 },
  ],
  nimet: {
    nainen: {
      '1900': [
        ['Aino', 30, 1],
        ['Helmi', 10, 1],
      ],
      '1910': [['Helmi', 50, 1]],
    },
    mies: {},
  },
}

describe('suosiokayra', () => {
  it('laskee osuuden ja sijan jaksoittain', () => {
    expect(suosiokayra('Helmi', 'nainen', DATA)).toEqual([
      { jakso: DATA.jaksot[0], osuus: 0.25, sija: 2 },
      { jakso: DATA.jaksot[1], osuus: 1, sija: 1 },
    ])
  })

  it('merkitsee puuttuvat jaksot nulliksi', () => {
    const [, toinen] = suosiokayra('Aino', 'nainen', DATA)
    expect(toinen).toMatchObject({ osuus: null, sija: null })
    expect(
      suosiokayra('Eino', 'mies', DATA).every((p) => p.osuus === null),
    ).toBe(true)
  })
})

describe('arvioidutTasot', () => {
  it('muuntaa sijan kategoriaksi', () => {
    const tasot = arvioidutTasot('Helmi', 'nainen', DATA, {
      hyvinYleinen: 1,
      yleinen: 2,
    })
    expect(tasot.map((t) => t.taso)).toEqual(['yleinen', 'hyvinYleinen'])
    const matti = arvioidutTasot('Matti', 'mies', HISTORIADATA, HISTORIARAJAT)
    expect(matti[0].taso).toBe('hyvinYleinen')
  })
})

describe('NIMITIEDOT', () => {
  it('kuvaa jokaisen nimen', () => {
    expect(NIMITIEDOT['Aino']?.[0]).toBe('suomi')
  })
})
