---
title: Contrast Requirements
impact: CRITICAL
impactDescription: Insufficient contrast makes content unreadable for low-vision users
tags: accessibility, contrast, wcag, color, a11y
---

# Contrast Requirements

All visual elements must meet WCAG 2.1 AA minimum contrast ratios.

## Minimum Ratios

| Element | Ratio | Rule |
|---------|-------|------|
| Normal text (< 24px / < 18.66px bold) | 4.5:1 | WCAG 1.4.3 |
| Large text (>= 24px / >= 18.66px bold) | 3:1 | WCAG 1.4.3 |
| UI components (borders, icons) | 3:1 | WCAG 1.4.11 |
| Focus indicators | 3:1 | WCAG 2.4.7 |
| Disabled elements | Exempt | Not required |

## Incorrect

```tsx
function StatusCard() {
  return (
    <div style={{ backgroundColor: '#f4f4f4' }}>
      <h3 style={{ color: '#a8a8a8' }}>Status Update</h3>
      {/* #a8a8a8 on #f4f4f4 = 2.07:1 - FAIL */}
      <p style={{ color: '#c6c6c6' }}>Last updated 5 minutes ago</p>
      {/* #c6c6c6 on #f4f4f4 = 1.49:1 - FAIL */}
    </div>
  );
}
```
**Why it's wrong**: Heading at 2.07:1 and text at 1.49:1 both fail 4.5:1 requirement.

## Correct

```tsx
function StatusCard() {
  return (
    <Tile>
      <h3 className="cds--type-heading-02">Status Update</h3>
      {/* $text-01 on $ui-01 = 15.1:1 - PASS */}
      <p className="cds--type-helper-text-01">Last updated 5 minutes ago</p>
      {/* $text-05 on $ui-01 = 4.7:1 - PASS */}
    </Tile>
  );
}
```
**Why it's correct**: Carbon tokens are pre-validated for contrast. All exceed WCAG AA minimums.
