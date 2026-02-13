---
name: ibm-carbon-design-system
description: IBM Carbon Design System v11 guidelines for building and reviewing consistent, accessible UI. Use when designing, building, reviewing, or refactoring UI components, layouts, color, typography, spacing, motion, or accessibility. Triggers on "Carbon", "IBM design", "design system review", "build a component", "create UI", or "check accessibility".
license: Apache-2.0
metadata:
  author: ibm
  version: "11.0.0"
  argument-hint: <file-or-pattern>
---

# IBM Carbon Design System v11

Carbon is IBM's open-source design system for products and digital experiences. It provides a unified language, clear guidelines, and reusable components to build consistent, accessible interfaces.

## Modes

### Review Mode
Audit existing UI code against Carbon guidelines. Checks color tokens, typography, spacing, grid, motion, accessibility, and component usage.

**Usage**: Pass a file path or glob pattern to review.
```
/ibm-carbon-design-system src/components/MyComponent.tsx
```

**Review output**: For each violation found, report:
1. Rule ID and severity (CRITICAL / HIGH / MEDIUM)
2. File, line number, and code snippet
3. What's wrong and why
4. Corrected code

### Generation Mode
Create new components following Carbon patterns. Ensures proper token usage, accessibility, keyboard interaction, and responsive behavior.

**Usage**: Describe what you want to build.
```
/ibm-carbon-design-system "create a notification banner component"
```

## Rule Categories

| # | Category | Rules | Impact | Description |
|---|----------|-------|--------|-------------|
| A | Principles | 3 | MEDIUM | Purposefulness, meaningful outcomes, inclusivity |
| B | Color System | 3 | CRITICAL | Semantic tokens, themes, contrast ratios |
| C | Typography | 3 | HIGH | IBM Plex, type tokens, productive/expressive styles |
| D | Spacing & Grid | 5 | HIGH | 8px unit, spacing scale, 2x grid, breakpoints, 16-col |
| E | Motion | 4 | MEDIUM | Productive/expressive motion, easing curves, durations |
| F | Accessibility | 4 | CRITICAL | Keyboard, contrast, screen readers, reduced motion |
| G | Components | 23 | HIGH | Individual component guidelines and patterns |

**Total: 45 rules**

## Quick Reference

### Color Tokens
| Token | Purpose | White Theme |
|-------|---------|-------------|
| `$interactive-01` | Primary action | #0f62fe |
| `$interactive-02` | Secondary action | #393939 |
| `$text-01` | Primary text | #161616 |
| `$text-02` | Secondary text | #525252 |
| `$ui-background` | Page background | #ffffff |
| `$ui-01` | Container background | #f4f4f4 |
| `$support-01` | Error/danger | #da1e28 |
| `$support-02` | Success | #198038 |
| `$support-03` | Warning | #f1c21b |
| `$support-04` | Information | #0043ce |
| `$focus` | Focus indicator | #0f62fe |

### Typography Scale
| Token | Size | Weight |
|-------|------|--------|
| `heading-06` | 2.625rem | 300 |
| `heading-05` | 2rem | 400 |
| `heading-04` | 1.75rem | 400 |
| `heading-03` | 1.25rem | 400 |
| `heading-02` | 1rem | 600 |
| `heading-01` | 0.875rem | 600 |
| `body-long-02` | 1rem | 400 |
| `body-short-01` | 0.875rem | 400 |
| `caption-01` | 0.75rem | 400 |
| `label-01` | 0.75rem | 400 |

### Spacing Scale
| Token | Value |
|-------|-------|
| `$spacing-01` | 2px |
| `$spacing-02` | 4px |
| `$spacing-03` | 8px |
| `$spacing-04` | 12px |
| `$spacing-05` | 16px |
| `$spacing-06` | 24px |
| `$spacing-07` | 32px |
| `$spacing-08` | 40px |
| `$spacing-09` | 48px |

### Breakpoints
| Name | Width | Columns |
|------|-------|---------|
| sm | 320px | 4 |
| md | 672px | 8 |
| lg | 1056px | 16 |
| xlg | 1312px | 16 |
| max | 1584px | 16 |

### Motion Easing
| Type | Productive | Expressive |
|------|-----------|------------|
| Standard | `cubic-bezier(0.2, 0, 0.38, 0.9)` | `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| Entrance | `cubic-bezier(0, 0, 0.38, 0.9)` | `cubic-bezier(0, 0, 0.3, 1)` |
| Exit | `cubic-bezier(0.2, 0, 1, 0.9)` | `cubic-bezier(0.4, 0.14, 1, 1)` |

## Review Checklist

When reviewing code, check in this order:

1. **Accessibility (CRITICAL)** - Keyboard navigation, contrast ratios, ARIA, reduced motion
2. **Color (CRITICAL)** - Semantic tokens used, no hardcoded hex, theme support
3. **Typography (HIGH)** - IBM Plex font, type tokens, proper scale usage
4. **Spacing (HIGH)** - Spacing tokens, no arbitrary values, grid alignment
5. **Components (HIGH)** - Correct variants, states, keyboard interaction
6. **Motion (MEDIUM)** - Proper easing, duration tokens, reduced motion support
7. **Principles (MEDIUM)** - Purposeful design, meaningful content, inclusive patterns

## File Structure

Rules are organized in `rules/` directory:
- `principles-*.md` - Design principles
- `color-*.md` - Color system rules
- `typography-*.md` - Typography rules
- `spacing-*.md` / `grid-*.md` - Spacing and grid rules
- `motion-*.md` - Motion and animation rules
- `accessibility-*.md` - Accessibility rules
- `component-*.md` - Individual component guidelines

Full compiled reference: `AGENTS.md`
