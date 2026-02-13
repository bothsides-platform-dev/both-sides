---
title: Motion Easing
impact: MEDIUM
impactDescription: Wrong easing curves create jarring or sluggish animations
tags: motion, easing, cubic-bezier, curves
---

# Motion Easing

Carbon defines specific easing curves. Always use Carbon's easing tokens, never `linear`, generic `ease`, or custom curves.

## Easing Reference

| Type | Productive | Expressive |
|------|-----------|------------|
| Standard | `cubic-bezier(0.2, 0, 0.38, 0.9)` | `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| Entrance | `cubic-bezier(0, 0, 0.38, 0.9)` | `cubic-bezier(0, 0, 0.3, 1)` |
| Exit | `cubic-bezier(0.2, 0, 1, 0.9)` | `cubic-bezier(0.4, 0.14, 1, 1)` |

## When to Use Each

| Type | Use When... |
|------|-------------|
| Standard | Element moves or resizes while remaining on screen |
| Entrance | Element is added to the screen |
| Exit | Element is removed from screen |

## Incorrect

```css
.dropdown { transition: max-height 200ms ease-in-out; }
.tooltip { transition: opacity 150ms linear; }
```
**Why it's wrong**: `ease-in-out` and `linear` are generic CSS keywords that don't match Carbon's motion language.

## Correct

```css
.dropdown { transition: max-height 150ms cubic-bezier(0, 0, 0.38, 0.9); }
.dropdown--closing { transition: max-height 110ms cubic-bezier(0.2, 0, 1, 0.9); }
.tooltip { transition: opacity 110ms cubic-bezier(0, 0, 0.38, 0.9); }
```
**Why it's correct**: Each transition uses the appropriate Carbon easing curve for its context.
