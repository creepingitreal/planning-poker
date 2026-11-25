import assert from 'node:assert/strict'
import { test } from 'node:test'
import { brandColours, extractBrandColours } from './brandColours.mjs'
import {
  allocateParticipantColours,
  generateUniqueColour,
  prohibitedColours,
} from './colourAllocation.mjs'

test('derives forbidden colours from CSS tokens without duplicates', () => {
  assert.deepEqual(prohibitedColours, brandColours)
  assert.ok(prohibitedColours.includes('#b0e454'))
  assert.equal(new Set(prohibitedColours).size, prohibitedColours.length)
})

test('reads new opaque tokens, normalizes colours, and ignores comments and transparency', () => {
  assert.deepEqual(
    extractBrandColours(`
    :root {
      /* --color-unused: #123456; */
      --company-ink: #ABC;
      --color-text: var(--company-ink);
      --color-rgb: rgb(12 34 56);
      --color-named: rebeccapurple;
      --color-opaque: rgb(10 20 30 / 1);
      --color-transparent: #abcdef80;
      --color-overlay: rgb(0 0 0 / 0.2);
      --color-empty: transparent;
      --color-cycle: var(--color-cycle);
      --font-body: sans-serif;
      --shadow-small: 0 1px 2px #123456;
    }
  `),
    ['#aabbcc', '#0c2238', '#663399', '#0a141e'],
  )
})

test('includes colours from every theme declaration', () => {
  assert.deepEqual(
    extractBrandColours(`
      :root { --color-page: #ffffff; }
      [data-theme="dark"] { --color-page: #0d0d0d; }
    `),
    ['#ffffff', '#0d0d0d'],
  )
})

test('allows colours used only in transparent brand tokens', (context) => {
  const candidates = ['#0e216d', '#000000']
  context.mock.method(
    Math,
    'random',
    () => Number.parseInt(candidates.shift().slice(1), 16) / 0x1000000,
  )

  assert.equal(generateUniqueColour(new Set()), '#0e216d')
  assert.equal(generateUniqueColour(new Set()), '#000000')
  assert.deepEqual(
    allocateParticipantColours(['Alex', 'Sam'], {
      Alex: '#0e216d',
      Sam: '#000000',
    }),
    { Alex: '#0e216d', Sam: '#000000' },
  )
})

test('regenerates every forbidden brand colour and taken colour', (context) => {
  const candidates = [...prohibitedColours, '#abcdef', '#123456']
  context.mock.method(
    Math,
    'random',
    () => Number.parseInt(candidates.shift().slice(1), 16) / 0x1000000,
  )

  assert.equal(generateUniqueColour(new Set(['#ABCDEF'])), '#123456')
  assert.equal(candidates.length, 0)
})

test('replaces forbidden assignments while retaining allowed colours', (context) => {
  context.mock.method(Math, 'random', () => 0x123456 / 0x1000000)

  assert.deepEqual(
    allocateParticipantColours(['Alex', 'Sam'], {
      Alex: '#B0E454',
      Sam: '#ABCDEF',
    }),
    { Alex: '#123456', Sam: '#abcdef' },
  )
})
