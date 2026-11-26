---
name: CSS styling
description: "Use when writing, editing, or refactoring CSS in client/src: component stylesheets, style.css, nested CSS, media queries, brand tokens, hover/focus states, and reduced motion."
applyTo: 'client/src/**/*.css'
---

# CSS Styling

Use [retro-card.css](../../client/src/components/Retro/retro-card.css) and [sub-nav.css](../../client/src/components/SubNav/sub-nav.css) as the structural reference.

## File ownership

- Each component has one adjacent kebab-case stylesheet (`RetroCard.vue` → `retro-card.css`) that the component imports with `import './retro-card.css'`. Don't use `<style>` blocks in `.vue` files.
- Stylesheets are global, not scoped. Every rule in a component stylesheet must be inside that component's root class so it can't leak into other components.
- Global element styles, shared utility classes (`.text-small`, `.section-layout`, `.button-section`), and base `button`/`input`/`label` styles live in [style.css](../../client/src/style.css). Reuse them rather than redefining them. Add a new shared class only when several components need it.
- Tailwind is imported for its base reset only. Don't add Tailwind utility classes or `@apply`.

## Nesting

Use native CSS nesting, with one top-level block per component root:

```css
.retro-card {
  display: flex;
  padding: 15px 20px;

  &.retro-card-hidden {
    padding: 10px 12px;
  }

  .card-like-button {
    color: var(--color-text-muted);

    &:hover,
    &.liked {
      color: var(--color-danger);
    }
  }

  @media screen and (min-width: 640px) {
    padding: 20px 25px;
  }
}
```

- Use `&` for states, pseudo-classes, and modifiers on the same element: `&:hover`, `&:focus-visible`, `&.active`, `&:disabled`, `&::placeholder`.
- Use a plain nested selector for descendants: `.card-actions`, not `& .card-actions`.
- Nest media queries inside the rule they change. Don't collect them in a block at the end of the file.
- Keep nesting at most 3 levels deep below the root. If you need more, give the element its own class and nest it higher up.
- Order inside a block: the element's own declarations, then `&` states and modifiers, then child selectors, then nested `@media`.
- Prefer class selectors. Only use element selectors (`textarea`, `button.icon-only`) when nested inside a component class.

## Tokens and values

- Use brand tokens from `client/src/brand/<brand>/tokens.css` for every colour, font, radius, and shadow: `var(--color-*)`, `var(--font-*)`, `var(--radius-*)`, `var(--shadow-*)`. Never hardcode hex, `rgb()`, or named colours, so every brand keeps working.
- Choose tokens by meaning: put text on `--color-accent` in `--color-on-accent`, and use `--color-danger` for destructive actions.
- Derive tints with `color-mix(in srgb, var(--token) 15%, transparent)` instead of adding colour values.
- Use a component-local custom property for variants that share rules, and give `var()` a fallback:

  ```css
  .icon-btn-delete {
    --card-action-color: var(--color-danger);
  }
  .icon-btn {
    color: var(--card-action-color, var(--color-accent));
  }
  ```

- Set dynamic values such as participant colours or measured sizes as custom properties or inline `:style` bindings from the component. Never generate CSS strings.
- Use `px` for spacing, borders, and fixed sizes and `rem` for font sizes, matching the existing files.

## Responsive and motion

- Write the mobile styles first, then add `@media screen and (min-width: 640px)` (and `761px` where already used) to enhance larger screens.
- Every `transition` or `animation` needs a nested `@media (prefers-reduced-motion: reduce)` override that turns it off.
- Interactive elements need a visible `&:focus-visible` style. Never remove outlines without a replacement.
- Hover-only colour changes aren't enough to show state. Pair them with a class such as `&.active` or `&.liked` that the template sets.

## Checklist

1. Rules are scoped under the component's root class and nested with `&` where they target the same element.
2. No hardcoded colours, fonts, radii, or shadows, and no Tailwind utilities.
3. Media queries are nested and mobile-first, and motion respects reduced-motion.
4. You removed unused selectors and duplicates of rules already in `style.css`.
5. Run `npm run prettier` from the root, then `npm test` and `npm run build` from `client/`.
