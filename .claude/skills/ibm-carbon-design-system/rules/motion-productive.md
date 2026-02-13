---
title: Productive Motion
impact: MEDIUM
impactDescription: Incorrect motion style distracts from task-focused workflows
tags: motion, animation, productive, task
---

# Productive Motion

Productive motion is subtle, efficient, and quick. Use for task-focused interfaces where animation should assist without drawing attention.

## Common Productive Animations

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 70ms | Standard productive |
| Tooltip appear | 110ms | Entrance productive |
| Dropdown open | 150ms | Entrance productive |
| Toggle switch | 70ms | Standard productive |

## Incorrect

```tsx
function DataRow({ data }) {
  return (
    <tr style={{
      animation: 'bounceIn 800ms ease',
      transition: 'all 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }}>
      <td>{data.name}</td>
    </tr>
  );
}
```
**Why it's wrong**: Bounce animation is expressive, not productive. 800ms is too long for a data table row.

## Correct

```tsx
function DataRow({ data }) {
  return (
    <tr style={{
      transition: 'background-color 70ms cubic-bezier(0.2, 0, 0.38, 0.9)'
    }}>
      <td>{data.name}</td>
    </tr>
  );
}
```
**Why it's correct**: 70ms duration for instant feedback. Standard productive easing. Only background-color animated.
