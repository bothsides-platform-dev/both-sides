---
title: Overflow Menu
impact: HIGH
impactDescription: Incorrect menu patterns break action discovery and keyboard navigation
tags: component, overflow-menu, menu, actions
---

# Overflow Menu

Three-dot trigger, 5-7 items max. Dividers separate groups. Danger items at bottom in red.

## Incorrect

```tsx
function RowActions({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span onClick={() => setOpen(!open)}>⋮</span>
      {open && (
        <div className="menu">
          <div onClick={() => edit(item)}>Edit</div>
          <div onClick={() => remove(item)} style={{ color: 'red' }}>Delete</div>
        </div>
      )}
    </div>
  );
}
```
**Why it's wrong**: No keyboard support. No ARIA menu role. Hardcoded danger color.

## Correct

```tsx
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';

<OverflowMenu flipped ariaLabel={`Actions for ${item.name}`}>
  <OverflowMenuItem itemText="Edit" onClick={() => edit(item)} />
  <OverflowMenuItem itemText="Duplicate" onClick={() => duplicate(item)} />
  <OverflowMenuItem hasDivider />
  <OverflowMenuItem itemText="Delete" isDelete onClick={() => remove(item)} />
</OverflowMenu>
```
**Why it's correct**: Proper menu semantics. Full keyboard navigation. Danger styling via `isDelete`. Divider separates destructive action.
