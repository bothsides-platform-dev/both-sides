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
