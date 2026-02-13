---
title: Typography Tokens
impact: HIGH
impactDescription: Arbitrary font sizes create visual inconsistency and break the type scale
tags: typography, tokens, scale, type
---

# Typography Tokens

Use Carbon's predefined type tokens for all text. Never use arbitrary font sizes, weights, or line heights.

## Type Token Reference

| Token | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|---------------|
| `heading-07` | 3.375rem (54px) | 300 | 1.199 | 0 |
| `heading-06` | 2.625rem (42px) | 300 | 1.199 | 0 |
| `heading-05` | 2rem (32px) | 400 | 1.25 | 0 |
| `heading-04` | 1.75rem (28px) | 400 | 1.28571 | 0 |
| `heading-03` | 1.25rem (20px) | 400 | 1.4 | 0 |
| `heading-02` | 1rem (16px) | 600 | 1.375 | 0 |
| `heading-01` | 0.875rem (14px) | 600 | 1.28571 | 0.16px |
| `body-long-02` | 1rem (16px) | 400 | 1.5 | 0 |
| `body-long-01` | 0.875rem (14px) | 400 | 1.42857 | 0.16px |
| `body-short-02` | 1rem (16px) | 400 | 1.375 | 0 |
| `body-short-01` | 0.875rem (14px) | 400 | 1.28571 | 0.16px |
| `caption-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `label-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `helper-text-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `code-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `code-02` | 0.875rem (14px) | 400 | 1.28571 | 0.16px |

## CSS Classes

```css
.cds--type-heading-03
.cds--type-body-long-01
.cds--type-caption-01
.cds--type-label-01
```

## Incorrect

```tsx
function ArticleCard() {
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: '1.2' }}>
        Article Title
      </h2>
      <p style={{ fontSize: '15px', lineHeight: '1.6' }}>Description</p>
      <span style={{ fontSize: '11px', color: 'gray' }}>Published 3 days ago</span>
    </div>
  );
}
```
**Why it's wrong**: 22px, 15px, 11px are not on Carbon's type scale. `bold` (700) is not used in Carbon. Arbitrary line-heights break vertical rhythm.

## Correct

```tsx
function ArticleCard() {
  return (
    <Tile>
      <h2 className="cds--type-heading-03">Article Title</h2>
      <p className="cds--type-body-long-01">Description</p>
      <span className="cds--type-caption-01">Published 3 days ago</span>
    </Tile>
  );
}
```
**Why it's correct**: heading-03 (20px), body-long-01 (14px), caption-01 (12px) create a clear hierarchy using Carbon's type scale.
