---
title: Motion Duration
impact: MEDIUM
impactDescription: Wrong durations make animations feel sluggish or imperceptible
tags: motion, duration, timing, speed
---

# Motion Duration

Duration should be proportional to distance traveled and importance. Use duration tokens, not arbitrary values.

## Duration Tokens

| Token | Duration | Use |
|-------|----------|-----|
| `$duration-fast-01` | 70ms | Micro-interactions (hover, active) |
| `$duration-fast-02` | 110ms | Small transitions (tooltips) |
| `$duration-moderate-01` | 150ms | Standard transitions (dropdowns) |
| `$duration-moderate-02` | 240ms | Complex transitions (modals) |
| `$duration-slow-01` | 400ms | Large transitions (page) |
| `$duration-slow-02` | 700ms | Background transitions |

## Incorrect

```tsx
function AnimatedUI() {
  return (
    <>
      <button style={{ transition: 'all 500ms ease' }}>Click me</button>
      <div className="tooltip" style={{ transition: 'opacity 500ms ease' }}>Tooltip</div>
    </>
  );
}
```
**Why it's wrong**: 500ms for a button hover feels sluggish. Same duration for all elements ignores dynamic duration principle.

## Correct

```tsx
function AnimatedUI() {
  return (
    <>
      <button style={{ transition: 'background-color 70ms cubic-bezier(0.2, 0, 0.38, 0.9)' }}>
        Click me
      </button>
      <div className="tooltip" style={{ transition: 'opacity 110ms cubic-bezier(0, 0, 0.38, 0.9)' }}>
        Tooltip
      </div>
    </>
  );
}
```
**Why it's correct**: Button uses fast-01 (70ms). Tooltip uses fast-02 (110ms). Duration matches element size.
