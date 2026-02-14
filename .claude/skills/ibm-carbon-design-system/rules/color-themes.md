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
