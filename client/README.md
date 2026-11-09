# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

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
