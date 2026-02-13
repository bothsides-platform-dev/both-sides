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
