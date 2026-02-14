---
title: Modal
impact: HIGH
impactDescription: Incorrect modals trap users, lose focus, and break keyboard navigation
tags: component, modal, dialog, overlay
---

# Modal

Sizes: xs(320px), sm(448px), md(576px), lg(768px). Variants: default, danger, passive. Requirements: focus trap, Escape to close, return focus to trigger on close.

## Incorrect

```tsx
function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal">
        <h2>Delete item?</h2>
        <p>This cannot be undone.</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
      </div>
    </div>
  );
}
```
**Why it's wrong**: No focus trap. No Escape to close. Focus doesn't return on close. Hardcoded danger color.

## Correct

```tsx
import { Modal } from '@carbon/react';

function ConfirmDelete({ open, onConfirm, onCancel }) {
  return (
    <Modal open={open} danger modalHeading="Delete item?"
      primaryButtonText="Delete" secondaryButtonText="Cancel"
      onRequestSubmit={onConfirm} onRequestClose={onCancel} size="sm">
      <p>This action cannot be undone.</p>
    </Modal>
  );
}
```
**Why it's correct**: Focus trapped. Escape closes. Focus returns to trigger. Danger variant applies correct styling.
