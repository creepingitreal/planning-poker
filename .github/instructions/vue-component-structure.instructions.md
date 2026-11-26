---
name: Vue component structure
description: 'Use when creating, moving, or refactoring Vue components in client/src/components. Covers atomic design levels (atoms, molecules, organisms, templates, pages), the Poker.vue structure, required component tests, shared controls, explicit props and events, and focused component ownership.'
applyTo: 'client/src/components/**'
---

# Vue Component Structure

Use [Poker.vue](../../client/src/components/organisms/Poker/Poker.vue) as the structural reference for new and refactored components.

## Atomic design

Every component belongs to exactly one level and lives at `client/src/components/<level>/<ComponentName>/` with `ComponentName.vue`, `ComponentName.spec.js`, and, if it has styles, a kebab-case `component-name.css`.

| Level         | Responsibility                                                                         | May import                          | Socket / router / global state | Examples                                                              |
| ------------- | -------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| **atoms**     | Smallest UI building blocks, with no domain workflow. Fully driven by props.           | nothing but other atoms (e.g. Icon) | ❌                             | `Icon`, `Vote`                                                        |
| **molecules** | A small group of atoms with one interaction contract. Emits intent.                    | atoms                               | ❌                             | `ButtonSection`, `RetroCard`, `SubNav`, `MessageModal`                |
| **organisms** | A self-contained section of a feature. May own its feature state and socket listeners. | atoms, molecules, organisms         | ✅                             | `Poker`, `RetroBoard`, `SpinTheWheel`, `Users`, `NavBar`, `SidePanel` |
| **templates** | Page layout and chrome with slots or `RouterView`. No feature logic.                   | organisms and below                 | Only for chrome state          | `Layout`                                                              |
| **pages**     | Route components. Wire route, session, and server state into templates and organisms.  | anything below                      | ✅                             | `JoinRoom`, `Dashboard`, `Room`                                       |

- Imports go downward only. A component never imports one from a higher level or from a sibling page.
- Atoms and molecules are presentational: they don't import `socket.js`, `vue-router`, or `client/src/js/roomNav.js` state. Pass data in as props and emit events out. `ButtonSection` currently breaks this by emitting reveal to the socket itself (clear is already emitted as a `clear` intent to its owner); don't copy that pattern, and move the socket call to its owner when refactoring it.
- Pick the lowest level that fits. Promote a component (e.g. molecule → organism) only when it needs to own state or side effects, and move its folder when you do.
- Before creating a component, check whether an existing one at the same level can be reused or extended with an optional prop.
- Only route components go in `pages/`, and the router imports from `pages/` and `templates/` only.

## Tests are required

A component isn't finished until its colocated `ComponentName.spec.js` exists and passes the 80% coverage gate (`npm test` in `client/`). Cover what fits the level:

- **Atoms/molecules:** rendering for each prop variant and default, slot content, every emitted event with its payload, disabled and hidden states, keyboard interaction, and accessible names.
- **Organisms/pages:** the above, plus the exact socket payloads emitted, handling of incoming socket events (including partial or malformed data), listener cleanup on unmount, navigation and route guards, and session restoration.
- **Templates:** which chrome renders for each route and session state, and how events are forwarded.

Stub child components (`global.stubs`) when testing a parent's contract, and test the child in its own spec. See [copilot-instructions.md](../copilot-instructions.md#testing) for the full testing rules.

## Component shape

- Keep the template as the primary description of the UI. Organize it into a few clear top-level sections.
- Use `<script setup>` for component logic.
- Keep imports at the top, followed by props, emits, local state, computed values, handlers, and lifecycle/socket subscriptions.
- Keep the component focused on one screen or reusable UI responsibility.
- Remove unused props, imports, refs, computed values, and handlers during refactors.
- Keep CSS in the component's adjacent stylesheet and import it from the component.

## Props and events

- Define every input with `defineProps` and give required inputs an explicit `required: true` contract.
- Use defaults for optional objects, arrays, and booleans so the template can render safely before data arrives.
- Define emitted events once with `defineEmits`; assign it to `emit` when handlers need to emit events.
- Child components emit intent such as `reveal`, `clear`, `select`, or `update`, rather than reaching into parent state.
- Parent components own room-level state and perform the final socket action, then pass updated data back through props.
- Prefer named handlers (`revealCards`, `clearBoard`, `handleSelection`) over inline logic when an action has more than one operation.

## Shared controls

- Reuse shared components such as `ButtonSection` instead of duplicating common controls.
- Extend shared components with optional props for labels or visibility when a neighboring workflow has the same behavior with different wording.
- Preserve existing defaults when extending a shared component so current consumers do not change behavior.
- Keep workflow-specific controls beside the shared controls in the owning component. For example, a retro timer belongs in `RetroBoard`, while room navigation belongs in `Room`.

## State and real-time behavior

- Keep transient UI state local: selected items, open forms, editing ids, and measured element references belong to the component that renders them.
- Keep shared room or board state in the nearest owner and pass it down rather than duplicating it in child components.
- Socket listeners must be registered once and removed in `onUnmounted` when the component owns them.
- Validate incoming server data defensively with optional chaining and safe defaults.
- Send socket events from named handlers with the smallest payload needed by the server.
- Keep server-backed state authoritative: after an action, render the broadcast state instead of inventing a separate optimistic copy unless the existing workflow explicitly requires it.

## Rendering and styling

- Use `v-for` keys from stable domain ids.
- Use `v-if` for controls whose availability depends on state, such as reveal or like actions.
- Keep repeated item rendering in a child component when the item has its own styling or interaction contract, as `RetroBoard` does with `RetroCard`.
- Avoid nested page-level components that render another instance of the same page component.
- Avoid duplicating layout or button rules that already exist in the component stylesheet or shared styles.
- Keep templates readable: use computed values and named handlers instead of long expressions in bindings.

## Refactoring checklist

1. Confirm the component's atomic level and folder, and that its imports only point downward.
2. Identify the component's owning state and remove state that belongs to its parent or child.
3. Match the `Poker.vue` order: imports, props, emits, state, computed values, handlers, subscriptions, cleanup.
4. Replace duplicated controls with a shared component where the interaction contract matches.
5. Use explicit props and emitted events at every component boundary.
6. Preserve existing socket event names and payload contracts unless the server is changed at the same time.
7. Add or update the colocated spec, then run `npm test` (including the 80% coverage gate) and `npm run build` from `client/`.
