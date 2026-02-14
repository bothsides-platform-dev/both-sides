---
title: IBM Plex Typeface
impact: HIGH
impactDescription: Incorrect fonts break visual identity and readability
tags: typography, font, plex, typeface
---

# IBM Plex Typeface

Carbon uses the IBM Plex type family exclusively. Always load IBM Plex with proper fallback stacks. Never substitute with other typefaces.

## Font Families

| Family | Use Case | CSS Value |
|--------|----------|-----------|
| IBM Plex Sans | Primary UI text, headings, body | `'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif` |
| IBM Plex Mono | Code, technical data, tabular numbers | `'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace` |
| IBM Plex Serif | Editorial, long-form reading (rare) | `'IBM Plex Serif', 'Georgia', Times, serif` |

## Font Weights

| Weight | Value | Use |
|--------|-------|-----|
| Light | 300 | Display headings (heading-06, heading-07) |
| Regular | 400 | Body text, most headings |
| SemiBold | 600 | Small headings (heading-01, heading-02), emphasis |

## Incorrect

```tsx
function Header() {
  return (
    <h1 style={{
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: '32px'
    }}>
      Dashboard
    </h1>
  );
}
```
**Why it's wrong**: Uses Arial instead of IBM Plex Sans. Uses bold (700) weight which is not in Carbon's type scale. Hardcoded font size instead of type token.

## Correct

```tsx
function Header() {
  return (
    <h1 className="cds--type-heading-05">
      Dashboard
    </h1>
  );
}
```
**Why it's correct**: Uses Carbon type token class which sets correct font-family, weight, size, and line-height. Includes proper fallback stack.

## Loading IBM Plex

```tsx
// Via @carbon/react (recommended)
import '@carbon/react/css/reset';
import '@carbon/react/css/grid';
import '@carbon/react/css/type';

// Or via Google Fonts
// <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600&display=swap" rel="stylesheet">
```
