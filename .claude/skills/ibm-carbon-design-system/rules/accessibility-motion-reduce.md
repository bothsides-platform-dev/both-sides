---
title: Reduced Motion
impact: CRITICAL
impactDescription: Uncontrolled motion can cause vestibular disorders, seizures, or nausea
tags: accessibility, motion, prefers-reduced-motion, vestibular, a11y
---

# Reduced Motion

Respect `prefers-reduced-motion`. All motion must be removable.

## Requirements

- Honor `prefers-reduced-motion: reduce` system preference
- Remove non-essential animations
- Transform essential motion to instant state changes
- No autoplay video without user interaction
- Never flash more than 3 times per second

## Incorrect

```tsx
function AnimatedCard({ children }) {
  return (
    <div style={{
      animation: 'slideInUp 400ms ease-out',
      transition: 'transform 300ms ease'
    }}>
      {children}
    </div>
  );
}
```
**Why it's wrong**: Animation plays regardless of user preference. No way to opt out.

## Correct

```css
.animated-card {
  animation: slideInUp 400ms cubic-bezier(0, 0, 0.38, 0.9);
  transition: transform 240ms cubic-bezier(0.2, 0, 0.38, 0.9);
}

@media (prefers-reduced-motion: reduce) {
  .animated-card {
    animation: none;
    transition: none;
  }
}
```
**Why it's correct**: Normal users see animation. Users with reduced motion preference see no animation.

## Global Safety Net

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## JavaScript Detection

```tsx
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
```
