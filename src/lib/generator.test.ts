import { describe, expect, it } from 'vitest'
import {
  HISTORIADATA,
  HISTORIARAJAT,
  OLETUSDATA,
  generoi,
  jaksoPainot,
  kaytetytAlkukirjaimet,
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

  it('ottaa kirjatun muodon painavimmalta jaksolta', () => {
    const data: NimiData = {
      ...DATA,
      nimet: {
        nainen: {
          '1910': [['Kaisa', 1, 1, 'Catharina']],
          '1920': [['Kaisa', 1, 1, 'Cajsa']],
        },
        mies: {},
      },
    }
    expect(luokittele(1912, 'nainen', data, RAJAT)[0].kirjattu).toBe(
      'Catharina',
    )
    expect(luokittele(1923, 'nainen', data, RAJAT)[0].kirjattu).toBe('Cajsa')
    expect(luokittele(1914.5, 'nainen', DATA, RAJAT)[0]).not.toHaveProperty(
      'kirjattu',
    )
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

describe('historialliset arviot', () => {
  const { jaksot } = HISTORIADATA

  it('kattaa vuodet 1700–1899 ja jatkuu tilastoista', () => {
    expect(jaksot[0].alku).toBe(1700)
    expect(jaksot[jaksot.length - 1].loppu + 1).toBe(OLETUSDATA.jaksot[0].alku)
  })

  it('täyttää kaikki kategoriat koko aikavälillä', () => {
    for (let vuosi = 1700; vuosi <= 1899; vuosi += 11) {
      for (const sukupuoli of ['nainen', 'mies'] as const) {
        const tulos = generoi(
          { vuosi, sukupuoli, siemen: vuosi, rajat: HISTORIARAJAT },
          HISTORIADATA,
        )
        for (const nimet of Object.values(tulos)) expect(nimet).toHaveLength(5)
      }
    }
  })

  it('palauttaa kirkonkirjojen muodon vanhoille nimille', () => {
    const matti = luokittele(1750, 'mies', HISTORIADATA, HISTORIARAJAT).find(
      (e) => e.nimi === 'Matti',
    )
    expect(matti).toMatchObject({
      kategoria: 'hyvinYleinen',
      kirjattu: 'Matts',
    })
  })
})

describe('alkukirjaimet', () => {
  it('arpoo vain valituilla kirjaimilla alkavia nimiä', () => {
    const tulos = generoi({
      vuosi: 1925,
      sukupuoli: 'molemmat',
      maara: 10,
      siemen: 5,
      alkukirjaimet: ['a', 'E'],
    })
    const kaikki = Object.values(tulos).flat()
    expect(kaikki.length).toBeGreaterThan(0)
    for (const { nimi } of kaikki) expect(['A', 'E']).toContain(nimi[0])
  })

  it('ei muuta nimen kategoriaa', () => {
    const ilman = generoi({
      vuosi: 1925,
      sukupuoli: 'nainen',
      maara: 100,
      siemen: 1,
    })
    const kanssa = generoi({
      vuosi: 1925,
      sukupuoli: 'nainen',
      maara: 100,
      siemen: 1,
      alkukirjaimet: ['A'],
    })
    const aNimet = (t: typeof ilman) =>
      t.hyvinYleinen
        .map((n) => n.nimi)
        .filter((n) => n.startsWith('A'))
        .sort()
    expect(aNimet(kanssa)).toEqual(aNimet(ilman))
  })

  it('palauttaa tyhjät listat, jos kirjaimella ei ole nimiä', () => {
    const tulos = generoi({
      vuosi: 1925,
      sukupuoli: 'nainen',
      alkukirjaimet: ['Q'],
    })
    expect(Object.values(tulos).flat()).toEqual([])
  })
})

describe('kaytetytAlkukirjaimet', () => {
  it('palauttaa aineiston alkukirjaimet aakkosjärjestyksessä', () => {
    const kirjaimet = kaytetytAlkukirjaimet()
    expect(kirjaimet[0]).toBe('A')
    expect(kirjaimet).toContain('V')
    expect(kirjaimet).not.toContain('Q')
  })
})
