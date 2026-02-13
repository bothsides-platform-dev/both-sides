---
title: Expressive Motion
impact: MEDIUM
impactDescription: Bland motion in expressive contexts fails to engage users
tags: motion, animation, expressive, engagement
---

# Expressive Motion

Expressive motion is vibrant and noticeable. Use for key moments, onboarding, and marketing contexts.

## Common Expressive Animations

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Page transition | 240ms-400ms | Standard expressive |
| Hero entrance | 400ms | Entrance expressive |
| Modal open | 240ms | Entrance expressive |
| Success celebration | 400ms | Standard expressive |

## Incorrect

```tsx
function ListItem({ item, index }) {
  return (
    <li style={{
      animation: `slideInBounce 700ms ease ${index * 200}ms`,
      transform: 'scale(0) rotate(180deg)',
    }}>
      {item.name}
    </li>
  );
}
```
**Why it's wrong**: Staggered 700ms bounce on every list item is excessive.

## Correct

```tsx
function WelcomeBanner({ userName }) {
  return (
    <div style={{
      animation: 'fadeSlideUp 400ms cubic-bezier(0.4, 0.14, 0.3, 1)',
    }}>
      <h1 className="cds--type-expressive-heading-05">Welcome, {userName}</h1>
    </div>
  );
}
// @keyframes fadeSlideUp {
//   from { opacity: 0; transform: translateY(24px); }
//   to { opacity: 1; transform: translateY(0); }
// }
```
**Why it's correct**: Expressive easing and 400ms for a welcome moment. Applied to a single, important element.
