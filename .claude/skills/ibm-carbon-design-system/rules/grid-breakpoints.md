---
title: Grid Breakpoints
impact: HIGH
impactDescription: Wrong breakpoints cause layout breaks and poor responsive behavior
tags: grid, breakpoints, responsive, media-query
---

# Grid Breakpoints

Carbon defines 5 breakpoints. Always use Carbon's breakpoint values for responsive design.

## Breakpoint Reference

| Name | Width | Columns | Margin |
|------|-------|---------|--------|
| `sm` | 320px | 4 | 0 |
| `md` | 672px | 8 | 16px |
| `lg` | 1056px | 16 | 16px |
| `xlg` | 1312px | 16 | 16px |
| `max` | 1584px | 16 | 24px |

## Incorrect

```css
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
@media (min-width: 1280px) { /* large */ }
```
**Why it's wrong**: 768px, 1024px, 1280px are Bootstrap/Tailwind breakpoints, not Carbon.

## Correct

```tsx
import { Grid, Column } from '@carbon/react';

function ResponsiveLayout() {
  return (
    <Grid>
      <Column sm={4} md={4} lg={8} xlg={8}>Main content</Column>
      <Column sm={4} md={4} lg={4} xlg={4}>Sidebar</Column>
    </Grid>
  );
}
```

```css
@media (min-width: 672px) { /* md */ }
@media (min-width: 1056px) { /* lg */ }
@media (min-width: 1312px) { /* xlg */ }
@media (min-width: 1584px) { /* max */ }
```
**Why it's correct**: Uses Carbon's exact breakpoint values. Column component handles responsive behavior declaratively.
