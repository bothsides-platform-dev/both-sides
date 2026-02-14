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
