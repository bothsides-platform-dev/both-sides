---
title: Checkbox
impact: HIGH
impactDescription: Incorrect checkbox patterns break multi-select workflows and form accessibility
tags: component, checkbox, form, selection
---

# Checkbox

Select one or more items. States: unchecked, checked, indeterminate, disabled. Label to the right. Use CheckboxGroup for fieldset semantics.

## Incorrect

```tsx
function Filters() {
  return (
    <div>
      <input type="checkbox" onChange={handleActive} /> Active
      <input type="checkbox" onChange={handlePending} /> Pending
    </div>
  );
}
```
**Why it's wrong**: No `<label>` elements. No fieldset/legend. Clicking text doesn't toggle.

## Correct

```tsx
import { Checkbox, CheckboxGroup } from '@carbon/react';

function Filters() {
  return (
    <CheckboxGroup legendText="Filter by status">
      <Checkbox id="active" labelText="Active" />
      <Checkbox id="pending" labelText="Pending" />
      <Checkbox id="closed" labelText="Closed" />
    </CheckboxGroup>
  );
}
```
**Why it's correct**: Labels properly associated. CheckboxGroup provides fieldset/legend. Indeterminate state supported.
