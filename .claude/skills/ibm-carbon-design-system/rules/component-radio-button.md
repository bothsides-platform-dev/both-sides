---
title: Radio Button
impact: HIGH
impactDescription: Incorrect radio patterns break single-selection workflows
tags: component, radio-button, form, selection
---

# Radio Button

Single selection from mutually exclusive options. Min 2, max 7 (use dropdown for more). One pre-selected. Vertical for 3+.

## Incorrect

```tsx
<div>
  <div>Select a plan:</div>
  <input type="radio" name="plan" value="free" /> Free
  <input type="radio" name="plan" value="pro" /> Pro
</div>
```
**Why it's wrong**: No fieldset/legend. Labels not associated. No default selection. Text not clickable.

## Correct

```tsx
import { RadioButtonGroup, RadioButton } from '@carbon/react';

<RadioButtonGroup legendText="Select a plan" name="plan" defaultSelected="free" orientation="vertical">
  <RadioButton labelText="Free" value="free" id="plan-free" />
  <RadioButton labelText="Pro" value="pro" id="plan-pro" />
  <RadioButton labelText="Enterprise" value="enterprise" id="plan-enterprise" />
</RadioButtonGroup>
```
**Why it's correct**: Fieldset/legend semantics. Proper labels. Default selection. Arrow key navigation.
