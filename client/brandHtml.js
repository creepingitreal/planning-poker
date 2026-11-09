import { readFileSync } from 'node:fs'

const brandConfigUrl = new URL('./src/brand/config.json', import.meta.url)
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

export const renderBrandHtml = (html, brand) => {
  if (typeof brand?.name !== 'string' || !brand.name.trim()) {
    throw new Error('Brand config must contain a non-empty name')
  }
  return html.replace('%BRAND_NAME%', () => escapeHtml(brand.name))
}

export default {
  name: 'brand-html',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const brand = JSON.parse(readFileSync(brandConfigUrl, 'utf8'))
      return renderBrandHtml(html, brand)
    },
  },
}
