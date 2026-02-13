---
title: Progress Indicator
impact: HIGH
impactDescription: Missing progress indicators leave users uncertain about multi-step processes
tags: component, progress-indicator, steps, wizard
---

# Progress Indicator

Horizontal or vertical. Step states: incomplete, current, complete, error.

## Incorrect

```tsx
function Steps({ current }) {
  const steps = ['Account', 'Profile', 'Review'];
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ color: i <= current ? '#0f62fe' : '#ccc' }}>
          {i + 1}. {step}
        </div>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No semantic meaning. Color-only indication. No step status icons.

## Correct

```tsx
import { ProgressIndicator, ProgressStep } from '@carbon/react';

<ProgressIndicator currentIndex={currentIndex}>
  <ProgressStep label="Account" description="Create your account" />
  <ProgressStep label="Profile" description="Set up your profile" />
  <ProgressStep label="Review" description="Review and confirm" />
</ProgressIndicator>
```
**Why it's correct**: Semantic progress markup. Visual icons per state. Description for context. Vertical option available.
