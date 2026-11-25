import { beforeEach, describe, expect, it } from 'vitest'
import { renderBrandHtml } from '../../brandHtml.js'

let brandConfig

const transformHtml = (html) => renderBrandHtml(html, brandConfig, 'procode')

beforeEach(() => {
  brandConfig = { name: 'Team Planner' }
})

describe('Brand metadata', () => {
  it('keeps replacement-looking dollar sequences as literal brand text', () => {
    brandConfig = { name: 'Team $& $$ Planner' }

    expect(transformHtml('<title>%BRAND_NAME%</title>')).toBe(
      '<title>Team $&amp; $$ Planner</title>',
    )
  })

  it('uses the configured name and selected brand folder in HTML', () => {
    expect(
      transformHtml(
        '<title>%BRAND_NAME%</title><link href="%BRAND_DIR%/favicon.svg">',
      ),
    ).toBe(
      '<title>Team Planner</title><link href="/src/brand/procode/favicon.svg">',
    )
  })

  it('escapes the configured name as text rather than markup', () => {
    brandConfig = { name: 'Team <&> "Planner\'' }

    expect(transformHtml('<title>%BRAND_NAME%</title>')).toBe(
      '<title>Team &lt;&amp;&gt; &quot;Planner&#39;</title>',
    )
  })

  it.each([undefined, null, '', '  ', 123])(
    'rejects invalid brand name %s',
    (name) => {
      brandConfig = { name }

      expect(() => transformHtml('<title>%BRAND_NAME%</title>')).toThrow(
        'Brand config must contain a non-empty name',
      )
    },
  )
})
