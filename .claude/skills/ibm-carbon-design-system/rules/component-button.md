---
title: Button
impact: HIGH
impactDescription: Incorrect button usage confuses action hierarchy and reduces usability
tags: component, button, action, interactive
---

# Button

5 variants (primary/secondary/tertiary/ghost/danger), 4 sizes (sm:32px/md:40px/lg:48px/xl:64px). Max 1 primary per view section. Labels: 1-3 words, verbs. Icon-only buttons need `aria-label`. Don't use buttons for navigation.

## Incorrect

```tsx
function Actions() {
  return (
    <div>
      <button className="primary">Save</button>
      <button className="primary">Submit</button>
      <button className="primary">Continue</button>
      <a href="/next" className="button primary">Go to Next Page</a>
      <button><TrashIcon /></button>
    </div>
  );
}
```
**Why it's wrong**: Three primary buttons compete. Link styled as button. Icon button has no accessible label.

## Correct

```tsx
import { Button, IconButton } from '@carbon/react';
import { TrashCan, ArrowRight } from '@carbon/icons-react';

function Actions() {
  return (
    <div className="cds--btn-set">
      <Button kind="secondary">Save draft</Button>
      <Button kind="primary" renderIcon={ArrowRight}>Submit</Button>
    </div>
  );
}

// Icon-only
<IconButton label="Delete" kind="ghost"><TrashCan /></IconButton>

// Navigation uses Link, not Button
<Link href="/next">Go to next page</Link>
```
**Why it's correct**: Single primary. Secondary for lesser action. Icon button has label. Navigation uses Link.
