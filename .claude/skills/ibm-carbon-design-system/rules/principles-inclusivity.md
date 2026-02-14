---
title: Inclusivity
impact: MEDIUM
impactDescription: Exclusive designs alienate users and may violate accessibility requirements
tags: principles, design, inclusivity, accessibility, a11y
---

# Inclusivity

Design for the broadest possible range of users, not just the average person. Consider different abilities, devices, network conditions, languages, and cultural contexts.

## Key Guidelines
- Support keyboard, mouse, touch, and assistive technology input
- Don't rely solely on color to convey information
- Provide text alternatives for non-text content
- Support multiple screen sizes and orientations
- Use inclusive language and imagery
- Consider users with slow connections or older devices

## Incorrect

```tsx
// Relies on color alone, no keyboard support, assumes mouse
function StatusList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          style={{ color: item.active ? 'green' : 'red' }}
          onMouseOver={() => showTooltip(item)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```
**Why it's wrong**: Color is the only indicator of status (inaccessible to colorblind users). Tooltip only works on hover (no keyboard/touch). No semantic meaning.

## Correct

```tsx
// Multiple indicators, keyboard accessible, semantic meaning
function StatusList({ items }) {
  return (
    <StructuredListWrapper selection>
      {items.map(item => (
        <StructuredListRow key={item.id}>
          <StructuredListCell>
            {item.active ? (
              <CheckmarkFilled aria-label="Active" className="text-support-02" />
            ) : (
              <CloseFilled aria-label="Inactive" className="text-support-01" />
            )}
          </StructuredListCell>
          <StructuredListCell>{item.name}</StructuredListCell>
          <StructuredListCell>
            <Tag type={item.active ? 'green' : 'red'}>
              {item.active ? 'Active' : 'Inactive'}
            </Tag>
          </StructuredListCell>
        </StructuredListRow>
      ))}
    </StructuredListWrapper>
  );
}
```
**Why it's correct**: Uses icons AND text AND color for status (multiple channels). Structured list provides keyboard navigation. Semantic labels for screen readers. Works on all input methods.
