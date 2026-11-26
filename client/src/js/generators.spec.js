import { describe, expect, it, vi } from 'vitest'
import { generateRoomId, randomNameGenerator } from './generators.js'

describe('generateRoomId', () => {
  it('returns eight alphanumeric characters in hyphenated pairs', () => {
    expect(generateRoomId()).toMatch(/^[A-Za-z0-9]{2}(-[A-Za-z0-9]{2}){3}$/)
  })

  it('uses the first and last characters at the random bounds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(generateRoomId()).toBe('AA-AA-AA-AA')

    Math.random.mockReturnValue(0.9999)
    expect(generateRoomId()).toBe('99-99-99-99')
  })
})

describe('randomNameGenerator', () => {
  it('returns three capitalised words', () => {
    expect(randomNameGenerator()).toMatch(/^[A-Z][\w-]* [A-Z][\w-]* [A-Z]\w*$/)
  })

  it('picks deterministically from the word lists', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const first = randomNameGenerator()

    expect(randomNameGenerator()).toBe(first)
    Math.random.mockReturnValue(0.9999)
    expect(randomNameGenerator()).not.toBe(first)
  })
})
