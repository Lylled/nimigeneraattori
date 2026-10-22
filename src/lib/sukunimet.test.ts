import { describe, expect, it } from 'vitest'
import { luoSatunnainen } from './random'
import {
  SUKUNIMI,
  aikakaudenMuoto,
  generoiSukunimi,
  genetiivi,
  isannimi,
  ruotsalainenIsannimi,
  sukunimiehdokkaat,
} from './sukunimet'

describe('isännimet', () => {
  it('taivuttaa isän nimen genetiiviin', () => {
    expect(genetiivi('Juho')).toBe('Juhon')
    expect(genetiivi('Matti')).toBe('Matin')
    expect(genetiivi('Pekka')).toBe('Pekan')
    expect(genetiivi('Jooseppi')).toBe('Joosepin')
    expect(genetiivi('Tuomas')).toBe('Tuomaksen')
    expect(genetiivi('Johannes')).toBe('Johanneksen')
    expect(genetiivi('Kalle')).toBe('Kallen')
    expect(genetiivi('Fredrik')).toBe('Fredrikin')
    expect(genetiivi('Frans')).toBe('Fransin')
  })

  it('muodostaa pojan ja tyttären isännimet', () => {
    expect(isannimi('Antti', 'mies')).toBe('Antinpoika')
    expect(isannimi('Juho', 'nainen')).toBe('Juhontytär')
    expect(ruotsalainenIsannimi('Johan', 'mies')).toBe('Johansson')
    expect(ruotsalainenIsannimi('Anders', 'nainen')).toBe('Andersdotter')
    expect(ruotsalainenIsannimi('Matts', 'mies')).toBe('Mattsson')
  })
})

describe('aikakaudenMuoto', () => {
  const aina = (arvo: number) => () => arvo

  it('käyttää idässä sukunimeä ja lännessä isännimeä ennen 1880', () => {
    expect(aikakaudenMuoto(1800, 'ita', aina(0.5))).toBe('suku')
    expect(aikakaudenMuoto(1800, 'lansi', aina(0.5))).toBe('isatalo')
    expect(aikakaudenMuoto(1800, 'rannikko', aina(0.5))).toBe('isa')
  })

  it('siirtyy sukunimiin 1880–1920', () => {
    expect(aikakaudenMuoto(1890, 'lansi', aina(0.1))).toBe('suku')
    expect(aikakaudenMuoto(1890, 'lansi', aina(0.9))).toBe('isatalo')
    expect(aikakaudenMuoto(1920, 'lansi', aina(0.99))).toBe('suku')
  })
})

describe('sukunimiehdokkaat', () => {
  it('ei tarjoa suomalaistettuja nimiä ennen kuin niitä otettiin käyttöön', () => {
    const tyypit1800 = new Set(
      sukunimiehdokkaat(1800, 'kaikki').map((s) => s.tyyppi),
    )
    expect(tyypit1800.has('suomalaistettu')).toBe(false)
    expect(
      sukunimiehdokkaat(1950, 'kaikki').some((s) => s.nimi === 'Virtanen'),
    ).toBe(true)
  })

  it('rajaa alueen mukaan', () => {
    for (const s of sukunimiehdokkaat(2000, 'ita')) {
      expect(s.alueet).toContain('ita')
    }
  })
})

describe('generoiSukunimi', () => {
  const isat = [{ nimi: 'Juho', kirjattu: 'Johan' }]

  it('antaa länsisuomalaiselle 1800-luvulla isännimen ja talonnimen', () => {
    const tulos = generoiSukunimi(
      { vuosi: 1820, sukupuoli: 'mies', alue: 'lansi', muoto: 'auto', isat },
      luoSatunnainen(1),
    )
    expect(tulos).toMatchObject({
      muoto: 'isatalo',
      isannimi: 'Juhonpoika',
      kirjattuIsannimi: 'Johansson',
    })
    expect(SUKUNIMI.get(tulos.sukunimi!)?.tyyppi).toBe('talonnimi')
  })

  it('kirjoittaa suomenruotsalaisen isännimen suoraan ruotsiksi', () => {
    const tulos = generoiSukunimi(
      {
        vuosi: 1820,
        sukupuoli: 'nainen',
        alue: 'rannikko',
        muoto: 'isa',
        isat,
        ruotsiksi: true,
      },
      luoSatunnainen(1),
    )
    expect(tulos).toEqual({ muoto: 'isa', isannimi: 'Johansdotter' })
  })

  it('antaa sukunimen valitun muodon mukaan', () => {
    const tulos = generoiSukunimi(
      { vuosi: 1990, sukupuoli: 'nainen', alue: 'kaikki', muoto: 'auto', isat },
      luoSatunnainen(2),
    )
    expect(tulos.muoto).toBe('suku')
    expect(SUKUNIMI.has(tulos.sukunimi!)).toBe(true)
  })
})
