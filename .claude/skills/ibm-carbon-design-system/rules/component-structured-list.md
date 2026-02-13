---
title: Structured List
impact: HIGH
impactDescription: Incorrect list patterns break data readability
tags: component, structured-list, list, data
---

# Structured List

Read-only tabular data. Optionally selectable (radio selection). Use DataTable for sortable/filterable data.

## Incorrect

```tsx
function Comparison({ features }) {
  return (
    <div>
      {features.map(f => (
        <div key={f.name} style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ flex: 1 }}>{f.name}</div>
          <div style={{ flex: 1 }}>{f.included ? '✓' : '✗'}</div>
        </div>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No table semantics. No headers. Unicode check/cross not accessible.

## Correct

```tsx
import { StructuredListWrapper, StructuredListHead, StructuredListBody, StructuredListRow, StructuredListCell } from '@carbon/react';
import { Checkmark, Close } from '@carbon/icons-react';

<StructuredListWrapper>
  <StructuredListHead>
    <StructuredListRow head>
      <StructuredListCell head>Feature</StructuredListCell>
      <StructuredListCell head>Included</StructuredListCell>
    </StructuredListRow>
  </StructuredListHead>
  <StructuredListBody>
    {features.map(f => (
      <StructuredListRow key={f.name}>
        <StructuredListCell>{f.name}</StructuredListCell>
        <StructuredListCell>
          {f.included ? <Checkmark aria-label="Yes" /> : <Close aria-label="No" />}
        </StructuredListCell>
      </StructuredListRow>
    ))}
  </StructuredListBody>
</StructuredListWrapper>
```
**Why it's correct**: Proper semantics. Column headers. Icons with aria-labels. Consistent spacing.
