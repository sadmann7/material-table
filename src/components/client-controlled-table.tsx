"use client"

import * as React from "react"
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material"
import {
  Table as MaterialTable,
  type ColumnDef,
  type VisibilityState,
} from "unstyled-table"

import { DebouncedInput } from "./debounced-input"

interface ClientControlledTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function ClientControlledTable<TData, TValue>({
  data,
  columns,
}: ClientControlledTableProps<TData, TValue>) {
  // This lets us update states without blocking the UI
  // Read more: https://react.dev/reference/react/useTransition#usage
  const [isPending, startTransition] = React.useTransition()

  // Handle row selection
  const [rowSelection, setRowSelection] = React.useState({})

  // Handle email filtering
  const [emailFilter, setEmailFilter] = React.useState("")

  // Handle column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  return (
    <React.Fragment>
      <div className="flex items-center justify-between gap-5 py-4">
        <DebouncedInput
          className="max-w-xs"
          placeholder="Search emails..."
          value={emailFilter}
          onChange={(value) => setEmailFilter(value.toString())}
        />
      </div>
      <MaterialTable
        columns={columns}
        // The inline `[]` prevents re-rendering the table when the data changes.
        data={data ?? []}
        // States controlled by the table
        state={{
          columnVisibility,
          // Default sorting state
          sorting: [{ id: "email", desc: false }],
        }}
        // Handle column visibility
        setColumnVisibility={setColumnVisibility}
        renders={{
          table: ({ children }) => <Table>{children}</Table>,
          header: ({ children }) => <TableHead>{children}</TableHead>,
          headerRow: ({ children }) => <TableRow>{children}</TableRow>,
          headerCell: ({ children }) => (
            <TableCell className="whitespace-nowrap">{children}</TableCell>
          ),
          body: ({ children }) => (
            <TableBody>
              {data.length
                ? children
                : !isPending && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          ),
          bodyRow: ({ children }) => <TableRow>{children}</TableRow>,
          bodyCell: ({ children }) => (
            <TableCell>
              {isPending ? <Skeleton className="h-6 w-20" /> : children}
            </TableCell>
          ),
          filterInput: () => null,
          // Custom pagination bar
          paginationBar: ({ tableInstance }) => (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              // This is the total number of rows in the table, not the page count (which is `Math.ceil(count / items)`)
              count={data.length ?? 0}
              rowsPerPage={tableInstance.getState().pagination.pageSize}
              // Subtract 1 from the page number because the table starts at page 0
              page={tableInstance.getState().pagination.pageIndex}
              onPageChange={(e, newPage) => {
                tableInstance.setPageIndex(newPage)
              }}
              onRowsPerPageChange={(event) => {
                tableInstance.setPageSize(Number(event.target.value))
              }}
            />
          ),
        }}
      />
    </React.Fragment>
  )
}
