# IBM Carbon Design System v11 - Complete Reference

This document contains all rules for the IBM Carbon Design System skill.

---


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

---


---
title: Meaningful Outcomes
impact: MEDIUM
impactDescription: Interfaces without clear meaning fail to engage users and reduce retention
tags: principles, design, meaning, engagement
---

# Meaningful Outcomes

Carbon designs should deliver outcomes that reach both head and heart. Content and interactions should be relevant, timely, and crafted to create genuine value for the user.

## Key Guidelines
- Use clear, human language instead of technical jargon
- Provide context that helps users understand why actions matter
- Design feedback that confirms progress and builds confidence
- Content should be relevant to the user's current context and goals

## Incorrect

```tsx
// Technical, impersonal, no context
function UploadComplete() {
  return (
    <div>
      <span>Status: 200 OK</span>
      <span>Operation completed successfully.</span>
      <span>Bytes transferred: 1048576</span>
    </div>
  );
}
```
**Why it's wrong**: Technical jargon (HTTP status, byte count) is meaningless to most users. No emotional connection or clear next step.

## Correct

```tsx
// Human language, meaningful feedback, clear next steps
function UploadComplete() {
  return (
    <InlineNotification
      kind="success"
      title="File uploaded"
      subtitle="Your report is ready to share with your team."
      actions={
        <NotificationActionButton>
          Share now
        </NotificationActionButton>
      }
    />
  );
}
```
**Why it's correct**: Uses human-readable language. Confirms what happened. Suggests a meaningful next step. Engages the user emotionally with success feedback.

---


---
title: Purposefulness
impact: MEDIUM
impactDescription: Unfocused designs increase cognitive load and reduce task completion rates
tags: principles, design, purpose, clarity
---

# Purposefulness

Every element in a Carbon interface must serve a clear purpose. Strip away distractions and reduce complexity to emphasize the essentials. Design should guide users toward their goals without unnecessary friction.

## Key Guidelines
- Remove decorative elements that don't aid comprehension
- Each UI element should have a clear, identifiable function
- Reduce visual noise to help users focus on their primary task
- Information hierarchy should reflect user priorities

## Incorrect

```tsx
// Decorative elements distract from the primary action
function Dashboard() {
  return (
    <div>
      <div className="animated-gradient-bg" />
      <div className="floating-particles" />
      <div className="decorative-circles" />
      <h1 className="rainbow-text">Welcome Back!</h1>
      <div className="sparkle-divider" />
      <button>View Reports</button>
      <button>Settings</button>
      <button>Help</button>
      <button>About</button>
      <button>Contact</button>
      <button>Share</button>
    </div>
  );
}
```
**Why it's wrong**: Decorative backgrounds, animations, and excessive actions compete for attention. Users can't identify the primary task.

## Correct

```tsx
// Clear hierarchy, purposeful elements, focused actions
function Dashboard() {
  return (
    <div className="cds--grid">
      <h1 className="cds--type-heading-04">Dashboard</h1>
      <p className="cds--type-body-long-01">
        Review your latest reports and metrics.
      </p>
      <Button kind="primary">View Reports</Button>
      <Button kind="ghost">Settings</Button>
    </div>
  );
}
```
**Why it's correct**: Clear heading establishes context. Helper text guides the user. Primary action is visually prominent. Secondary action uses ghost variant to establish hierarchy.

---


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

---


---
title: Color Themes
impact: CRITICAL
impactDescription: Ignoring theme support makes interfaces unusable in alternate themes
tags: color, themes, dark-mode, light-mode
---

# Color Themes

Carbon provides 4 built-in themes. All UI must work correctly across themes by using semantic tokens rather than hardcoded values.

## Theme Reference

| Theme | Background | Text Primary | Text Secondary | Use Case |
|-------|-----------|-------------|---------------|----------|
| White | #ffffff | #161616 | #525252 | Default light theme |
| G10 | #f4f4f4 | #161616 | #525252 | Light theme with gray tint |
| G90 | #262626 | #f4f4f4 | #c6c6c6 | Dark theme |
| G100 | #161616 | #f4f4f4 | #c6c6c6 | High-contrast dark theme |

## Inline Theming

Carbon supports inline theming where sections of a page can use a different theme from the global theme.

## Incorrect

```tsx
// Assumes light theme, breaks in dark mode
function Sidebar() {
  return (
    <nav style={{
      backgroundColor: '#161616',
      color: '#f4f4f4'
    }}>
      <a style={{ color: '#78a9ff' }}>Dashboard</a>
      <a style={{ color: '#78a9ff' }}>Settings</a>
    </nav>
  );
}
```
**Why it's wrong**: Hardcoded dark colors work only in light theme context. In G90/G100 themes, this sidebar may become invisible or unreadable.

## Correct

```tsx
// Theme-aware using Carbon's UI Shell and tokens
import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';
import { Theme } from '@carbon/react';

function Sidebar() {
  return (
    <Theme theme="g100">
      <SideNav isRail aria-label="Side navigation">
        <SideNavItems>
          <SideNavLink href="/dashboard">Dashboard</SideNavLink>
          <SideNavLink href="/settings">Settings</SideNavLink>
        </SideNavItems>
      </SideNav>
    </Theme>
  );
}
```
**Why it's correct**: Uses Carbon's Theme component for inline theming. SideNav component automatically applies correct color tokens. Navigation works regardless of global theme.

## Theme Switching

```tsx
import { GlobalTheme } from '@carbon/react';

function App() {
  const [theme, setTheme] = useState('white');
  return (
    <GlobalTheme theme={theme}>
      {/* All children automatically use the selected theme */}
      <AppContent />
    </GlobalTheme>
  );
}
```

---


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

---


---
title: IBM Plex Typeface
impact: HIGH
impactDescription: Incorrect fonts break visual identity and readability
tags: typography, font, plex, typeface
---

# IBM Plex Typeface

Carbon uses the IBM Plex type family exclusively. Always load IBM Plex with proper fallback stacks. Never substitute with other typefaces.

## Font Families

| Family | Use Case | CSS Value |
|--------|----------|-----------|
| IBM Plex Sans | Primary UI text, headings, body | `'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif` |
| IBM Plex Mono | Code, technical data, tabular numbers | `'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace` |
| IBM Plex Serif | Editorial, long-form reading (rare) | `'IBM Plex Serif', 'Georgia', Times, serif` |

## Font Weights

| Weight | Value | Use |
|--------|-------|-----|
| Light | 300 | Display headings (heading-06, heading-07) |
| Regular | 400 | Body text, most headings |
| SemiBold | 600 | Small headings (heading-01, heading-02), emphasis |

## Incorrect

```tsx
function Header() {
  return (
    <h1 style={{
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: '32px'
    }}>
      Dashboard
    </h1>
  );
}
```
**Why it's wrong**: Uses Arial instead of IBM Plex Sans. Uses bold (700) weight which is not in Carbon's type scale. Hardcoded font size instead of type token.

## Correct

```tsx
function Header() {
  return (
    <h1 className="cds--type-heading-05">
      Dashboard
    </h1>
  );
}
```
**Why it's correct**: Uses Carbon type token class which sets correct font-family, weight, size, and line-height. Includes proper fallback stack.

## Loading IBM Plex

```tsx
// Via @carbon/react (recommended)
import '@carbon/react/css/reset';
import '@carbon/react/css/grid';
import '@carbon/react/css/type';

// Or via Google Fonts
// <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600&display=swap" rel="stylesheet">
```

---


---
title: Productive and Expressive Type Styles
impact: HIGH
impactDescription: Mixing type styles creates visual inconsistency and confuses content hierarchy
tags: typography, productive, expressive, style
---

# Productive and Expressive Type Styles

Carbon defines two type style categories. Choose one per context and apply consistently.

## Productive Type
Task-focused interfaces. Type sizes remain fixed across breakpoints.
- Admin dashboards, data entry forms, configuration pages

## Expressive Type
Dynamic, editorial interfaces. Type sizes scale with viewport.
- Marketing pages, landing pages, onboarding flows

## Incorrect

```tsx
// Mixing productive and expressive in same section
function Dashboard() {
  return (
    <div>
      <h1 className="cds--type-expressive-heading-06">System Metrics</h1>
      <p className="cds--type-body-long-01">View your system performance data.</p>
    </div>
  );
}
```
**Why it's wrong**: Mixes expressive headings with productive body text. Data dashboards should use productive styles throughout.

## Correct

```tsx
// Consistent productive styles for a task-focused dashboard
function Dashboard() {
  return (
    <div className="cds--grid">
      <h1 className="cds--type-heading-05">System Metrics</h1>
      <p className="cds--type-body-long-01">View your system performance data.</p>
      <Tile>
        <span className="cds--type-label-01">CPU Usage</span>
        <span className="cds--type-heading-03">42%</span>
      </Tile>
    </div>
  );
}

// Expressive styles for a marketing page
function LandingPage() {
  return (
    <div className="cds--grid">
      <h1 className="cds--type-expressive-heading-06">Transform your workflow</h1>
      <p className="cds--type-expressive-paragraph-01">
        Discover how our platform helps teams collaborate more effectively.
      </p>
      <Button kind="primary" size="xl">Get started</Button>
    </div>
  );
}
```
**Why it's correct**: Each context is internally consistent. Dashboard uses productive types; landing page uses expressive types.

---


---
title: Typography Tokens
impact: HIGH
impactDescription: Arbitrary font sizes create visual inconsistency and break the type scale
tags: typography, tokens, scale, type
---

# Typography Tokens

Use Carbon's predefined type tokens for all text. Never use arbitrary font sizes, weights, or line heights.

## Type Token Reference

| Token | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|---------------|
| `heading-07` | 3.375rem (54px) | 300 | 1.199 | 0 |
| `heading-06` | 2.625rem (42px) | 300 | 1.199 | 0 |
| `heading-05` | 2rem (32px) | 400 | 1.25 | 0 |
| `heading-04` | 1.75rem (28px) | 400 | 1.28571 | 0 |
| `heading-03` | 1.25rem (20px) | 400 | 1.4 | 0 |
| `heading-02` | 1rem (16px) | 600 | 1.375 | 0 |
| `heading-01` | 0.875rem (14px) | 600 | 1.28571 | 0.16px |
| `body-long-02` | 1rem (16px) | 400 | 1.5 | 0 |
| `body-long-01` | 0.875rem (14px) | 400 | 1.42857 | 0.16px |
| `body-short-02` | 1rem (16px) | 400 | 1.375 | 0 |
| `body-short-01` | 0.875rem (14px) | 400 | 1.28571 | 0.16px |
| `caption-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `label-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `helper-text-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `code-01` | 0.75rem (12px) | 400 | 1.33333 | 0.32px |
| `code-02` | 0.875rem (14px) | 400 | 1.28571 | 0.16px |

## CSS Classes

```css
.cds--type-heading-03
.cds--type-body-long-01
.cds--type-caption-01
.cds--type-label-01
```

## Incorrect

```tsx
function ArticleCard() {
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: '1.2' }}>
        Article Title
      </h2>
      <p style={{ fontSize: '15px', lineHeight: '1.6' }}>Description</p>
      <span style={{ fontSize: '11px', color: 'gray' }}>Published 3 days ago</span>
    </div>
  );
}
```
**Why it's wrong**: 22px, 15px, 11px are not on Carbon's type scale. `bold` (700) is not used in Carbon. Arbitrary line-heights break vertical rhythm.

## Correct

```tsx
function ArticleCard() {
  return (
    <Tile>
      <h2 className="cds--type-heading-03">Article Title</h2>
      <p className="cds--type-body-long-01">Description</p>
      <span className="cds--type-caption-01">Published 3 days ago</span>
    </Tile>
  );
}
```
**Why it's correct**: heading-03 (20px), body-long-01 (14px), caption-01 (12px) create a clear hierarchy using Carbon's type scale.

---


---
title: Layout Spacing
impact: HIGH
impactDescription: Inconsistent page-level spacing breaks visual flow and content grouping
tags: spacing, layout, sections, page
---

# Layout Spacing

Use layout spacing tokens for page-level structure.

## Layout Tokens

| Token | Value | Use |
|-------|-------|-----|
| `$layout-01` | 16px (1rem) | Compact layout |
| `$layout-02` | 24px (1.5rem) | Default layout |
| `$layout-03` | 32px (2rem) | Medium layout |
| `$layout-04` | 48px (3rem) | Large layout |
| `$layout-05` | 64px (4rem) | XL layout |
| `$layout-06` | 96px (6rem) | Page section spacing |
| `$layout-07` | 160px (10rem) | Hero/banner spacing |

## Incorrect

```tsx
function Page() {
  return (
    <main>
      <section style={{ padding: '45px 0', marginBottom: '60px' }}>Hero</section>
      <section style={{ padding: '30px 0', marginBottom: '55px' }}>Features</section>
    </main>
  );
}
```
**Why it's wrong**: 45px, 60px, 30px, 55px are not on Carbon's scale.

## Correct

```tsx
function Page() {
  return (
    <main className="cds--grid">
      <section style={{ padding: 'var(--cds-layout-07) 0', marginBottom: 'var(--cds-layout-06)' }}>
        <h1 className="cds--type-heading-06">Hero Section</h1>
      </section>
      <section style={{ padding: 'var(--cds-layout-04) 0', marginBottom: 'var(--cds-layout-05)' }}>
        <h2 className="cds--type-heading-04">Features</h2>
      </section>
    </main>
  );
}
```
**Why it's correct**: Layout tokens create consistent, predictable page rhythm.

---


---
title: Spacing Scale
impact: HIGH
impactDescription: Arbitrary spacing creates visual inconsistency and misalignment
tags: spacing, scale, tokens, margin, padding
---

# Spacing Scale

Carbon uses a 9-step spacing scale. Use spacing tokens for all margin, padding, and gap values.

## Spacing Tokens

| Token | Value | CSS Custom Property |
|-------|-------|-------------------|
| `$spacing-01` | 2px (0.125rem) | `var(--cds-spacing-01)` |
| `$spacing-02` | 4px (0.25rem) | `var(--cds-spacing-02)` |
| `$spacing-03` | 8px (0.5rem) | `var(--cds-spacing-03)` |
| `$spacing-04` | 12px (0.75rem) | `var(--cds-spacing-04)` |
| `$spacing-05` | 16px (1rem) | `var(--cds-spacing-05)` |
| `$spacing-06` | 24px (1.5rem) | `var(--cds-spacing-06)` |
| `$spacing-07` | 32px (2rem) | `var(--cds-spacing-07)` |
| `$spacing-08` | 40px (2.5rem) | `var(--cds-spacing-08)` |
| `$spacing-09` | 48px (3rem) | `var(--cds-spacing-09)` |

## Incorrect

```tsx
function Card() {
  return (
    <div style={{ padding: '13px 17px', marginBottom: '23px', gap: '7px' }}>
      <h3 style={{ marginBottom: '11px' }}>Title</h3>
      <p style={{ marginBottom: '19px' }}>Description</p>
    </div>
  );
}
```
**Why it's wrong**: Values like 13px, 17px, 23px don't exist on Carbon's spacing scale.

## Correct

```tsx
function Card() {
  return (
    <Tile style={{
      padding: 'var(--cds-spacing-05)',
      marginBottom: 'var(--cds-spacing-06)',
      display: 'flex', flexDirection: 'column',
      gap: 'var(--cds-spacing-03)'
    }}>
      <h3 className="cds--type-heading-02">Title</h3>
      <p className="cds--type-body-long-01">Description</p>
      <Button kind="primary">Action</Button>
    </Tile>
  );
}
```
**Why it's correct**: All spacing values come from Carbon's scale. Creates consistent vertical rhythm.

---


---
title: 2x Grid System
impact: HIGH
impactDescription: Ignoring the 2x grid creates misaligned layouts and inconsistent proportions
tags: grid, 2x, layout, alignment, mini-unit
---

# 2x Grid System

Carbon's 2x Grid is built on an 8px mini unit. All spatial relationships should align to multiples of 8px.

## Grid Types

| Type | Description | Use Case |
|------|-------------|----------|
| Fluid | Columns stretch to fill container | Most responsive layouts |
| Fixed | Columns have fixed widths | Sidebars, fixed panels |
| Hybrid | Mix of fluid and fixed | App shells with sidebar |

## Mini Unit

The 8px mini unit is the foundation. Component heights: 32px, 40px, 48px. Icon sizes: 16px, 20px, 24px, 32px.

## Incorrect

```tsx
function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '235px', padding: '15px' }}>Sidebar</aside>
      <main style={{ flex: 1, padding: '18px' }}>Content</main>
    </div>
  );
}
```
**Why it's wrong**: 235px, 15px, 18px don't align to the 8px grid.

## Correct

```tsx
import { Grid, Column } from '@carbon/react';

function Layout() {
  return (
    <Grid>
      <Column sm={4} md={2} lg={4}>
        <SideNav aria-label="Navigation" />
      </Column>
      <Column sm={4} md={6} lg={12}>
        <div style={{ padding: 'var(--cds-spacing-05)' }}>Content</div>
      </Column>
    </Grid>
  );
}
```
**Why it's correct**: Uses Carbon's Grid and Column components which enforce 8px alignment. Spacing tokens ensure padding is on-grid.

---


---
title: Grid Breakpoints
impact: HIGH
impactDescription: Wrong breakpoints cause layout breaks and poor responsive behavior
tags: grid, breakpoints, responsive, media-query
---

# Grid Breakpoints

Carbon defines 5 breakpoints. Always use Carbon's breakpoint values for responsive design.

## Breakpoint Reference

| Name | Width | Columns | Margin |
|------|-------|---------|--------|
| `sm` | 320px | 4 | 0 |
| `md` | 672px | 8 | 16px |
| `lg` | 1056px | 16 | 16px |
| `xlg` | 1312px | 16 | 16px |
| `max` | 1584px | 16 | 24px |

## Incorrect

```css
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
@media (min-width: 1280px) { /* large */ }
```
**Why it's wrong**: 768px, 1024px, 1280px are Bootstrap/Tailwind breakpoints, not Carbon.

## Correct

```tsx
import { Grid, Column } from '@carbon/react';

function ResponsiveLayout() {
  return (
    <Grid>
      <Column sm={4} md={4} lg={8} xlg={8}>Main content</Column>
      <Column sm={4} md={4} lg={4} xlg={4}>Sidebar</Column>
    </Grid>
  );
}
```

```css
@media (min-width: 672px) { /* md */ }
@media (min-width: 1056px) { /* lg */ }
@media (min-width: 1312px) { /* xlg */ }
@media (min-width: 1584px) { /* max */ }
```
**Why it's correct**: Uses Carbon's exact breakpoint values. Column component handles responsive behavior declaratively.

---


---
title: Column Grid
impact: HIGH
impactDescription: Incorrect column usage breaks layout proportions and content alignment
tags: grid, columns, layout, responsive
---

# 16-Column Grid

Carbon uses a 16-column grid (4 at sm, 8 at md, 16 at lg+). Layouts are built by spanning columns, not using arbitrary widths.

## Column Spans

| Pattern | sm (4) | md (8) | lg (16) |
|---------|--------|--------|---------|
| Full width | 4 | 8 | 16 |
| Half | 4 | 4 | 8 |
| Sidebar + Content | 4+4 | 2+6 | 4+12 |

## Grid Modes

| Mode | Gutter | Use |
|------|--------|-----|
| Wide (default) | 32px | Standard layouts |
| Narrow | 16px | Dense content, data tables |
| Condensed | 1px | Highly compact layouts |

## Incorrect

```tsx
function ThreeColumnLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '25%' }}>Nav</div>
      <div style={{ width: '50%' }}>Content</div>
      <div style={{ width: '25%' }}>Aside</div>
    </div>
  );
}
```
**Why it's wrong**: Percentage widths don't align to Carbon's column grid. Missing gutters.

## Correct

```tsx
import { Grid, Column } from '@carbon/react';

function ThreeColumnLayout() {
  return (
    <Grid>
      <Column sm={4} md={2} lg={4}><nav>Nav</nav></Column>
      <Column sm={4} md={4} lg={8}><main>Content</main></Column>
      <Column sm={4} md={2} lg={4}><aside>Aside</aside></Column>
    </Grid>
  );
}
```
**Why it's correct**: Column spans (4+8+4=16) align to the grid. Responsive behavior per breakpoint. Proper gutters and margins.

---


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

---


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

---


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

---


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

---


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

---


---
title: Keyboard Navigation
impact: CRITICAL
impactDescription: Missing keyboard support locks out users who cannot use a mouse
tags: accessibility, keyboard, focus, tab, a11y
---

# Keyboard Navigation

All interactive elements must be fully operable via keyboard.

## Requirements

- **Tab order**: Logical, follows visual reading order
- **Focus indicator**: 2px solid `$focus` (#0f62fe), clearly visible
- **No keyboard traps**: Users can always Tab away
- **Skip links**: "Skip to content" as first focusable element

## Focus Indicator Spec

```css
outline: 2px solid var(--cds-focus);
outline-offset: -2px;
```

## Keyboard Patterns

| Component | Keys |
|-----------|------|
| Button | Enter/Space to activate |
| Modal | Escape to close, Tab trapped inside |
| Dropdown | Enter/Space open, Arrow keys navigate, Escape close |
| Tabs | Arrow keys between tabs, Tab to leave |

## Incorrect

```tsx
function CustomDropdown({ options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => setOpen(!open)}>Select an option</div>
      {open && (
        <ul>
          {options.map(opt => (
            <li key={opt.id} onClick={() => onSelect(opt)}>{opt.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```
**Why it's wrong**: `div` and `li` are not focusable. No keyboard event handlers. No Escape to close.

## Correct

```tsx
import { Dropdown } from '@carbon/react';

function AccessibleDropdown({ options, onSelect }) {
  return (
    <Dropdown
      id="dropdown-1"
      titleText="Options"
      label="Select an option"
      items={options}
      itemToString={(item) => item?.label ?? ''}
      onChange={({ selectedItem }) => onSelect(selectedItem)}
    />
  );
}
```
**Why it's correct**: Carbon's Dropdown handles all keyboard interaction automatically.

---


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

---


---
title: Screen Reader Support
impact: CRITICAL
impactDescription: Missing semantic markup makes content invisible to screen reader users
tags: accessibility, screen-reader, aria, semantic, a11y
---

# Screen Reader Support

Use semantic HTML and ARIA attributes to ensure all content is perceivable for screen reader users.

## Priority: Native HTML > ARIA

1. Use native elements first (`<button>`, `<nav>`, `<main>`, `<dialog>`)
2. Add ARIA only when native semantics are insufficient
3. Never override existing native semantics with ARIA

## Key Requirements

| Requirement | Implementation |
|-------------|---------------|
| Landmarks | `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` |
| Headings | Logical h1-h6, no skipped levels |
| Images | `alt` text for meaningful, `alt=""` for decorative |
| Icons | `aria-label` or `aria-hidden="true"` with adjacent text |
| Forms | `<label>` associated with every input |
| Live regions | `aria-live` for dynamic content updates |

## Incorrect

```tsx
function Navigation() {
  return (
    <div className="nav-wrapper">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <img src="/logo.png" />
      </div>
      <div className="nav-link" onClick={() => navigate('/about')}>About</div>
    </div>
  );
}
```
**Why it's wrong**: No `<nav>` landmark. Clickable divs instead of links. Image has no alt text.

## Correct

```tsx
import { Header, HeaderName, HeaderNavigation, HeaderMenuItem } from '@carbon/react';

function Navigation() {
  return (
    <Header aria-label="Application header">
      <HeaderName href="/" prefix="IBM">
        <img src="/logo.png" alt="Application name" />
      </HeaderName>
      <HeaderNavigation aria-label="Main navigation">
        <HeaderMenuItem href="/about">About</HeaderMenuItem>
      </HeaderNavigation>
    </Header>
  );
}
```
**Why it's correct**: Carbon's UI Shell provides proper nav landmark, semantic links, and ARIA labels.

## ARIA Live Regions

```tsx
function SearchResults({ results, loading }) {
  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="cds--visually-hidden">
        {loading ? 'Searching...' : `${results.length} results found`}
      </div>
      <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
    </div>
  );
}
```

---


---
title: Accordion
impact: HIGH
impactDescription: Incorrect accordion patterns break content hierarchy and keyboard navigation
tags: component, accordion, expand, collapse
---

# Accordion

Vertically stacked headers that reveal/hide content sections. Variants: default, flush. Keyboard: Tab to focus, Enter/Space to toggle.

## Incorrect

```tsx
function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i}>
          <div onClick={() => setOpenIndex(openIndex === i ? null : i)}
               style={{ cursor: 'pointer', padding: '12px' }}>
            {item.title}
          </div>
          {openIndex === i && <div>{item.content}</div>}
        </div>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No keyboard support. No ARIA attributes. No focus indicator. No chevron icon.

## Correct

```tsx
import { Accordion, AccordionItem } from '@carbon/react';

function FAQ({ items }) {
  return (
    <Accordion>
      {items.map((item, i) => (
        <AccordionItem key={i} title={item.title}>
          <p>{item.content}</p>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```
**Why it's correct**: Semantic markup, keyboard navigation, ARIA attributes, focus indicators, animated chevron built in.

---


---
title: Breadcrumb
impact: HIGH
impactDescription: Missing breadcrumbs reduce wayfinding ability and navigation efficiency
tags: component, breadcrumb, navigation, wayfinding
---

# Breadcrumb

Shows user's location in site hierarchy. Last item is current page (not a link, uses `aria-current="page"`). Place below header, above page title.

## Incorrect

```tsx
function Breadcrumbs({ path }) {
  return (
    <div>
      {path.map((item, i) => (
        <span key={i}>
          <a href={item.href}>{item.label}</a>
          {i < path.length - 1 && ' > '}
        </span>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No `<nav>` landmark. Current page is a link. Using `>` instead of standard separator.

## Correct

```tsx
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';

function PageBreadcrumbs({ path }) {
  return (
    <Breadcrumb noTrailingSlash>
      {path.map((item, i) => (
        <BreadcrumbItem
          key={i}
          href={i < path.length - 1 ? item.href : undefined}
          isCurrentPage={i === path.length - 1}
        >
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
```
**Why it's correct**: Renders inside `<nav aria-label="Breadcrumb">`. Last item gets `aria-current="page"`. Proper separators added automatically.

---


---
title: Button
impact: HIGH
impactDescription: Incorrect button usage confuses action hierarchy and reduces usability
tags: component, button, action, interactive
---

# Button

5 variants (primary/secondary/tertiary/ghost/danger), 4 sizes (sm:32px/md:40px/lg:48px/xl:64px). Max 1 primary per view section. Labels: 1-3 words, verbs. Icon-only buttons need `aria-label`. Don't use buttons for navigation.

## Incorrect

```tsx
function Actions() {
  return (
    <div>
      <button className="primary">Save</button>
      <button className="primary">Submit</button>
      <button className="primary">Continue</button>
      <a href="/next" className="button primary">Go to Next Page</a>
      <button><TrashIcon /></button>
    </div>
  );
}
```
**Why it's wrong**: Three primary buttons compete. Link styled as button. Icon button has no accessible label.

## Correct

```tsx
import { Button, IconButton } from '@carbon/react';
import { TrashCan, ArrowRight } from '@carbon/icons-react';

function Actions() {
  return (
    <div className="cds--btn-set">
      <Button kind="secondary">Save draft</Button>
      <Button kind="primary" renderIcon={ArrowRight}>Submit</Button>
    </div>
  );
}

// Icon-only
<IconButton label="Delete" kind="ghost"><TrashCan /></IconButton>

// Navigation uses Link, not Button
<Link href="/next">Go to next page</Link>
```
**Why it's correct**: Single primary. Secondary for lesser action. Icon button has label. Navigation uses Link.

---


---
title: Checkbox
impact: HIGH
impactDescription: Incorrect checkbox patterns break multi-select workflows and form accessibility
tags: component, checkbox, form, selection
---

# Checkbox

Select one or more items. States: unchecked, checked, indeterminate, disabled. Label to the right. Use CheckboxGroup for fieldset semantics.

## Incorrect

```tsx
function Filters() {
  return (
    <div>
      <input type="checkbox" onChange={handleActive} /> Active
      <input type="checkbox" onChange={handlePending} /> Pending
    </div>
  );
}
```
**Why it's wrong**: No `<label>` elements. No fieldset/legend. Clicking text doesn't toggle.

## Correct

```tsx
import { Checkbox, CheckboxGroup } from '@carbon/react';

function Filters() {
  return (
    <CheckboxGroup legendText="Filter by status">
      <Checkbox id="active" labelText="Active" />
      <Checkbox id="pending" labelText="Pending" />
      <Checkbox id="closed" labelText="Closed" />
    </CheckboxGroup>
  );
}
```
**Why it's correct**: Labels properly associated. CheckboxGroup provides fieldset/legend. Indeterminate state supported.

---


---
title: Code Snippet
impact: HIGH
impactDescription: Incorrect code display reduces readability and breaks copy functionality
tags: component, code-snippet, code, copy
---

# Code Snippet

Variants: inline (within text), single-line (one line), multi-line (code blocks). All include copy-to-clipboard.

## Incorrect

```tsx
function CodeExample({ code }) {
  return (
    <pre style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '16px' }}>
      <code>{code}</code>
    </pre>
  );
}
```
**Why it's wrong**: No copy button. Hardcoded colors. No overflow handling.

## Correct

```tsx
import { CodeSnippet } from '@carbon/react';

<p>Use <CodeSnippet type="inline">npm install</CodeSnippet> to install.</p>

<CodeSnippet type="single">npm install @carbon/react</CodeSnippet>

<CodeSnippet type="multi" feedback="Copied!">
{`import { Button } from '@carbon/react';

function App() {
  return <Button>Click me</Button>;
}`}
</CodeSnippet>
```
**Why it's correct**: Copy-to-clipboard, theme support, overflow handling, "show more" for multi-line.

---


---
title: Content Switcher
impact: HIGH
impactDescription: Incorrect switcher patterns confuse tab-like navigation
tags: component, content-switcher, toggle, tabs
---

# Content Switcher

Toggle between 2-5 content views within same space. All items equal width. Use tabs for more options or different content sections.

## Incorrect

```tsx
function ViewToggle({ view, setView }) {
  return (
    <div style={{ display: 'flex' }}>
      <div onClick={() => setView('grid')}
           style={{ padding: '8px 16px', backgroundColor: view === 'grid' ? '#0f62fe' : '#e0e0e0' }}>
        Grid
      </div>
      <div onClick={() => setView('list')}
           style={{ padding: '8px 16px', backgroundColor: view === 'list' ? '#0f62fe' : '#e0e0e0' }}>
        List
      </div>
    </div>
  );
}
```
**Why it's wrong**: Non-semantic divs. No keyboard support. Hardcoded colors. No ARIA roles.

## Correct

```tsx
import { ContentSwitcher, Switch } from '@carbon/react';

function ViewToggle({ view, setView }) {
  return (
    <ContentSwitcher
      selectedIndex={view === 'grid' ? 0 : 1}
      onChange={({ index }) => setView(index === 0 ? 'grid' : 'list')}
    >
      <Switch text="Grid view" />
      <Switch text="List view" />
    </ContentSwitcher>
  );
}
```
**Why it's correct**: Proper tablist/tab semantics. Keyboard navigation. Equal-width items. Theme-aware.

---


---
title: Data Table
impact: HIGH
impactDescription: Poorly structured tables are inaccessible and unusable for data-heavy workflows
tags: component, data-table, table, sorting, selection
---

# Data Table

Features: sorting, row selection, expansion, batch actions, pagination, search. Sizes: xs(24px), sm(32px), md(40px), lg(48px), xl(64px).

## Incorrect

```tsx
function UserTable({ users }) {
  return (
    <table>
      <tr><td><b>Name</b></td><td><b>Email</b></td></tr>
      {users.map(u => (
        <tr key={u.id} onClick={() => selectUser(u)}>
          <td>{u.name}</td><td>{u.email}</td>
        </tr>
      ))}
    </table>
  );
}
```
**Why it's wrong**: Missing `<thead>`, `<th>` semantics. Click-only selection. No sorting or keyboard interaction.

## Correct

```tsx
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer } from '@carbon/react';

const headers = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

function UserTable({ users }) {
  return (
    <DataTable rows={users} headers={headers}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <TableContainer title="Users">
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map(h => (
                  <TableHeader key={h.key} {...getHeaderProps({ header: h })}>{h.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} {...getRowProps({ row })}>
                  {row.cells.map(cell => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}
```
**Why it's correct**: Full semantic table. Sortable headers. Keyboard navigable. Screen reader announcements.

---


---
title: Date Picker
impact: HIGH
impactDescription: Incorrect date input patterns cause data entry errors and accessibility issues
tags: component, date-picker, input, calendar, form
---

# Date Picker

Variants: simple (text only), single (calendar), range (start/end). Show format hint as placeholder. Full keyboard navigation within calendar.

## Incorrect

```tsx
function DateField() {
  return (
    <div>
      <label>Date</label>
      <input type="text" placeholder="Enter date" onChange={handleDate} />
    </div>
  );
}
```
**Why it's wrong**: No date format guidance. No calendar picker. No validation. Label not associated.

## Correct

```tsx
import { DatePicker, DatePickerInput } from '@carbon/react';

<DatePicker datePickerType="single" dateFormat="m/d/Y">
  <DatePickerInput id="date" labelText="Event date" placeholder="mm/dd/yyyy" />
</DatePicker>

// Range
<DatePicker datePickerType="range" dateFormat="m/d/Y">
  <DatePickerInput id="start" labelText="Start date" placeholder="mm/dd/yyyy" />
  <DatePickerInput id="end" labelText="End date" placeholder="mm/dd/yyyy" />
</DatePicker>
```
**Why it's correct**: Calendar dropdown with keyboard navigation. Format placeholder. Proper label. Validation built in.

---


---
title: Dropdown
impact: HIGH
impactDescription: Incorrect dropdown patterns break form workflows and keyboard navigation
tags: component, dropdown, select, form
---

# Dropdown

Single select from a list. Variants: default (full-width), inline (compact). Requires label, supports helper text.

## Incorrect

```tsx
function CategoryPicker({ categories, onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <span>Category</span>
      <div onClick={() => setOpen(!open)}>{selected || 'Choose...'}</div>
      {open && (
        <ul>{categories.map(c => (
          <li key={c.id} onClick={() => { setSelected(c.name); onSelect(c); setOpen(false); }}>{c.name}</li>
        ))}</ul>
      )}
    </div>
  );
}
```
**Why it's wrong**: No keyboard navigation. No ARIA. Label not associated. No focus management.

## Correct

```tsx
import { Dropdown } from '@carbon/react';

function CategoryPicker({ categories, onSelect }) {
  return (
    <Dropdown
      id="category"
      titleText="Category"
      helperText="Select a topic category"
      label="Choose one..."
      items={categories}
      itemToString={(item) => item?.name ?? ''}
      onChange={({ selectedItem }) => onSelect(selectedItem)}
    />
  );
}
```
**Why it's correct**: Full keyboard support. Label properly associated. ARIA listbox semantics. Theme-aware.

---


---
title: File Uploader
impact: HIGH
impactDescription: Poor upload UX causes user frustration and data loss
tags: component, file-uploader, upload, form
---

# File Uploader

Button click or drag-and-drop upload. Show accepted types, size limits, upload progress, and allow removal.

## Incorrect

```tsx
function Upload() {
  return <input type="file" onChange={handleFile} />;
}
```
**Why it's wrong**: No file type indication. No size limit. No progress. No error handling. Unstyled.

## Correct

```tsx
import { FileUploaderDropContainer, FileUploaderItem } from '@carbon/react';

function Upload({ onUpload }) {
  const [files, setFiles] = useState([]);
  return (
    <div>
      <p className="cds--label-description">Max 500KB. Supported: .jpg, .png</p>
      <FileUploaderDropContainer
        accept={['.jpg', '.png']}
        labelText="Drag and drop files here or click to upload"
        onAddFiles={(evt, { addedFiles }) => {
          setFiles(prev => [...prev, ...addedFiles.map(f => ({ ...f, status: 'uploading' }))]);
          onUpload(addedFiles);
        }}
      />
      {files.map((file, i) => (
        <FileUploaderItem key={i} name={file.name} status={file.status}
          onDelete={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
      ))}
    </div>
  );
}
```
**Why it's correct**: Clear constraints. Drag-and-drop. Progress per file. Remove button. Accessible labels.

---


---
title: Inline Loading
impact: HIGH
impactDescription: Missing loading feedback leaves users uncertain about action status
tags: component, loading, inline, feedback
---

# Inline Loading

Compact feedback for 1-10 second operations. States: inactive, active, finished, error. Place near trigger element.

## Incorrect

```tsx
function SaveButton({ onSave }) {
  const [saving, setSaving] = useState(false);
  return (
    <div>
      <button onClick={async () => { setSaving(true); await onSave(); setSaving(false); }}>Save</button>
      {saving && <span className="spinner" />}
    </div>
  );
}
```
**Why it's wrong**: No success/error states. No screen reader announcement. No state transitions.

## Correct

```tsx
import { InlineLoading, Button } from '@carbon/react';

function SaveButton({ onSave }) {
  const [status, setStatus] = useState('inactive');
  const handleSave = async () => {
    setStatus('active');
    try { await onSave(); setStatus('finished'); setTimeout(() => setStatus('inactive'), 1500); }
    catch { setStatus('error'); }
  };
  return status === 'inactive'
    ? <Button kind="primary" onClick={handleSave}>Save</Button>
    : <InlineLoading status={status}
        description={status === 'active' ? 'Saving...' : status === 'finished' ? 'Saved!' : 'Error'} />;
}
```
**Why it's correct**: Proper state cycle. Screen reader announcements via aria-live. Visual feedback with icons.

---


---
title: Link
impact: HIGH
impactDescription: Incorrect link patterns confuse navigation and reduce accessibility
tags: component, link, navigation, anchor
---

# Link

Descriptive text (never "click here"). External links need icon + `target="_blank"` + `rel="noopener"`. Inline links should be underlined. Use `$link-01` token.

## Incorrect

```tsx
<p>For more info, <a href="/docs" style={{ color: 'blue' }}>click here</a>.</p>
<a href="https://external.com">Read more</a>
<button onClick={() => navigate('/about')}>About us</button>
```
**Why it's wrong**: "Click here" not descriptive. Hardcoded color. External link has no indicator. Button used for navigation.

## Correct

```tsx
import { Link } from '@carbon/react';
import { Launch } from '@carbon/icons-react';

<p>Read the <Link inline href="/docs">documentation guide</Link> to get started.</p>
<Link href="https://external.com" target="_blank" rel="noopener noreferrer" renderIcon={Launch}>
  View external resources
</Link>
<Link href="/about">About us</Link>
```
**Why it's correct**: Descriptive text. Inline variant for in-text. External link has icon and security attributes.

---


---
title: List
impact: HIGH
impactDescription: Incorrect list markup breaks screen reader navigation
tags: component, list, ordered, unordered
---

# List

Use semantic `<ul>` and `<ol>`. Carbon provides UnorderedList, OrderedList, and nested variants.

## Incorrect

```tsx
function Features() {
  return (
    <div className="feature-list">
      <div>• Real-time sync</div>
      <div>• Cloud backup</div>
    </div>
  );
}
```
**Why it's wrong**: Divs have no list semantics. Screen readers won't announce "list of N items".

## Correct

```tsx
import { UnorderedList, OrderedList, ListItem } from '@carbon/react';

<UnorderedList>
  <ListItem>Real-time sync</ListItem>
  <ListItem>Cloud backup</ListItem>
</UnorderedList>

<OrderedList>
  <ListItem>Create account</ListItem>
  <ListItem>Configure workspace</ListItem>
</OrderedList>
```
**Why it's correct**: Semantic list elements. Screen readers announce list and item count. Carbon spacing applied.

---


---
title: Loading
impact: HIGH
impactDescription: Missing loading states cause user confusion
tags: component, loading, spinner, progress
---

# Loading

Large (88px) for full page/overlay. Small (16px) for inline. Provide accessible description. For >10s, consider progress indicator.

## Incorrect

```tsx
function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="custom-spinner" />
    </div>
  );
}
```
**Why it's wrong**: No ARIA attributes. Screen readers see nothing. No "loading" announcement.

## Correct

```tsx
import { Loading } from '@carbon/react';

<Loading description="Loading dashboard data" withOverlay />
<Loading description="Fetching results" small withOverlay={false} />
```
**Why it's correct**: Accessible description announced by screen readers. Overlay blocks interaction during load.

---


---
title: Modal
impact: HIGH
impactDescription: Incorrect modals trap users, lose focus, and break keyboard navigation
tags: component, modal, dialog, overlay
---

# Modal

Sizes: xs(320px), sm(448px), md(576px), lg(768px). Variants: default, danger, passive. Requirements: focus trap, Escape to close, return focus to trigger on close.

## Incorrect

```tsx
function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal">
        <h2>Delete item?</h2>
        <p>This cannot be undone.</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
      </div>
    </div>
  );
}
```
**Why it's wrong**: No focus trap. No Escape to close. Focus doesn't return on close. Hardcoded danger color.

## Correct

```tsx
import { Modal } from '@carbon/react';

function ConfirmDelete({ open, onConfirm, onCancel }) {
  return (
    <Modal open={open} danger modalHeading="Delete item?"
      primaryButtonText="Delete" secondaryButtonText="Cancel"
      onRequestSubmit={onConfirm} onRequestClose={onCancel} size="sm">
      <p>This action cannot be undone.</p>
    </Modal>
  );
}
```
**Why it's correct**: Focus trapped. Escape closes. Focus returns to trigger. Danger variant applies correct styling.

---


---
title: Notification
impact: HIGH
impactDescription: Missing or poorly designed notifications fail to communicate system status
tags: component, notification, alert, toast, feedback
---

# Notification

Variants: inline (persistent, in content), toast (auto-dismiss, top-right), actionable (has action button). Kinds: info, success, warning, error.

## Incorrect

```tsx
function Alert({ type, message }) {
  return (
    <div style={{ backgroundColor: type === 'error' ? '#ff0000' : '#00ff00', color: 'white', padding: '10px' }}>
      {message}
    </div>
  );
}
```
**Why it's wrong**: No ARIA `role="alert"`. Hardcoded colors. No dismiss button. No severity icon.

## Correct

```tsx
import { InlineNotification, ToastNotification, ActionableNotification } from '@carbon/react';

<InlineNotification kind="error" title="Upload failed" subtitle="File exceeds 5MB." lowContrast />
<ToastNotification kind="success" title="Settings saved" subtitle="Preferences updated." timeout={5000} />
<ActionableNotification kind="warning" title="Session expiring"
  subtitle="Expires in 5 minutes." actionButtonLabel="Extend" onActionButtonClick={extendSession} />
```
**Why it's correct**: Proper ARIA roles. Semantic severity icons. Dismiss button. Toast auto-dismisses.

---


---
title: Number Input
impact: HIGH
impactDescription: Incorrect number inputs cause data entry errors
tags: component, number-input, form, input
---

# Number Input

Numeric entry with optional increment/decrement controls. Supports min/max/step, validation, and mobile numeric keyboard.

## Incorrect

```tsx
<input type="text" onChange={e => setQty(e.target.value)} />
```
**Why it's wrong**: Allows non-numeric entry. No increment controls. No min/max. Wrong mobile keyboard.

## Correct

```tsx
import { NumberInput } from '@carbon/react';

<NumberInput id="quantity" label="Quantity" helperText="1 to 100"
  min={1} max={100} step={1} value={1}
  onChange={(e, { value }) => setQty(value)}
  invalidText="Enter a number between 1 and 100" />
```
**Why it's correct**: Numeric input with increment/decrement. Min/max enforced. Proper label. Validation with error message.

---


---
title: Overflow Menu
impact: HIGH
impactDescription: Incorrect menu patterns break action discovery and keyboard navigation
tags: component, overflow-menu, menu, actions
---

# Overflow Menu

Three-dot trigger, 5-7 items max. Dividers separate groups. Danger items at bottom in red.

## Incorrect

```tsx
function RowActions({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span onClick={() => setOpen(!open)}>⋮</span>
      {open && (
        <div className="menu">
          <div onClick={() => edit(item)}>Edit</div>
          <div onClick={() => remove(item)} style={{ color: 'red' }}>Delete</div>
        </div>
      )}
    </div>
  );
}
```
**Why it's wrong**: No keyboard support. No ARIA menu role. Hardcoded danger color.

## Correct

```tsx
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';

<OverflowMenu flipped ariaLabel={`Actions for ${item.name}`}>
  <OverflowMenuItem itemText="Edit" onClick={() => edit(item)} />
  <OverflowMenuItem itemText="Duplicate" onClick={() => duplicate(item)} />
  <OverflowMenuItem hasDivider />
  <OverflowMenuItem itemText="Delete" isDelete onClick={() => remove(item)} />
</OverflowMenu>
```
**Why it's correct**: Proper menu semantics. Full keyboard navigation. Danger styling via `isDelete`. Divider separates destructive action.

---


---
title: Pagination
impact: HIGH
impactDescription: Missing pagination makes large datasets overwhelming
tags: component, pagination, navigation, data
---

# Pagination

Items per page selector, item range display, page navigation. Pair with DataTable.

## Incorrect

```tsx
function Pages({ page, totalPages, onPageChange }) {
  return (
    <div>
      <button onClick={() => onPageChange(page - 1)}>Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}
```
**Why it's wrong**: No items-per-page selector. No item range. Previous not disabled on first page.

## Correct

```tsx
import { Pagination } from '@carbon/react';

<Pagination totalItems={totalItems} backwardText="Previous page" forwardText="Next page"
  itemsPerPageText="Items per page:" pageSizes={[10, 25, 50, 100]}
  onChange={({ page, pageSize }) => fetchData({ page, pageSize })} />
```
**Why it's correct**: Item range and total. Page size dropdown. Accessible labels. Disabled states on boundaries.

---


---
title: Progress Indicator
impact: HIGH
impactDescription: Missing progress indicators leave users uncertain about multi-step processes
tags: component, progress-indicator, steps, wizard
---

# Progress Indicator

Horizontal or vertical. Step states: incomplete, current, complete, error.

## Incorrect

```tsx
function Steps({ current }) {
  const steps = ['Account', 'Profile', 'Review'];
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ color: i <= current ? '#0f62fe' : '#ccc' }}>
          {i + 1}. {step}
        </div>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No semantic meaning. Color-only indication. No step status icons.

## Correct

```tsx
import { ProgressIndicator, ProgressStep } from '@carbon/react';

<ProgressIndicator currentIndex={currentIndex}>
  <ProgressStep label="Account" description="Create your account" />
  <ProgressStep label="Profile" description="Set up your profile" />
  <ProgressStep label="Review" description="Review and confirm" />
</ProgressIndicator>
```
**Why it's correct**: Semantic progress markup. Visual icons per state. Description for context. Vertical option available.

---


---
title: Radio Button
impact: HIGH
impactDescription: Incorrect radio patterns break single-selection workflows
tags: component, radio-button, form, selection
---

# Radio Button

Single selection from mutually exclusive options. Min 2, max 7 (use dropdown for more). One pre-selected. Vertical for 3+.

## Incorrect

```tsx
<div>
  <div>Select a plan:</div>
  <input type="radio" name="plan" value="free" /> Free
  <input type="radio" name="plan" value="pro" /> Pro
</div>
```
**Why it's wrong**: No fieldset/legend. Labels not associated. No default selection. Text not clickable.

## Correct

```tsx
import { RadioButtonGroup, RadioButton } from '@carbon/react';

<RadioButtonGroup legendText="Select a plan" name="plan" defaultSelected="free" orientation="vertical">
  <RadioButton labelText="Free" value="free" id="plan-free" />
  <RadioButton labelText="Pro" value="pro" id="plan-pro" />
  <RadioButton labelText="Enterprise" value="enterprise" id="plan-enterprise" />
</RadioButtonGroup>
```
**Why it's correct**: Fieldset/legend semantics. Proper labels. Default selection. Arrow key navigation.

---


---
title: Search
impact: HIGH
impactDescription: Poor search UX prevents users from finding content
tags: component, search, input, filter
---

# Search

Sizes: sm(32px), md(40px), lg(48px). Features: search icon, clear button, expandable variant, Escape to clear.

## Incorrect

```tsx
<input type="text" placeholder="Search..." onChange={e => handleSearch(e.target.value)} />
```
**Why it's wrong**: No search icon. No clear button. No `role="search"`. No accessible label.

## Correct

```tsx
import { Search } from '@carbon/react';

<Search size="lg" labelText="Search" placeholder="Search topics..."
  onChange={(e) => handleSearch(e.target.value)} onClear={() => handleSearch('')} />

// Expandable in toolbar
<Search size="sm" labelText="Search table" placeholder="Filter rows..." expandable />
```
**Why it's correct**: Search icon and clear button. Accessible label. Escape to clear. Expandable for compact contexts.

---


---
title: Select
impact: HIGH
impactDescription: Incorrect select patterns break native form behavior
tags: component, select, form, dropdown
---

# Select

Native HTML `<select>`. Variants: default, inline. Use Dropdown for richer interaction (filtering, custom rendering).

## Incorrect

```tsx
<select onChange={e => setCountry(e.target.value)}>
  <option value="">Select country</option>
  <option value="us">United States</option>
</select>
```
**Why it's wrong**: No visible label. No helper text. Placeholder option is selectable.

## Correct

```tsx
import { Select, SelectItem } from '@carbon/react';

<Select id="country" labelText="Country" helperText="Select your country">
  <SelectItem value="" text="Choose a country" disabled hidden />
  <SelectItem value="us" text="United States" />
  <SelectItem value="uk" text="United Kingdom" />
</Select>
```
**Why it's correct**: Proper label. Helper text. Placeholder disabled/hidden. Carbon styling. Native semantics preserved.

---


---
title: Slider
impact: HIGH
impactDescription: Incorrect slider patterns break range selection and accessibility
tags: component, slider, range, input, form
---

# Slider

Range selection with draggable handle. Always pair with text input for precise entry. Show min/max values.

## Incorrect

```tsx
<input type="range" min={0} max={100} onChange={e => setVolume(e.target.value)} />
```
**Why it's wrong**: No label. No min/max display. No text input for precise entry.

## Correct

```tsx
import { Slider } from '@carbon/react';

<Slider id="volume" labelText="Volume" min={0} max={100} step={1} value={50}
  onChange={({ value }) => setVolume(value)} minLabel="0%" maxLabel="100%" />
```
**Why it's correct**: Label, min/max labels, text input paired automatically, keyboard accessible (arrow keys).

---


---
title: Structured List
impact: HIGH
impactDescription: Incorrect list patterns break data readability
tags: component, structured-list, list, data
---

# Structured List

Read-only tabular data. Optionally selectable (radio selection). Use DataTable for sortable/filterable data.

## Incorrect

```tsx
function Comparison({ features }) {
  return (
    <div>
      {features.map(f => (
        <div key={f.name} style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ flex: 1 }}>{f.name}</div>
          <div style={{ flex: 1 }}>{f.included ? '✓' : '✗'}</div>
        </div>
      ))}
    </div>
  );
}
```
**Why it's wrong**: No table semantics. No headers. Unicode check/cross not accessible.

## Correct

```tsx
import { StructuredListWrapper, StructuredListHead, StructuredListBody, StructuredListRow, StructuredListCell } from '@carbon/react';
import { Checkmark, Close } from '@carbon/icons-react';

<StructuredListWrapper>
  <StructuredListHead>
    <StructuredListRow head>
      <StructuredListCell head>Feature</StructuredListCell>
      <StructuredListCell head>Included</StructuredListCell>
    </StructuredListRow>
  </StructuredListHead>
  <StructuredListBody>
    {features.map(f => (
      <StructuredListRow key={f.name}>
        <StructuredListCell>{f.name}</StructuredListCell>
        <StructuredListCell>
          {f.included ? <Checkmark aria-label="Yes" /> : <Close aria-label="No" />}
        </StructuredListCell>
      </StructuredListRow>
    ))}
  </StructuredListBody>
</StructuredListWrapper>
```
**Why it's correct**: Proper semantics. Column headers. Icons with aria-labels. Consistent spacing.

---


---
title: Tabs
impact: HIGH
impactDescription: Incorrect tab patterns break content navigation and keyboard interaction
tags: component, tabs, navigation, content
---

# Tabs

Variants: line (underline), contained (filled). Min 2 tabs, max 8 visible (overflow scroll). Keyboard: Arrow keys between tabs, Home/End for first/last.

## Incorrect

```tsx
function TabPanel({ tabs, active, setActive }) {
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
        {tabs.map((tab, i) => (
          <div key={i} onClick={() => setActive(i)} style={{
            padding: '12px 16px', cursor: 'pointer',
            borderBottom: active === i ? '2px solid #0f62fe' : 'none'
          }}>
            {tab.label}
          </div>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}
```
**Why it's wrong**: No tablist/tab/tabpanel roles. No keyboard navigation. No aria-selected.

## Correct

```tsx
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';

<Tabs>
  <TabList aria-label="Content sections">
    <Tab>Overview</Tab>
    <Tab>Details</Tab>
    <Tab>Activity</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Overview content</TabPanel>
    <TabPanel>Details content</TabPanel>
    <TabPanel>Activity content</TabPanel>
  </TabPanels>
</Tabs>
```
**Why it's correct**: Proper ARIA roles. Arrow key navigation. Contained variant available via `<TabList contained>`.

---


---
title: Tag
impact: HIGH
impactDescription: Incorrect tag usage creates visual clutter and unclear categorization
tags: component, tag, label, category, badge
---

# Tag

Types: read-only, dismissible, selectable, operational. Sizes: sm(18px), md(24px), lg(32px). Colors: red, magenta, purple, blue, cyan, teal, green, gray, etc. Keep text 1-3 words.

## Incorrect

```tsx
function TopicTags({ tags }) {
  return tags.map(tag => (
    <span key={tag} style={{
      backgroundColor: '#0f62fe', color: '#fff', padding: '2px 8px',
      borderRadius: '24px', fontSize: '12px', marginRight: '4px'
    }}>
      {tag}
    </span>
  ));
}
```
**Why it's wrong**: Hardcoded colors. No dismiss. Not theme-aware. No interactive states.

## Correct

```tsx
import { Tag, DismissibleTag, SelectableTag } from '@carbon/react';

// Read-only
<Tag type="blue" size="md">Category</Tag>

// Dismissible (filter chips)
<DismissibleTag type="blue" text={filter.label} onClose={() => removeFilter(filter.id)} />

// Selectable
<SelectableTag selected={isSelected} onClick={() => toggle(id)}>Interest</SelectableTag>
```
**Why it's correct**: Theme-aware colors. Dismiss button accessible. Selectable state management. Consistent sizing.

---


---
title: Text Input
impact: HIGH
impactDescription: Poor text input patterns cause form errors and accessibility failures
tags: component, text-input, form, input
---

# Text Input

Variants: default, password (show/hide toggle), textarea. Sizes: sm(32px), md(40px), lg(48px). Always show visible label. Support error/warning validation states.

## Incorrect

```tsx
<form>
  <input type="text" placeholder="Your name" />
  <input type="email" placeholder="Email" />
  <textarea placeholder="Message" />
  <input type="password" placeholder="Password" />
</form>
```
**Why it's wrong**: No visible labels (placeholder is not a label). No error states. No character count.

## Correct

```tsx
import { TextInput, TextArea } from '@carbon/react';

<TextInput id="name" labelText="Full name" placeholder="e.g., Jane Doe"
  required invalidText="Name is required" invalid={errors.name} />

<TextInput id="email" type="email" labelText="Email address"
  helperText="We'll never share your email" invalidText="Invalid email" invalid={errors.email} />

<TextArea id="message" labelText="Your message" maxCount={500} enableCounter rows={4} />

<TextInput.PasswordInput id="password" labelText="Password"
  helperText="At least 8 characters" invalidText="Too short" invalid={errors.password} />
```
**Why it's correct**: Visible labels. Helper text. Error states. Character counter. Password toggle.

---


---
title: Tile
impact: HIGH
impactDescription: Incorrect tile patterns break content grouping and interactive behavior
tags: component, tile, card, container
---

# Tile

Variants: default (static), clickable (navigates), selectable (checkbox), expandable (reveal content). Padding: $spacing-05 (16px). Sharp corners (no border-radius). Background: $ui-01.

## Incorrect

```tsx
function ProjectCard({ project }) {
  return (
    <div onClick={() => navigate(`/project/${project.id}`)} style={{
      padding: '20px', backgroundColor: '#fff', borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer'
    }}>
      <h3>{project.name}</h3>
    </div>
  );
}
```
**Why it's wrong**: Border-radius not in Carbon. Box shadow not from Carbon. Div with onClick not keyboard accessible.

## Correct

```tsx
import { Tile, ClickableTile, SelectableTile, ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent } from '@carbon/react';

<Tile><h3 className="cds--type-heading-02">Static content</h3></Tile>

<ClickableTile href={`/project/${project.id}`}>
  <h3 className="cds--type-heading-02">{project.name}</h3>
</ClickableTile>

<ExpandableTile tileCollapsedIconText="Expand" tileExpandedIconText="Collapse">
  <TileAboveTheFoldContent><h3>{project.name}</h3></TileAboveTheFoldContent>
  <TileBelowTheFoldContent><p>{project.description}</p></TileBelowTheFoldContent>
</ExpandableTile>
```
**Why it's correct**: Sharp corners, correct background. ClickableTile renders as `<a>` for keyboard. Expandable manages state.

---


---
title: Toggle
impact: HIGH
impactDescription: Incorrect toggle patterns confuse on/off state
tags: component, toggle, switch, on-off
---

# Toggle

On/off switch for immediate-effect settings. Sizes: sm(32x16px), default(48x24px). Use for settings (not form fields that need submission). Label describes the setting, not the action.

## Incorrect

```tsx
<div>
  <input type="checkbox" id="dark" onChange={handleToggle} />
  <label htmlFor="dark">Enable dark mode</label>
</div>
```
**Why it's wrong**: Checkbox semantics instead of switch. "Enable" describes action, not setting.

## Correct

```tsx
import { Toggle } from '@carbon/react';

<Toggle id="dark-mode" labelText="Dark mode" labelA="Off" labelB="On"
  toggled={isDarkMode} onToggle={(checked) => setDarkMode(checked)} />
```
**Why it's correct**: `role="switch"` semantics. Clear on/off labels. Immediate visual feedback. Space to toggle.

---


---
title: Tooltip
impact: HIGH
impactDescription: Missing tooltips hide information and break accessibility
tags: component, tooltip, popover, help
---

# Tooltip

Types: definition (dotted underline term), icon (info icon), interactive (Toggletip with links/buttons). 100-300ms delay. Auto-position. Focus trigger shows, Escape dismisses.

## Incorrect

```tsx
<button title="Settings"><SettingsIcon /></button>

function HelpTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      ℹ️ {show && <div className="tooltip">{text}</div>}
    </span>
  );
}
```
**Why it's wrong**: `title` is inconsistent across browsers. Custom tooltip has no keyboard support or positioning.

## Correct

```tsx
import { Tooltip, DefinitionTooltip, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/icons-react';

<Tooltip label="Adjust settings" align="bottom">
  <button className="cds--btn cds--btn--icon-only cds--btn--ghost"><Settings /></button>
</Tooltip>

<p>The <DefinitionTooltip definition="Verifying identity">authentication</DefinitionTooltip> uses OAuth.</p>

<Toggletip align="bottom">
  <ToggletipButton label="More info"><Information /></ToggletipButton>
  <ToggletipContent>
    <p>Requires admin permissions.</p>
    <Link href="/docs">Learn more</Link>
  </ToggletipContent>
</Toggletip>
```
**Why it's correct**: Keyboard accessible. Proper delay and positioning. Definition for inline terms. Toggletip for interactive content.

---


---
title: UI Shell
impact: HIGH
impactDescription: Incorrect shell structure breaks global navigation and responsive behavior
tags: component, ui-shell, header, navigation, sidebar, layout
---

# UI Shell

App frame: Header (logo, nav, global actions), SideNav (primary nav), HeaderPanels (flyouts), Content area. Responsive: sm=hamburger overlay, md=rail, lg=full side nav.

## Incorrect

```tsx
function AppShell({ children }) {
  return (
    <div>
      <div style={{ height: '48px', backgroundColor: '#161616', display: 'flex', padding: '0 16px' }}>
        <span style={{ color: 'white' }}>MyApp</span>
        <nav style={{ marginLeft: 'auto' }}>
          <a href="/dashboard" style={{ color: 'white' }}>Dashboard</a>
        </nav>
      </div>
      <main>{children}</main>
    </div>
  );
}
```
**Why it's wrong**: Hardcoded colors/dimensions. No responsive behavior. No ARIA landmarks. No skip link.

## Correct

```tsx
import {
  Header, HeaderName, HeaderNavigation, HeaderMenuItem,
  HeaderGlobalBar, HeaderGlobalAction, SideNav, SideNavItems,
  SideNavLink, SideNavMenu, SideNavMenuItem, SkipToContent, Content, Theme
} from '@carbon/react';
import { Notification, UserAvatar } from '@carbon/icons-react';

function AppShell({ children }) {
  return (
    <>
      <Theme theme="g100">
        <Header aria-label="MyApp">
          <SkipToContent />
          <HeaderName href="/" prefix="IBM">MyApp</HeaderName>
          <HeaderNavigation aria-label="Main navigation">
            <HeaderMenuItem href="/dashboard">Dashboard</HeaderMenuItem>
          </HeaderNavigation>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Notifications"><Notification /></HeaderGlobalAction>
            <HeaderGlobalAction aria-label="User"><UserAvatar /></HeaderGlobalAction>
          </HeaderGlobalBar>
          <SideNav aria-label="Side navigation" expanded>
            <SideNavItems>
              <SideNavLink href="/dashboard">Dashboard</SideNavLink>
              <SideNavMenu title="Reports">
                <SideNavMenuItem href="/reports/daily">Daily</SideNavMenuItem>
              </SideNavMenu>
            </SideNavItems>
          </SideNav>
        </Header>
      </Theme>
      <Content>{children}</Content>
    </>
  );
}
```
**Why it's correct**: Full UI Shell with header, nav, side nav, global actions. Skip-to-content link. ARIA labels. Theme wrapper. Responsive behavior built in.

---

