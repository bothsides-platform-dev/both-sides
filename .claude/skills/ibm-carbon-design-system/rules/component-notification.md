---
title: Notification
impact: HIGH
impactDescription: Missing or poorly designed notifications fail to communicate system status
tags: component, notification, alert, toast, feedback
---

# Notification

Variants: inline (persistent, in content), toast (auto-dismiss, top-right), actionable (has action button). Kinds: info, success, warning, error.

## Incorrect

```tsx
function Alert({ type, message }) {
  return (
    <div style={{ backgroundColor: type === 'error' ? '#ff0000' : '#00ff00', color: 'white', padding: '10px' }}>
      {message}
    </div>
  );
}
```
**Why it's wrong**: No ARIA `role="alert"`. Hardcoded colors. No dismiss button. No severity icon.

## Correct

```tsx
import { InlineNotification, ToastNotification, ActionableNotification } from '@carbon/react';

<InlineNotification kind="error" title="Upload failed" subtitle="File exceeds 5MB." lowContrast />
<ToastNotification kind="success" title="Settings saved" subtitle="Preferences updated." timeout={5000} />
<ActionableNotification kind="warning" title="Session expiring"
  subtitle="Expires in 5 minutes." actionButtonLabel="Extend" onActionButtonClick={extendSession} />
```
**Why it's correct**: Proper ARIA roles. Semantic severity icons. Dismiss button. Toast auto-dismisses.
