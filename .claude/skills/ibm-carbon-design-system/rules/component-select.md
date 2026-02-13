---
title: Select
impact: HIGH
impactDescription: Incorrect select patterns break native form behavior
tags: component, select, form, dropdown
---

# Select

Native HTML `<select>`. Variants: default, inline. Use Dropdown for richer interaction (filtering, custom rendering).

## Incorrect

```tsx
<select onChange={e => setCountry(e.target.value)}>
  <option value="">Select country</option>
  <option value="us">United States</option>
</select>
```
**Why it's wrong**: No visible label. No helper text. Placeholder option is selectable.

## Correct

```tsx
import { Select, SelectItem } from '@carbon/react';

<Select id="country" labelText="Country" helperText="Select your country">
  <SelectItem value="" text="Choose a country" disabled hidden />
  <SelectItem value="us" text="United States" />
  <SelectItem value="uk" text="United Kingdom" />
</Select>
```
**Why it's correct**: Proper label. Helper text. Placeholder disabled/hidden. Carbon styling. Native semantics preserved.
