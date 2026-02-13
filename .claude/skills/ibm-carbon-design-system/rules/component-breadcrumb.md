---
title: Breadcrumb
impact: HIGH
impactDescription: Missing breadcrumbs reduce wayfinding ability and navigation efficiency
tags: component, breadcrumb, navigation, wayfinding
---

# Breadcrumb

Shows user's location in site hierarchy. Last item is current page (not a link, uses `aria-current="page"`). Place below header, above page title.

## Incorrect

```tsx
function Breadcrumbs({ path }) {
  return (
    <div>
      {path.map((item, i) => (
        <span key={i}>
          <a href={item.href}>{item.label}</a>
          {i < path.length - 1 && ' > '}
        </span>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No `<nav>` landmark. Current page is a link. Using `>` instead of standard separator.

## Correct

```tsx
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';

function PageBreadcrumbs({ path }) {
  return (
    <Breadcrumb noTrailingSlash>
      {path.map((item, i) => (
        <BreadcrumbItem
          key={i}
          href={i < path.length - 1 ? item.href : undefined}
          isCurrentPage={i === path.length - 1}
        >
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
```
**Why it's correct**: Renders inside `<nav aria-label="Breadcrumb">`. Last item gets `aria-current="page"`. Proper separators added automatically.
