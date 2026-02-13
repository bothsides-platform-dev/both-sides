---
title: Content Switcher
impact: HIGH
impactDescription: Incorrect switcher patterns confuse tab-like navigation
tags: component, content-switcher, toggle, tabs
---

# Content Switcher

Toggle between 2-5 content views within same space. All items equal width. Use tabs for more options or different content sections.

## Incorrect

```tsx
function ViewToggle({ view, setView }) {
  return (
    <div style={{ display: 'flex' }}>
      <div onClick={() => setView('grid')}
           style={{ padding: '8px 16px', backgroundColor: view === 'grid' ? '#0f62fe' : '#e0e0e0' }}>
        Grid
      </div>
      <div onClick={() => setView('list')}
           style={{ padding: '8px 16px', backgroundColor: view === 'list' ? '#0f62fe' : '#e0e0e0' }}>
        List
      </div>
    </div>
  );
}
```
**Why it's wrong**: Non-semantic divs. No keyboard support. Hardcoded colors. No ARIA roles.

## Correct

```tsx
import { ContentSwitcher, Switch } from '@carbon/react';

function ViewToggle({ view, setView }) {
  return (
    <ContentSwitcher
      selectedIndex={view === 'grid' ? 0 : 1}
      onChange={({ index }) => setView(index === 0 ? 'grid' : 'list')}
    >
      <Switch text="Grid view" />
      <Switch text="List view" />
    </ContentSwitcher>
  );
}
```
**Why it's correct**: Proper tablist/tab semantics. Keyboard navigation. Equal-width items. Theme-aware.
