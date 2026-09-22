---
name: Vue component structure
description: Use when creating or refactoring Vue components in client/src/components. Follow the simple GameBoard structure, shared controls, explicit props and events, and focused component ownership.
applyTo: "client/src/components/**/*.vue"
---

# Vue Component Structure

Use `client/src/components/Poker/GameBoard.vue` as the structural reference for new and refactored components.

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

1. Identify the component's owning state and remove state that belongs to its parent or child.
2. Match the `GameBoard.vue` order: imports, props, emits, state, computed values, handlers, subscriptions, cleanup.
3. Replace duplicated controls with a shared component where the interaction contract matches.
4. Use explicit props and emitted events at every component boundary.
5. Preserve existing socket event names and payload contracts unless the server is changed at the same time.
6. Run `npm run build` from `client/` and check touched files for diagnostics.
