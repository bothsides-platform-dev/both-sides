---
title: Color Tokens
impact: CRITICAL
impactDescription: Hardcoded colors break theme support and create visual inconsistencies
tags: color, tokens, semantic, theme
---

# Color Tokens

Always use Carbon's semantic color tokens instead of hardcoded hex values. Semantic tokens automatically adapt to theme changes and ensure visual consistency across the entire interface.

## Token Reference (White Theme)

| Token | Hex | Purpose |
|-------|-----|---------|
| `$interactive-01` | #0f62fe | Primary interactive elements |
| `$interactive-02` | #393939 | Secondary interactive elements |
| `$interactive-03` | #0f62fe | Tertiary interactive color |
| `$interactive-04` | #0f62fe | Selected elements |
| `$text-01` | #161616 | Primary text |
| `$text-02` | #525252 | Secondary text |
| `$text-03` | #a8a8a8 | Placeholder text |
| `$text-04` | #ffffff | Text on interactive colors |
| `$text-05` | #6f6f6f | Helper text |
| `$ui-background` | #ffffff | Page background |
| `$ui-01` | #f4f4f4 | Primary container background |
| `$ui-02` | #ffffff | Secondary container background |
| `$ui-03` | #e0e0e0 | Subtle borders |
| `$ui-04` | #8d8d8d | Strong borders |
| `$ui-05` | #161616 | Emphasis borders |
| `$icon-01` | #161616 | Primary icons |
| `$icon-02` | #525252 | Secondary icons |
| `$icon-03` | #ffffff | Icons on interactive colors |
| `$support-01` | #da1e28 | Error / Danger |
| `$support-02` | #198038 | Success |
| `$support-03` | #f1c21b | Warning |
| `$support-04` | #0043ce | Information |
| `$focus` | #0f62fe | Focus indicator |
| `$hover-primary` | #0353e9 | Primary hover |
| `$active-primary` | #002d9c | Primary active/pressed |
| `$hover-danger` | #ba1b23 | Danger hover |
| `$disabled-01` | #f4f4f4 | Disabled background |
| `$disabled-02` | #c6c6c6 | Disabled element |
| `$disabled-03` | #8d8d8d | Disabled text on color |

## Incorrect

```tsx
// Hardcoded hex values break theme support
function AlertBanner({ message }) {
  return (
    <div style={{
      backgroundColor: '#da1e28',
      color: '#ffffff',
      padding: '16px',
      borderLeft: '4px solid #a2191f'
    }}>
      <p style={{ color: '#f4f4f4' }}>{message}</p>
      <button style={{
        backgroundColor: '#0f62fe',
        color: '#fff',
        border: 'none'
      }}>
        Dismiss
      </button>
    </div>
  );
}
```
**Why it's wrong**: Hardcoded hex values won't update when the theme changes. Colors become unreadable in dark themes. No semantic meaning tied to the colors.

## Correct

```tsx
// Semantic tokens adapt to any theme automatically
function AlertBanner({ message }) {
  return (
    <InlineNotification
      kind="error"
      title="Error"
      subtitle={message}
      className="cds--inline-notification"
    />
  );
}

// If custom styling is needed, use CSS custom properties
// .custom-alert {
//   background-color: var(--cds-support-01);
//   color: var(--cds-text-04);
//   padding: var(--cds-spacing-05);
//   border-left: 4px solid var(--cds-support-01);
// }
```
**Why it's correct**: Uses Carbon's notification component which applies correct tokens internally. When custom styling is needed, CSS custom properties (`var(--cds-*)`) ensure theme compatibility.
