---
title: Slider
impact: HIGH
impactDescription: Incorrect slider patterns break range selection and accessibility
tags: component, slider, range, input, form
---

# Slider

Range selection with draggable handle. Always pair with text input for precise entry. Show min/max values.

## Incorrect

```tsx
<input type="range" min={0} max={100} onChange={e => setVolume(e.target.value)} />
```
**Why it's wrong**: No label. No min/max display. No text input for precise entry.

## Correct

```tsx
import { Slider } from '@carbon/react';

<Slider id="volume" labelText="Volume" min={0} max={100} step={1} value={50}
  onChange={({ value }) => setVolume(value)} minLabel="0%" maxLabel="100%" />
```
**Why it's correct**: Label, min/max labels, text input paired automatically, keyboard accessible (arrow keys).
