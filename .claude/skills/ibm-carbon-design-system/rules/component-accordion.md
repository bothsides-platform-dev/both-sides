---
title: Accordion
impact: HIGH
impactDescription: Incorrect accordion patterns break content hierarchy and keyboard navigation
tags: component, accordion, expand, collapse
---

# Accordion

Vertically stacked headers that reveal/hide content sections. Variants: default, flush. Keyboard: Tab to focus, Enter/Space to toggle.

## Incorrect

```tsx
function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i}>
          <div onClick={() => setOpenIndex(openIndex === i ? null : i)}
               style={{ cursor: 'pointer', padding: '12px' }}>
            {item.title}
          </div>
          {openIndex === i && <div>{item.content}</div>}
        </div>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No keyboard support. No ARIA attributes. No focus indicator. No chevron icon.

## Correct

```tsx
import { Accordion, AccordionItem } from '@carbon/react';

function FAQ({ items }) {
  return (
    <Accordion>
      {items.map((item, i) => (
        <AccordionItem key={i} title={item.title}>
          <p>{item.content}</p>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```
**Why it's correct**: Semantic markup, keyboard navigation, ARIA attributes, focus indicators, animated chevron built in.
