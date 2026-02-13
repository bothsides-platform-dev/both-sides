---
title: Inline Loading
impact: HIGH
impactDescription: Missing loading feedback leaves users uncertain about action status
tags: component, loading, inline, feedback
---

# Inline Loading

Compact feedback for 1-10 second operations. States: inactive, active, finished, error. Place near trigger element.

## Incorrect

```tsx
function SaveButton({ onSave }) {
  const [saving, setSaving] = useState(false);
  return (
    <div>
      <button onClick={async () => { setSaving(true); await onSave(); setSaving(false); }}>Save</button>
      {saving && <span className="spinner" />}
    </div>
  );
}
```
**Why it's wrong**: No success/error states. No screen reader announcement. No state transitions.

## Correct

```tsx
import { InlineLoading, Button } from '@carbon/react';

function SaveButton({ onSave }) {
  const [status, setStatus] = useState('inactive');
  const handleSave = async () => {
    setStatus('active');
    try { await onSave(); setStatus('finished'); setTimeout(() => setStatus('inactive'), 1500); }
    catch { setStatus('error'); }
  };
  return status === 'inactive'
    ? <Button kind="primary" onClick={handleSave}>Save</Button>
    : <InlineLoading status={status}
        description={status === 'active' ? 'Saving...' : status === 'finished' ? 'Saved!' : 'Error'} />;
}
```
**Why it's correct**: Proper state cycle. Screen reader announcements via aria-live. Visual feedback with icons.
