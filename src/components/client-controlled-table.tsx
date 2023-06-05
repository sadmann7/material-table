"use client"

import * as React from "react"
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material"
import { ChevronDown } from "lucide-react"
import {
  Table as MaterialTable,
  type ColumnDef,
  type ColumnSort,
} from "unstyled-table"

import { deleteSkatersAction } from "@/app/_actions/skater"

import { ControlledCheckbox } from "./controlled-checkbox"
import { ControlledPopover } from "./controlled-popover"
import { DebounceInput } from "./debounce-input"

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

  // Defualt sorting state
  const [sorting] = React.useState<ColumnSort[]>([{ id: "email", desc: false }])

  return (
    <div className="w-full overflow-auto">
      <TableContainer component={Paper}>
        <MaterialTable
          columns={columns}
          // The inline `[]` prevents re-rendering the table when the data changes.
          data={data ?? []}
          // States controlled by the table
          state={{
            sorting,
          }}
          renders={{
            table: ({ children, tableInstance }) => {
              return (
                <div className="w-full p-1">
                  <DebounceInput
                    className="max-w-xs"
                    placeholder="Search all columns..."
                    value={tableInstance.getState().globalFilter as string}
                    onChange={(value) => {
                      tableInstance.setGlobalFilter(value)
                    }}
                  />
                  <div className="flex items-center gap-2 py-4">
                    <div className="flex w-full max-w-xs items-center gap-2">
                      <DebounceInput
                        className="max-w-xs"
                        placeholder="Filter emails..."
                        value={
                          (tableInstance
                            .getColumn("email")
                            ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(value) => {
                          tableInstance
                            .getColumn("email")
                            ?.setFilterValue(value)
                        }}
                      />
                      <FormControl fullWidth className="max-w-[100px]">
                        <InputLabel id="stance-select-label">Stance</InputLabel>
                        <Select
                          labelId="stance-select-label"
                          id="stance-select-id"
                          label="Stance"
                        >
                          <FormGroup>
                            <FormControlLabel
                              className="px-4"
                              control={
                                <Checkbox
                                  checked={
                                    tableInstance
                                      .getColumn("stance")
                                      ?.getFilterValue() === "mongo"
                                  }
                                  onChange={(e) => {
                                    tableInstance
                                      .getColumn("stance")
                                      ?.setFilterValue(
                                        e.target.value ? "mongo" : null
                                      )
                                  }}
                                />
                              }
                              label="Mongo"
                            />
                            <FormControlLabel
                              className="px-4"
                              control={
                                <Checkbox
                                  checked={
                                    tableInstance
                                      .getColumn("stance")
                                      ?.getFilterValue() === "mongo"
                                  }
                                  onChange={(e) => {
                                    tableInstance
                                      .getColumn("stance")
                                      ?.setFilterValue(
                                        e.target.value ? "mongo" : null
                                      )
                                  }}
                                />
                              }
                              label="Goofy"
                            />
                          </FormGroup>
                          {(tableInstance
                            .getColumn("stance")
                            ?.getFilterValue() as React.ReactNode) && (
                            <div>
                              <Divider />
                              <MenuItem
                                onClick={() => {
                                  tableInstance
                                    .getColumn("stance")
                                    ?.setFilterValue(null)
                                }}
                              >
                                Clear Filter
                              </MenuItem>
                            </div>
                          )}
                        </Select>
                      </FormControl>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <Button
                        variant="contained"
                        className="bg-red-500 normal-case text-white hover:bg-red-600"
                        onClick={() => {
                          startTransition(async () => {
                            // Delete the selected rows
                            try {
                              await deleteSkatersAction(
                                tableInstance
                                  .getSelectedRowModel()
                                  .rows.map(
                                    (row) => (row.original as { id: string }).id
                                  )
                              )
                            } catch (error) {
                              console.error(error)
                            }

                            // Reset row selection
                            tableInstance.resetRowSelection()
                          })
                        }}
                        disabled={
                          !tableInstance.getSelectedRowModel().rows.length ||
                          isPending
                        }
                      >
                        Delete
                      </Button>
                      <ControlledPopover
                        buttonChildren={
                          <>
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        }
                        menuContent={
                          <FormGroup>
                            {tableInstance
                              .getAllColumns()
                              .filter((column) => column.getCanHide())
                              .map((column) => {
                                return (
                                  <FormControlLabel
                                    key={column.id}
                                    className="px-4 capitalize"
                                    control={
                                      <ControlledCheckbox
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => {
                                          column.toggleVisibility(!!value)
                                        }}
                                      />
                                    }
                                    label={column.id}
                                  />
                                )
                              })}
                          </FormGroup>
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-md border">
                    <Table>{children}</Table>
                  </div>
                </div>
              )
            },
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
              <div className="flex flex-col-reverse items-center gap-4 py-4 md:flex-row">
                <div className="flex-1 text-sm font-medium">
                  {tableInstance.getFilteredSelectedRowModel().rows.length} of{" "}
                  {tableInstance.getRowModel().rows.length} row(s) selected.
                </div>
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
              </div>
            ),
          }}
        />
      </TableContainer>
    </div>
  )
}
