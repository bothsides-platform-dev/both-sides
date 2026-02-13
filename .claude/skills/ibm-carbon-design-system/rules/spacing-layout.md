---
title: Layout Spacing
impact: HIGH
impactDescription: Inconsistent page-level spacing breaks visual flow and content grouping
tags: spacing, layout, sections, page
---

# Layout Spacing

Use layout spacing tokens for page-level structure.

## Layout Tokens

| Token | Value | Use |
|-------|-------|-----|
| `$layout-01` | 16px (1rem) | Compact layout |
| `$layout-02` | 24px (1.5rem) | Default layout |
| `$layout-03` | 32px (2rem) | Medium layout |
| `$layout-04` | 48px (3rem) | Large layout |
| `$layout-05` | 64px (4rem) | XL layout |
| `$layout-06` | 96px (6rem) | Page section spacing |
| `$layout-07` | 160px (10rem) | Hero/banner spacing |

## Incorrect

```tsx
function Page() {
  return (
    <main>
      <section style={{ padding: '45px 0', marginBottom: '60px' }}>Hero</section>
      <section style={{ padding: '30px 0', marginBottom: '55px' }}>Features</section>
    </main>
  );
}
```
**Why it's wrong**: 45px, 60px, 30px, 55px are not on Carbon's scale.

## Correct

```tsx
function Page() {
  return (
    <main className="cds--grid">
      <section style={{ padding: 'var(--cds-layout-07) 0', marginBottom: 'var(--cds-layout-06)' }}>
        <h1 className="cds--type-heading-06">Hero Section</h1>
      </section>
      <section style={{ padding: 'var(--cds-layout-04) 0', marginBottom: 'var(--cds-layout-05)' }}>
        <h2 className="cds--type-heading-04">Features</h2>
      </section>
    </main>
  );
}
```
**Why it's correct**: Layout tokens create consistent, predictable page rhythm.
