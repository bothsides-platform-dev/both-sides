---
title: Color Contrast
impact: CRITICAL
impactDescription: Insufficient contrast makes text unreadable for users with low vision
tags: color, contrast, accessibility, wcag
---

# Color Contrast

All color combinations must meet WCAG 2.1 AA contrast requirements. This is a legal requirement in many jurisdictions and essential for usability.

## Contrast Requirements

| Element Type | Minimum Ratio | WCAG Level |
|-------------|--------------|------------|
| Normal text (< 18px) | 4.5:1 | AA |
| Large text (>= 18px bold or >= 24px) | 3:1 | AA |
| UI components and graphical objects | 3:1 | AA |
| Enhanced normal text | 7:1 | AAA |
| Enhanced large text | 4.5:1 | AAA |

## Incorrect

```tsx
// Low contrast text is unreadable
function LightCard() {
  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <p style={{ color: '#c6c6c6' }}>
        This light gray text on white has only ~1.5:1 contrast
      </p>
      <span style={{ color: '#a8a8a8', fontSize: '12px' }}>
        Helper text with insufficient contrast
      </span>
      <button style={{
        backgroundColor: '#e0e0e0',
        color: '#ffffff',
        border: 'none'
      }}>
        Invisible button text
      </button>
    </div>
  );
}
```
**Why it's wrong**: Light gray (#c6c6c6) on white (#ffffff) has ~1.5:1 contrast ratio. Helper text is even worse. Button text is nearly invisible. All fail WCAG AA requirements.

## Correct

```tsx
// All text meets WCAG AA contrast requirements
function LightCard() {
  return (
    <Tile>
      <p className="cds--type-body-long-01">
        {/* $text-01 (#161616) on $ui-01 (#f4f4f4) = 15.1:1 */}
        Primary text with excellent contrast
      </p>
      <p className="cds--type-helper-text-01">
        {/* $text-05 (#6f6f6f) on $ui-01 (#f4f4f4) = 4.7:1 */}
        Helper text meeting 4.5:1 minimum
      </p>
      <Button kind="primary">
        {/* $text-04 (#ffffff) on $interactive-01 (#0f62fe) = 4.66:1 */}
        Clearly readable button
      </Button>
    </Tile>
  );
}
```
**Why it's correct**: All text-background combinations exceed WCAG AA 4.5:1 ratio. Carbon's semantic tokens are pre-validated for contrast. Using Carbon components ensures contrast compliance by default.

## Contrast Validation

Always verify contrast when:
- Using custom colors outside of Carbon tokens
- Placing text on images or gradients
- Creating colored badges or status indicators
- Using transparent/semi-transparent overlays
