import { readFileSync } from 'node:fs'
import { generate, parse, walk } from 'css-tree'
import { formatHex, parse as parseColour } from 'culori'

export const extractBrandColours = (source) => {
  const declarations = new Map()
  const values = []
  walk(parse(source, { parseCustomProperty: true }), {
    visit: 'Declaration',
    enter(declaration) {
      if (declaration.property.startsWith('--')) {
        declarations.set(declaration.property, declaration.value)
        values.push(declaration.value)
      }
    },
  })

  const resolveColour = (value, visited = new Set()) => {
    const first = value.children?.first
    if (
      value.children?.size === 1 &&
      first?.type === 'Function' &&
      first.name === 'var'
    ) {
      const name = first.children.first?.name
      if (visited.has(name) || !declarations.has(name)) return
      return resolveColour(declarations.get(name), new Set([...visited, name]))
    }

    const colour = parseColour(generate(value))
    if (colour && (colour.alpha === undefined || colour.alpha === 1)) {
      return formatHex(colour)
    }
  }

  return [
    ...new Set(values.map((value) => resolveColour(value)).filter(Boolean)),
  ]
}

export const brandColours = extractBrandColours(
  readFileSync(
    new URL('../client/src/brand/tokens.css', import.meta.url),
    'utf8',
  ),
)
