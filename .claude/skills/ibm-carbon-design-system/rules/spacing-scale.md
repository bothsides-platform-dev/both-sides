---
title: Spacing Scale
impact: HIGH
impactDescription: Arbitrary spacing creates visual inconsistency and misalignment
tags: spacing, scale, tokens, margin, padding
---

# Spacing Scale

Carbon uses a 9-step spacing scale. Use spacing tokens for all margin, padding, and gap values.

## Spacing Tokens

| Token | Value | CSS Custom Property |
|-------|-------|-------------------|
| `$spacing-01` | 2px (0.125rem) | `var(--cds-spacing-01)` |
| `$spacing-02` | 4px (0.25rem) | `var(--cds-spacing-02)` |
| `$spacing-03` | 8px (0.5rem) | `var(--cds-spacing-03)` |
| `$spacing-04` | 12px (0.75rem) | `var(--cds-spacing-04)` |
| `$spacing-05` | 16px (1rem) | `var(--cds-spacing-05)` |
| `$spacing-06` | 24px (1.5rem) | `var(--cds-spacing-06)` |
| `$spacing-07` | 32px (2rem) | `var(--cds-spacing-07)` |
| `$spacing-08` | 40px (2.5rem) | `var(--cds-spacing-08)` |
| `$spacing-09` | 48px (3rem) | `var(--cds-spacing-09)` |

## Incorrect

```tsx
function Card() {
  return (
    <div style={{ padding: '13px 17px', marginBottom: '23px', gap: '7px' }}>
      <h3 style={{ marginBottom: '11px' }}>Title</h3>
      <p style={{ marginBottom: '19px' }}>Description</p>
    </div>
  );
}
```
**Why it's wrong**: Values like 13px, 17px, 23px don't exist on Carbon's spacing scale.

## Correct

```tsx
function Card() {
  return (
    <Tile style={{
      padding: 'var(--cds-spacing-05)',
      marginBottom: 'var(--cds-spacing-06)',
      display: 'flex', flexDirection: 'column',
      gap: 'var(--cds-spacing-03)'
    }}>
      <h3 className="cds--type-heading-02">Title</h3>
      <p className="cds--type-body-long-01">Description</p>
      <Button kind="primary">Action</Button>
    </Tile>
  );
}
```
**Why it's correct**: All spacing values come from Carbon's scale. Creates consistent vertical rhythm.
