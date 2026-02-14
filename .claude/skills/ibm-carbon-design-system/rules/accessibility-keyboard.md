---
title: Keyboard Navigation
impact: CRITICAL
impactDescription: Missing keyboard support locks out users who cannot use a mouse
tags: accessibility, keyboard, focus, tab, a11y
---

# Keyboard Navigation

All interactive elements must be fully operable via keyboard.

## Requirements

- **Tab order**: Logical, follows visual reading order
- **Focus indicator**: 2px solid `$focus` (#0f62fe), clearly visible
- **No keyboard traps**: Users can always Tab away
- **Skip links**: "Skip to content" as first focusable element

## Focus Indicator Spec

```css
outline: 2px solid var(--cds-focus);
outline-offset: -2px;
```

## Keyboard Patterns

| Component | Keys |
|-----------|------|
| Button | Enter/Space to activate |
| Modal | Escape to close, Tab trapped inside |
| Dropdown | Enter/Space open, Arrow keys navigate, Escape close |
| Tabs | Arrow keys between tabs, Tab to leave |

## Incorrect

```tsx
function CustomDropdown({ options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => setOpen(!open)}>Select an option</div>
      {open && (
        <ul>
          {options.map(opt => (
            <li key={opt.id} onClick={() => onSelect(opt)}>{opt.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```
**Why it's wrong**: `div` and `li` are not focusable. No keyboard event handlers. No Escape to close.

## Correct

```tsx
import { Dropdown } from '@carbon/react';

function AccessibleDropdown({ options, onSelect }) {
  return (
    <Dropdown
      id="dropdown-1"
      titleText="Options"
      label="Select an option"
      items={options}
      itemToString={(item) => item?.label ?? ''}
      onChange={({ selectedItem }) => onSelect(selectedItem)}
    />
  );
}
```
**Why it's correct**: Carbon's Dropdown handles all keyboard interaction automatically.
