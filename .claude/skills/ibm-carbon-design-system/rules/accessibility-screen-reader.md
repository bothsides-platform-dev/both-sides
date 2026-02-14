---
title: Screen Reader Support
impact: CRITICAL
impactDescription: Missing semantic markup makes content invisible to screen reader users
tags: accessibility, screen-reader, aria, semantic, a11y
---

# Screen Reader Support

Use semantic HTML and ARIA attributes to ensure all content is perceivable for screen reader users.

## Priority: Native HTML > ARIA

1. Use native elements first (`<button>`, `<nav>`, `<main>`, `<dialog>`)
2. Add ARIA only when native semantics are insufficient
3. Never override existing native semantics with ARIA

## Key Requirements

| Requirement | Implementation |
|-------------|---------------|
| Landmarks | `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` |
| Headings | Logical h1-h6, no skipped levels |
| Images | `alt` text for meaningful, `alt=""` for decorative |
| Icons | `aria-label` or `aria-hidden="true"` with adjacent text |
| Forms | `<label>` associated with every input |
| Live regions | `aria-live` for dynamic content updates |

## Incorrect

```tsx
function Navigation() {
  return (
    <div className="nav-wrapper">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <img src="/logo.png" />
      </div>
      <div className="nav-link" onClick={() => navigate('/about')}>About</div>
    </div>
  );
}
```
**Why it's wrong**: No `<nav>` landmark. Clickable divs instead of links. Image has no alt text.

## Correct

```tsx
import { Header, HeaderName, HeaderNavigation, HeaderMenuItem } from '@carbon/react';

function Navigation() {
  return (
    <Header aria-label="Application header">
      <HeaderName href="/" prefix="IBM">
        <img src="/logo.png" alt="Application name" />
      </HeaderName>
      <HeaderNavigation aria-label="Main navigation">
        <HeaderMenuItem href="/about">About</HeaderMenuItem>
      </HeaderNavigation>
    </Header>
  );
}
```
**Why it's correct**: Carbon's UI Shell provides proper nav landmark, semantic links, and ARIA labels.

## ARIA Live Regions

```tsx
function SearchResults({ results, loading }) {
  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="cds--visually-hidden">
        {loading ? 'Searching...' : `${results.length} results found`}
      </div>
      <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
    </div>
  );
}
```
