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
