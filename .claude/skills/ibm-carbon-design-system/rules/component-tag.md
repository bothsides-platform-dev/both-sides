---
title: Tag
impact: HIGH
impactDescription: Incorrect tag usage creates visual clutter and unclear categorization
tags: component, tag, label, category, badge
---

# Tag

Types: read-only, dismissible, selectable, operational. Sizes: sm(18px), md(24px), lg(32px). Colors: red, magenta, purple, blue, cyan, teal, green, gray, etc. Keep text 1-3 words.

## Incorrect

```tsx
function TopicTags({ tags }) {
  return tags.map(tag => (
    <span key={tag} style={{
      backgroundColor: '#0f62fe', color: '#fff', padding: '2px 8px',
      borderRadius: '24px', fontSize: '12px', marginRight: '4px'
    }}>
      {tag}
    </span>
  ));
}
```
**Why it's wrong**: Hardcoded colors. No dismiss. Not theme-aware. No interactive states.

## Correct

```tsx
import { Tag, DismissibleTag, SelectableTag } from '@carbon/react';

// Read-only
<Tag type="blue" size="md">Category</Tag>

// Dismissible (filter chips)
<DismissibleTag type="blue" text={filter.label} onClose={() => removeFilter(filter.id)} />

// Selectable
<SelectableTag selected={isSelected} onClick={() => toggle(id)}>Interest</SelectableTag>
```
**Why it's correct**: Theme-aware colors. Dismiss button accessible. Selectable state management. Consistent sizing.
