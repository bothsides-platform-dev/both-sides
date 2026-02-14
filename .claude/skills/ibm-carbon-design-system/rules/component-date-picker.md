---
title: Date Picker
impact: HIGH
impactDescription: Incorrect date input patterns cause data entry errors and accessibility issues
tags: component, date-picker, input, calendar, form
---

# Date Picker

Variants: simple (text only), single (calendar), range (start/end). Show format hint as placeholder. Full keyboard navigation within calendar.

## Incorrect

```tsx
function DateField() {
  return (
    <div>
      <label>Date</label>
      <input type="text" placeholder="Enter date" onChange={handleDate} />
    </div>
  );
}
```
**Why it's wrong**: No date format guidance. No calendar picker. No validation. Label not associated.

## Correct

```tsx
import { DatePicker, DatePickerInput } from '@carbon/react';

<DatePicker datePickerType="single" dateFormat="m/d/Y">
  <DatePickerInput id="date" labelText="Event date" placeholder="mm/dd/yyyy" />
</DatePicker>

// Range
<DatePicker datePickerType="range" dateFormat="m/d/Y">
  <DatePickerInput id="start" labelText="Start date" placeholder="mm/dd/yyyy" />
  <DatePickerInput id="end" labelText="End date" placeholder="mm/dd/yyyy" />
</DatePicker>
```
**Why it's correct**: Calendar dropdown with keyboard navigation. Format placeholder. Proper label. Validation built in.
