---
title: Number Input
impact: HIGH
impactDescription: Incorrect number inputs cause data entry errors
tags: component, number-input, form, input
---

# Number Input

Numeric entry with optional increment/decrement controls. Supports min/max/step, validation, and mobile numeric keyboard.

## Incorrect

```tsx
<input type="text" onChange={e => setQty(e.target.value)} />
```
**Why it's wrong**: Allows non-numeric entry. No increment controls. No min/max. Wrong mobile keyboard.

## Correct

```tsx
import { NumberInput } from '@carbon/react';

<NumberInput id="quantity" label="Quantity" helperText="1 to 100"
  min={1} max={100} step={1} value={1}
  onChange={(e, { value }) => setQty(value)}
  invalidText="Enter a number between 1 and 100" />
```
**Why it's correct**: Numeric input with increment/decrement. Min/max enforced. Proper label. Validation with error message.
