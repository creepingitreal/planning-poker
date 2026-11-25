import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_BRAND = 'scrumble'
export const BRAND_FILES = [
  'config.json',
  'tokens.css',
  'logo.svg',
  'logo-mark.svg',
  'favicon.svg',
]

const brandsRoot = fileURLToPath(
  new URL('../client/src/brand/', import.meta.url),
)

export const resolveBrand = (
  requested = process.env.BRAND,
  root = brandsRoot,
) => {
  const id = requested?.trim() || DEFAULT_BRAND
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) {
    throw new Error(
      `Invalid BRAND "${id}": use a folder name of letters, numbers, and hyphens`,
    )
  }

  const dir = join(root, id)
  const missing = BRAND_FILES.filter((file) => !existsSync(join(dir, file)))
  if (missing.length) {
    throw new Error(`Brand "${id}" in ${dir} is missing: ${missing.join(', ')}`)
  }

  return { id, dir, file: (name) => join(dir, name) }
}
