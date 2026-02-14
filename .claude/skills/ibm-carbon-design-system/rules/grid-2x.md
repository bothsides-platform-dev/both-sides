---
title: 2x Grid System
impact: HIGH
impactDescription: Ignoring the 2x grid creates misaligned layouts and inconsistent proportions
tags: grid, 2x, layout, alignment, mini-unit
---

# 2x Grid System

Carbon's 2x Grid is built on an 8px mini unit. All spatial relationships should align to multiples of 8px.

## Grid Types

| Type | Description | Use Case |
|------|-------------|----------|
| Fluid | Columns stretch to fill container | Most responsive layouts |
| Fixed | Columns have fixed widths | Sidebars, fixed panels |
| Hybrid | Mix of fluid and fixed | App shells with sidebar |

## Mini Unit

The 8px mini unit is the foundation. Component heights: 32px, 40px, 48px. Icon sizes: 16px, 20px, 24px, 32px.

## Incorrect

```tsx
function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '235px', padding: '15px' }}>Sidebar</aside>
      <main style={{ flex: 1, padding: '18px' }}>Content</main>
    </div>
  );
}
```
**Why it's wrong**: 235px, 15px, 18px don't align to the 8px grid.

## Correct

```tsx
import { Grid, Column } from '@carbon/react';

function Layout() {
  return (
    <Grid>
      <Column sm={4} md={2} lg={4}>
        <SideNav aria-label="Navigation" />
      </Column>
      <Column sm={4} md={6} lg={12}>
        <div style={{ padding: 'var(--cds-spacing-05)' }}>Content</div>
      </Column>
    </Grid>
  );
}
```
**Why it's correct**: Uses Carbon's Grid and Column components which enforce 8px alignment. Spacing tokens ensure padding is on-grid.
