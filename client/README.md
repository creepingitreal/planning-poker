# Client

Vue 3 + Vite frontend for Planning Poker, Retro Board, and Spin the Wheel.

## Rebrand Your Fork

Every folder in [src/brand/](src/brand/) is a complete brand. The `BRAND` environment
variable selects which folder is built; it defaults to `scrumble`. No Vue component
changes are needed.

| Brand                           | Description                  |
| ------------------------------- | ---------------------------- |
| [scrumble](src/brand/scrumble/) | Default dark/lime Scrumble   |
| [procode](src/brand/procode/)   | Procode navy, blue, and teal |

To add a brand, copy an existing folder to `src/brand/<name>/` (letters, numbers, and
hyphens) and replace its files:

| File            | Purpose                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `tokens.css`    | All colours, font families, radii, and shadows                           |
| `config.json`   | Browser title (`name`), logo alt text (`logoAlt`), join screen `welcome` |
| `logo.svg`      | Full logo shown in the expanded sidebar and on the join screen           |
| `logo-mark.svg` | Compact mark shown when the sidebar is collapsed                         |
| `favicon.svg`   | Browser tab icon                                                         |

```sh
npm --prefix .. install
npm install
BRAND=procode npm run dev
```

The build fails early with a clear message if the chosen folder is missing or
incomplete. Only the selected brand is bundled. Code imports brand files through the
`@brand` alias (for example `@brand/tokens.css`), so never import a brand folder
directly. The dev server prints its URL. The backend is still required for live rooms;
see the [project setup](../README.md#getting-started). After editing configuration,
refresh the page to update the browser title. Restart Vite after changing `BRAND`.

The backend reads the same `BRAND` variable to exclude the brand's colours from
participant colours, so set it for both the frontend build and the server. The
Dockerfiles, `docker-compose.yml`, and CodeBuild specs accept `BRAND` as a build
argument (`BRAND=procode docker compose up --build`).

### Token Contract

Keep the variable names in [tokens.css](src/brand/scrumble/tokens.css); change their values. Tokens describe a role,
not a particular brand colour. An arbitrary company token export needs a mapping to
these names. The supplied file contains the complete supported contract:

| Tokens                                                                       | Role                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `--color-page`, `--color-text`                                               | Page and sidebar background / primary foreground              |
| `--color-surface`                                                            | Default button background                                     |
| `--color-surface-raised`, `--color-on-surface-raised`                        | Inputs, poker area, and retro column backgrounds / foreground |
| `--color-card`                                                               | Uncoloured retro cards and checkbox hover background          |
| `--color-text-muted`                                                         | Secondary labels and supporting text                          |
| `--color-action`, `--color-on-action`                                        | Prominent surfaces / foreground                               |
| `--color-action-strong`, `--color-action-subtle`                             | Action borders, strong / subtle states                        |
| `--color-accent`, `--color-on-accent`                                        | Selected and highlighted states / foreground                  |
| `--color-border`, `--color-border-subtle`                                    | Standard / low-emphasis borders                               |
| `--color-overlay`                                                            | Sidebar backdrop and divider tint                             |
| `--color-success`, `--color-danger`, `--color-warning`                       | Status colours; warning is reserved for future status UI      |
| `--color-disabled`, `--color-disabled-strong`                                | Disabled checkbox states                                      |
| `--font-body`, `--font-wheel`                                                | UI and canvas font families                                   |
| `--radius-control`, `--radius-input`, `--radius-card`, `--radius-panel`      | Control, input, card, and panel corner radii                  |
| `--shadow-control`, `--shadow-small`, `--shadow-card`, `--shadow-card-hover` | Button, small element, and card shadows                       |
| `--shadow-panel`, `--shadow-wheel`, `--shadow-vote`                          | Sidebar, wheel, and vote shadows                              |
| `--shadow-cursor`                                                            | Wheel cursor drop-shadow; omit spread and `inset`             |

Existing brand tokens can live above the app mapping in the same file:

```css
:root {
  --company-ink: #17211c;
  --company-lime: #b4ed62;

  --color-page: #ffffff;
  --color-text: var(--company-ink);
  --color-action: var(--company-lime);
  --color-on-action: var(--company-ink);
}
```

This example overrides only four values; retain the rest of the supplied sheet.
The token sheet is the single source of truth. Participant allocation automatically
excludes opaque custom-property colours from it on both client and server, retrying
when a generated colour matches. Transparent colours and shadows are ignored.
No separate palette needs updating when replacing the brand folder.
Rebuild the frontend and restart the backend after changing the token sheet.
Check foreground/background pairs together, including muted text and controls on
raised surfaces. Brand tokens do not automatically guarantee accessible contrast.
Participant colours are generated separately from the brand palette. Vote cards,
retro text, and wheel labels choose black or white based on the participant colour's
relative luminance. The participant colour contract is hexadecimal RGB (`#rrggbb`;
the contrast helper also accepts `#rgb`).

### Logos And Fonts

Use self-contained SVGs with a `viewBox`, explicit fill colours, and no embedded
scripts or external assets. Logos are images, not recoloured UI icons: changing a
token will not recolour your artwork. Replace their fills in your design tool.
The default logo artwork retains the existing green appearance.

The full logo fits a 140 x 28 CSS-pixel area; the compact mark fits 28 x 28. Both use
`object-fit: contain`, preserve aspect ratio, and shrink inside narrow sidebars.
A wide full logo and square mark work best. Keep filenames unchanged; using other
formats requires updating the asset imports and favicon MIME type.

For a local font, add the licensed font file beside the tokens and define it there:

```css
@font-face {
  font-family: 'Company Sans';
  src: url('./company-sans.woff2') format('woff2');
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

:root {
  --font-body: 'Company Sans', sans-serif;
  --font-wheel: var(--font-body);
}
```

Use the actual weight range supported by your font. The wheel reads its font on mount
and redraws when fonts finish loading. Refresh after changing the wheel font token.

### Build And Verify

```sh
npm test
npm run build
npm run preview
```

Check the browser title and favicon, collapsed/expanded sidebar logos, poker controls,
retro editing states, and wheel labels on desktop and mobile. Test both your light
and dark colours if applicable. Changing branding requires a new frontend build;
there is no runtime theme selector or backend configuration change. Vite bundles
and versions the assets, so redeploy the complete build rather than individual files.

## Component Tests

Run these commands from `client/`:

```sh
npm install
npm test
npm run test:watch
```

Run one component suite with `npm test -- src/components/Retro/RetroBoard.spec.js`.

Each Vue component under `src/components/` has a colocated Vitest suite using
Vue Test Utils and jsdom. Tests cover rendered states, user interactions,
socket payloads, session restoration, and navigation with an in-memory router.
Shared setup resets browser storage and room state between tests and unmounts
components after each test. Socket.IO and the wheel canvas renderer are mocked;
these tests do not require a running backend or browser.
