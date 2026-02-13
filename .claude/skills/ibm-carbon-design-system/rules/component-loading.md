---
title: Loading
impact: HIGH
impactDescription: Missing loading states cause user confusion
tags: component, loading, spinner, progress
---

# Loading

Large (88px) for full page/overlay. Small (16px) for inline. Provide accessible description. For >10s, consider progress indicator.

## Incorrect

```tsx
function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="custom-spinner" />
    </div>
  );
}
```
**Why it's wrong**: No ARIA attributes. Screen readers see nothing. No "loading" announcement.

## Correct

```tsx
import { Loading } from '@carbon/react';

<Loading description="Loading dashboard data" withOverlay />
<Loading description="Fetching results" small withOverlay={false} />
```
**Why it's correct**: Accessible description announced by screen readers. Overlay blocks interaction during load.
