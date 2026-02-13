---
title: Column Grid
impact: HIGH
impactDescription: Incorrect column usage breaks layout proportions and content alignment
tags: grid, columns, layout, responsive
---

# 16-Column Grid

Carbon uses a 16-column grid (4 at sm, 8 at md, 16 at lg+). Layouts are built by spanning columns, not using arbitrary widths.

## Column Spans

| Pattern | sm (4) | md (8) | lg (16) |
|---------|--------|--------|---------|
| Full width | 4 | 8 | 16 |
| Half | 4 | 4 | 8 |
| Sidebar + Content | 4+4 | 2+6 | 4+12 |

## Grid Modes

| Mode | Gutter | Use |
|------|--------|-----|
| Wide (default) | 32px | Standard layouts |
| Narrow | 16px | Dense content, data tables |
| Condensed | 1px | Highly compact layouts |

## Incorrect

```tsx
function ThreeColumnLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '25%' }}>Nav</div>
      <div style={{ width: '50%' }}>Content</div>
      <div style={{ width: '25%' }}>Aside</div>
    </div>
  );
}
```
**Why it's wrong**: Percentage widths don't align to Carbon's column grid. Missing gutters.

## Correct

```tsx
import { Grid, Column } from '@carbon/react';

function ThreeColumnLayout() {
  return (
    <Grid>
      <Column sm={4} md={2} lg={4}><nav>Nav</nav></Column>
      <Column sm={4} md={4} lg={8}><main>Content</main></Column>
      <Column sm={4} md={2} lg={4}><aside>Aside</aside></Column>
    </Grid>
  );
}
```
**Why it's correct**: Column spans (4+8+4=16) align to the grid. Responsive behavior per breakpoint. Proper gutters and margins.
