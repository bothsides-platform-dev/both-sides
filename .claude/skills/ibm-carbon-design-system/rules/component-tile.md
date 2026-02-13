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
