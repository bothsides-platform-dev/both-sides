---
title: Dropdown
impact: HIGH
impactDescription: Incorrect dropdown patterns break form workflows and keyboard navigation
tags: component, dropdown, select, form
---

# Dropdown

Single select from a list. Variants: default (full-width), inline (compact). Requires label, supports helper text.

## Incorrect

```tsx
function CategoryPicker({ categories, onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <span>Category</span>
      <div onClick={() => setOpen(!open)}>{selected || 'Choose...'}</div>
      {open && (
        <ul>{categories.map(c => (
          <li key={c.id} onClick={() => { setSelected(c.name); onSelect(c); setOpen(false); }}>{c.name}</li>
        ))}</ul>
      )}
    </div>
  );
}
```
**Why it's wrong**: No keyboard navigation. No ARIA. Label not associated. No focus management.

## Correct

```tsx
import { Dropdown } from '@carbon/react';

function CategoryPicker({ categories, onSelect }) {
  return (
    <Dropdown
      id="category"
      titleText="Category"
      helperText="Select a topic category"
      label="Choose one..."
      items={categories}
      itemToString={(item) => item?.name ?? ''}
      onChange={({ selectedItem }) => onSelect(selectedItem)}
    />
  );
}
```
**Why it's correct**: Full keyboard support. Label properly associated. ARIA listbox semantics. Theme-aware.
