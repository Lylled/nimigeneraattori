import { describe, expect, it } from 'vitest'
import {
  OLETUSDATA,
  generoi,
  jaksoPainot,
  luokittele,
  type NimiData,
} from './generator'
import { luoSatunnainen, painotettuOtos } from './random'

const JAKSOT = [
  { alku: 1900, loppu: 1909 },
  { alku: 1910, loppu: 1919 },
  { alku: 1920, loppu: 1929 },
]

describe('jaksoPainot', () => {
  it('antaa koko painon jaksolle, jonka keskikohdassa vuosi on', () => {
    expect(jaksoPainot(1914.5, JAKSOT)).toEqual(new Map([[1910, 1]]))
  })

  it('jakaa painon kahden lähimmän jakson kesken', () => {
    const painot = jaksoPainot(1919, JAKSOT)
    expect(painot.get(1910)).toBeCloseTo(0.55)
    expect(painot.get(1920)).toBeCloseTo(0.45)
  })

  it('käyttää reunoilla vain ensimmäistä tai viimeistä jaksoa', () => {
    expect(jaksoPainot(1900, JAKSOT)).toEqual(new Map([[1900, 1]]))
    expect(jaksoPainot(1929, JAKSOT)).toEqual(new Map([[1920, 1]]))
  })

  it('hylkää vuodet aineiston ulkopuolelta', () => {
    expect(() => jaksoPainot(1899, JAKSOT)).toThrow(RangeError)
    expect(() => jaksoPainot(1930, JAKSOT)).toThrow(RangeError)
  })
})

// Pieni testiaineisto: 1910-luvulla 5 nimeä, 1920-luvulla 4.
const DATA: NimiData = {
  lahde: 'testi',
  jaksot: JAKSOT,
  nimet: {
    nainen: {
      '1900': [['Hilma', 50, 0.5]],
      '1910': [
        ['Aino', 50, 0.5],
        ['Helmi', 30, 0.5],
        ['Elsa', 10, 0.5],
        ['Saima', 6, 0.5],
        ['Impi', 4, 0.5],
      ],
      '1920': [
        ['Aino', 40, 0.5],
        ['Kerttu', 40, 0.5],
        ['Helmi', 10, 0.5],
        ['Elsa', 10, 0.5],
      ],
    },
    mies: {
      '1910': [['Eino', 1, 0.5]],
      '1920': [['Eino', 1, 0.5]],
    },
  },
}
const RAJAT = { hyvinYleinen: 1, yleinen: 3 }

describe('luokittele', () => {
  it('luokittelee nimet sijoituksen mukaan', () => {
    const tulos = luokittele(1914.5, 'nainen', DATA, RAJAT)
    expect(tulos.map((e) => [e.nimi, e.kategoria])).toEqual([
      ['Aino', 'hyvinYleinen'],
      ['Helmi', 'yleinen'],
      ['Elsa', 'yleinen'],
      ['Saima', 'harvinaisempi'],
      ['Impi', 'harvinaisempi'],
      // viereisiltä jaksoilta
      ['Hilma', 'harvinaisempi'],
      ['Kerttu', 'harvinaisempi'],
    ])
  })

  it('yhdistää kahden jakson osuudet painojen mukaan', () => {
    const tulos = luokittele(1919.5, 'nainen', DATA, RAJAT)
    const paino = (nimi: string) => tulos.find((e) => e.nimi === nimi)?.paino
    // Aino: 0,5 × 50/100 + 0,5 × 40/100
    expect(paino('Aino')).toBeCloseTo(0.45)
    expect(paino('Kerttu')).toBeCloseTo(0.2)
    expect(tulos[0].nimi).toBe('Aino')
  })
})

describe('painotettuOtos', () => {
  it('ei palauta samaa alkiota kahdesti', () => {
    const otos = painotettuOtos([1, 2, 3, 4], () => 1, 4, luoSatunnainen(1))
    expect([...otos].sort()).toEqual([1, 2, 3, 4])
  })

  it('suosii painavampia alkioita', () => {
    const satunnainen = luoSatunnainen(42)
    let raskas = 0
    for (let i = 0; i < 1000; i++) {
      const [valittu] = painotettuOtos(
        ['kevyt', 'raskas'],
        (a) => (a === 'raskas' ? 9 : 1),
        1,
        satunnainen,
      )
      if (valittu === 'raskas') raskas++
    }
    expect(raskas).toBeGreaterThan(850)
    expect(raskas).toBeLessThan(950)
  })
})

describe('generoi', () => {
  it('tuottaa saman tuloksen samalla siemenellä', () => {
    const asetukset = { vuosi: 1925, sukupuoli: 'nainen' as const, siemen: 7 }
    expect(generoi(asetukset)).toEqual(generoi(asetukset))
  })

  it('palauttaa pyydetyn määrän eri nimiä kuhunkin kategoriaan', () => {
    const tulos = generoi({
      vuosi: 1925,
      sukupuoli: 'molemmat',
      maara: 8,
      siemen: 3,
    })
    for (const nimet of Object.values(tulos)) {
      expect(nimet).toHaveLength(8)
    }
    const kaikki = Object.values(tulos)
      .flat()
      .map((n) => n.nimi)
    expect(new Set(kaikki).size).toBe(kaikki.length)
  })

  it('palauttaa aikakauden nimiä oikealla aineistolla', () => {
    const hyvinYleiset = luokittele(1925, 'mies')
      .filter((e) => e.kategoria === 'hyvinYleinen')
      .map((e) => e.nimi)
    expect(hyvinYleiset).toContain('Eino')
    expect(hyvinYleiset).not.toContain('Leevi')
  })

  it('kattaa koko aineiston aikavälin', () => {
    const { jaksot } = OLETUSDATA
    for (const vuosi of [jaksot[0].alku, jaksot[jaksot.length - 1].loppu]) {
      const tulos = generoi({ vuosi, sukupuoli: 'molemmat', siemen: 1 })
      expect(tulos.hyvinYleinen.length).toBeGreaterThan(0)
    }
  })
})
