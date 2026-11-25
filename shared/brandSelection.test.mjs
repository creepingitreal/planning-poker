import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { BRAND_FILES, DEFAULT_BRAND, resolveBrand } from './brandSelection.mjs'

const createBrandsRoot = (files = BRAND_FILES) => {
  const root = mkdtempSync(join(tmpdir(), 'brands-'))
  mkdirSync(join(root, 'acme'))
  files.forEach((file) => writeFileSync(join(root, 'acme', file), ''))
  return root
}

test('ships complete scrumble and procode brands', () => {
  for (const id of ['scrumble', 'procode']) {
    assert.equal(resolveBrand(id).id, id)
  }
})

test('falls back to the default brand when BRAND is unset or blank', () => {
  for (const id of [undefined, '', '  ']) {
    assert.equal(resolveBrand(id).id, DEFAULT_BRAND)
  }
})

test('resolves files inside the chosen brand folder', () => {
  const root = createBrandsRoot()

  assert.equal(
    resolveBrand(' acme ', root).file('tokens.css'),
    join(root, 'acme', 'tokens.css'),
  )
})

test('rejects brand names that could leave the brand folder', () => {
  for (const id of ['../scrumble', 'acme/logo', '.hidden']) {
    assert.throws(() => resolveBrand(id), /Invalid BRAND/)
  }
})

test('lists missing files for an incomplete brand', () => {
  const root = createBrandsRoot(['config.json', 'tokens.css'])

  assert.throws(
    () => resolveBrand('acme', root),
    /is missing: logo\.svg, logo-mark\.svg, favicon\.svg/,
  )
})
