---
title: Search
impact: HIGH
impactDescription: Poor search UX prevents users from finding content
tags: component, search, input, filter
---

# Search

Sizes: sm(32px), md(40px), lg(48px). Features: search icon, clear button, expandable variant, Escape to clear.

## Incorrect

```tsx
<input type="text" placeholder="Search..." onChange={e => handleSearch(e.target.value)} />
```
**Why it's wrong**: No search icon. No clear button. No `role="search"`. No accessible label.

## Correct

```tsx
import { Search } from '@carbon/react';

<Search size="lg" labelText="Search" placeholder="Search topics..."
  onChange={(e) => handleSearch(e.target.value)} onClear={() => handleSearch('')} />

// Expandable in toolbar
<Search size="sm" labelText="Search table" placeholder="Filter rows..." expandable />
```
**Why it's correct**: Search icon and clear button. Accessible label. Escape to clear. Expandable for compact contexts.
