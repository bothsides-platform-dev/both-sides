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
