# Project Guidelines

Real-time Planning Poker, Retro, and Spin-the-Wheel app: Vue 3 + Vite client, Node.js/Express 5 + Socket.IO server. See [README.md](../README.md) for setup and [client/README.md](../client/README.md) for branding.

## Architecture

- `client/` – Vue 3 (`<script setup>`, Composition API). Components follow **atomic design**: `client/src/components/{atoms,molecules,organisms,templates,pages}/<Component>/`, each folder holding the `.vue`, an adjacent `.css`, and a colocated `*.spec.js`. Component structure rules are in [vue-component-structure.instructions.md](instructions/vue-component-structure.instructions.md); styling rules are in [css-styling.instructions.md](instructions/css-styling.instructions.md).
- `server/` – Socket.IO handlers split by feature (`poker.js`, `retro.js`) over in-memory state in `state.js`. There is no database. State is lost on restart.
- `shared/` – Plain `.mjs` modules imported by both client and server (colour allocation, brand selection).
- `client/src/brand/<name>/` – One folder per brand (tokens, logos, app name). Selected with `BRAND` at build time.

## Core Principles

1. **Server is authoritative.** Room, vote, retro, and timer state is owned by `server/state.js`. The client emits intent and renders the state the server broadcasts. Don't keep a parallel client copy or apply optimistic updates unless the existing workflow already does.
2. **Socket events are a contract.** Event names and payload shapes (e.g. `castVote`, `addCard`, participant `{ participantId, user, vote, color, socketId }`) must change on the client and server in the same change. Send the smallest payload the server needs.
3. **Validate on the server.** Treat every socket payload as untrusted: check the room exists, the sender is a participant, and inputs are the expected type and length. Fail safely rather than throwing.
4. **Shared logic lives in `shared/`.** Put logic that both sides need in `shared/*.mjs`. Don't copy it into `client/` or `server/`. Keep it dependency-free and framework-agnostic.
5. **Brand-agnostic UI.** Never hardcode colours, fonts, logos, or the app name in components. Use the CSS custom properties from the brand `tokens.css` and the `@brand` alias. A new brand must work without editing Vue components.
6. **Simple, surgical changes.** Solve the request with the least code. Don't add dependencies, abstractions, or files unless clearly needed. Reuse existing components (e.g. `ButtonSection`) and helpers before writing new ones. Remove dead code you create.
7. **Accessible by default.** Use semantic elements (`button`, `label`, `dialog`, lists). Every control needs an accessible name. Interactions must work by keyboard with a visible focus state. Don't convey meaning by colour alone, because participant colours are random. Use `getContrastingTextColour` for text on coloured backgrounds.

## Code Style

- Prettier (root [.prettierrc](../.prettierrc)): no semicolons, single quotes, 2-space indent. Run `npm run prettier` from the root.
- ES modules everywhere (`import`/`export`, `"type": "module"`).
- **British spelling** for new identifiers, comments, and UI copy (`colour`, `organise`, `behaviour`). Don't rename existing contracts to change spelling. Keep the participant `color` field, CSS properties, and `--color-*` tokens as they are.
- Comment only non-obvious behaviour.

## Testing

Every new component, module, and behaviour change ships with new or updated tests in the same change. A change without tests is incomplete.

### Coverage

- Minimum **80%** statements, branches, functions, and lines. `npm test` in `client/` enforces this through thresholds in [vitest.config.js](../client/vitest.config.js) and fails below them.
- Treat 80% as a floor for each file you touch, not just the global number. Don't lower thresholds, add coverage exclusions, or use `/* v8 ignore */` to get a change through.
- Coverage shows untested code. It doesn't prove behaviour is right, so every test needs meaningful assertions.

### What must be tested

- **Components:** rendering for each prop/state combination, including empty, loading, and missing data; `v-if` branches; user interactions (click, input, keyboard); emitted events and their payloads; and accessible names and roles for controls.
- **Real-time behaviour:** the socket events emitted with exact payloads, the UI's response to incoming events (including malformed or partial data), and listener removal on unmount.
- **Routing and session:** navigation, route guards, query/state handling, and storage restoration.
- **Logic modules** (`client/src/js/`, `shared/`): every exported function, including edge cases, boundaries, invalid input, and randomness (stub `Math.random`).
- **Bug fixes:** a regression test that fails before the fix.

### How to test

- **Client:** Vitest + `@vue/test-utils` + jsdom. Put `<Component>.spec.js` next to the component and `<module>.spec.js` next to the module. Use the helpers in `client/src/test/helpers.js` (`createTestRouter`, `receiveSocketEvent`) and the socket mock from `client/src/test/setup.js` rather than real sockets. Mock third-party UI libraries with `vi.mock`, as [SpinTheWheel.spec.js](../client/src/components/organisms/SpinTheWheel/SpinTheWheel.spec.js) does.
- **Shared:** `node:test` + `node:assert/strict` in `shared/*.test.mjs`.
- **Server:** put server logic in pure functions that can be tested without a live socket, and test them with `node:test`.
- Test behaviour that users can see and emitted socket events, not implementation details. Prefer querying by role, text, or stable class over component internals.
- Keep tests deterministic: use fake timers for timers, stub randomness, and await async rendering instead of using arbitrary delays.

## Build and Test

```bash
npm install                                      # root: shared token-parsing deps
cd client && npm test                            # Vitest suite + 80% coverage gate
cd client && npm run build                       # production build check
node --test shared/*.test.mjs                    # shared module tests
docker compose up -d server && curl localhost:8000/health   # backend
```

Before finishing, run the client tests and build for any client change. Run the shared tests for any change in `shared/`.
