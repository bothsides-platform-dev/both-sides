---
title: Toggle
impact: HIGH
impactDescription: Incorrect toggle patterns confuse on/off state
tags: component, toggle, switch, on-off
---

# Toggle

On/off switch for immediate-effect settings. Sizes: sm(32x16px), default(48x24px). Use for settings (not form fields that need submission). Label describes the setting, not the action.

## Incorrect

```tsx
<div>
  <input type="checkbox" id="dark" onChange={handleToggle} />
  <label htmlFor="dark">Enable dark mode</label>
</div>
```
**Why it's wrong**: Checkbox semantics instead of switch. "Enable" describes action, not setting.

## Correct

```tsx
import { Toggle } from '@carbon/react';

<Toggle id="dark-mode" labelText="Dark mode" labelA="Off" labelB="On"
  toggled={isDarkMode} onToggle={(checked) => setDarkMode(checked)} />
```
**Why it's correct**: `role="switch"` semantics. Clear on/off labels. Immediate visual feedback. Space to toggle.
