import { readFileSync } from 'node:fs'

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  )

export const renderBrandHtml = (html, brand, brandId) => {
  if (typeof brand?.name !== 'string' || !brand.name.trim()) {
    throw new Error('Brand config must contain a non-empty name')
  }
  return html
    .replace('%BRAND_NAME%', () => escapeHtml(brand.name))
    .replace('%BRAND_DIR%', () => `/src/brand/${encodeURIComponent(brandId)}`)
}

export const createBrandHtml = (selected) => ({
  name: 'brand-html',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const brand = JSON.parse(
        readFileSync(selected.file('config.json'), 'utf8'),
      )
      return renderBrandHtml(html, brand, selected.id)
    },
  },
})
