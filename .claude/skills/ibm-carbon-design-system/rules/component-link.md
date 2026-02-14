---
title: Link
impact: HIGH
impactDescription: Incorrect link patterns confuse navigation and reduce accessibility
tags: component, link, navigation, anchor
---

# Link

Descriptive text (never "click here"). External links need icon + `target="_blank"` + `rel="noopener"`. Inline links should be underlined. Use `$link-01` token.

## Incorrect

```tsx
<p>For more info, <a href="/docs" style={{ color: 'blue' }}>click here</a>.</p>
<a href="https://external.com">Read more</a>
<button onClick={() => navigate('/about')}>About us</button>
```
**Why it's wrong**: "Click here" not descriptive. Hardcoded color. External link has no indicator. Button used for navigation.

## Correct

```tsx
import { Link } from '@carbon/react';
import { Launch } from '@carbon/icons-react';

<p>Read the <Link inline href="/docs">documentation guide</Link> to get started.</p>
<Link href="https://external.com" target="_blank" rel="noopener noreferrer" renderIcon={Launch}>
  View external resources
</Link>
<Link href="/about">About us</Link>
```
**Why it's correct**: Descriptive text. Inline variant for in-text. External link has icon and security attributes.
