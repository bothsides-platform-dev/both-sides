---
title: List
impact: HIGH
impactDescription: Incorrect list markup breaks screen reader navigation
tags: component, list, ordered, unordered
---

# List

Use semantic `<ul>` and `<ol>`. Carbon provides UnorderedList, OrderedList, and nested variants.

## Incorrect

```tsx
function Features() {
  return (
    <div className="feature-list">
      <div>• Real-time sync</div>
      <div>• Cloud backup</div>
    </div>
  );
}
```
**Why it's wrong**: Divs have no list semantics. Screen readers won't announce "list of N items".

## Correct

```tsx
import { UnorderedList, OrderedList, ListItem } from '@carbon/react';

<UnorderedList>
  <ListItem>Real-time sync</ListItem>
  <ListItem>Cloud backup</ListItem>
</UnorderedList>

<OrderedList>
  <ListItem>Create account</ListItem>
  <ListItem>Configure workspace</ListItem>
</OrderedList>
```
**Why it's correct**: Semantic list elements. Screen readers announce list and item count. Carbon spacing applied.
