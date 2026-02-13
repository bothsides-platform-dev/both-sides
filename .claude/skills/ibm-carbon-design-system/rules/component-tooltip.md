---
title: Tooltip
impact: HIGH
impactDescription: Missing tooltips hide information and break accessibility
tags: component, tooltip, popover, help
---

# Tooltip

Types: definition (dotted underline term), icon (info icon), interactive (Toggletip with links/buttons). 100-300ms delay. Auto-position. Focus trigger shows, Escape dismisses.

## Incorrect

```tsx
<button title="Settings"><SettingsIcon /></button>

function HelpTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      ℹ️ {show && <div className="tooltip">{text}</div>}
    </span>
  );
}
```
**Why it's wrong**: `title` is inconsistent across browsers. Custom tooltip has no keyboard support or positioning.

## Correct

```tsx
import { Tooltip, DefinitionTooltip, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/icons-react';

<Tooltip label="Adjust settings" align="bottom">
  <button className="cds--btn cds--btn--icon-only cds--btn--ghost"><Settings /></button>
</Tooltip>

<p>The <DefinitionTooltip definition="Verifying identity">authentication</DefinitionTooltip> uses OAuth.</p>

<Toggletip align="bottom">
  <ToggletipButton label="More info"><Information /></ToggletipButton>
  <ToggletipContent>
    <p>Requires admin permissions.</p>
    <Link href="/docs">Learn more</Link>
  </ToggletipContent>
</Toggletip>
```
**Why it's correct**: Keyboard accessible. Proper delay and positioning. Definition for inline terms. Toggletip for interactive content.
