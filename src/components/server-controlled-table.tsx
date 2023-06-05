"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import { type Skater } from "@prisma/client"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import {
  Table as MaterialTable,
  type ColumnDef,
  type ColumnSort,
} from "unstyled-table"

import { formatPrice } from "@/lib/utils"
import { deleteSkatersAction } from "@/app/_actions/skater"

import { ControlledCheckbox } from "./controlled-checkbox"
import { ControlledPopover } from "./controlled-popover"
import { DebounceInput } from "./debounce-input"
import { DropdownMenu } from "./dropdown-menu"

interface ServerControlledTableProps {
  data: Skater[]
  count?: number
}

export function ServerControlledTable({
  data,
  count,
}: ServerControlledTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // This lets us update states without blocking the UI
  // Read more: https://react.dev/reference/react/useTransition#usage
  const [isPending, startTransition] = React.useTransition()

  const page = searchParams.get("page") ?? "1"
  const items = searchParams.get("items") ?? "10"
  const sort = (searchParams.get("sort") ?? "email") as keyof Skater
  const order = searchParams.get("order")
  const email = searchParams.get("email")
  const stance = searchParams.get("stance")

  // create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Skater, unknown>[]>(
    () => [
      {
        // Column for row selection
        id: "select",
        header: ({ table }) => (
          <ControlledCheckbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <ControlledCheckbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
            }}
            aria-label="Select row"
          />
        ),
        // Disable column sorting for this column
        enableSorting: false,
        // Remove column from column visibility state
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "age",
        header: "Age",
        // Disable column filter for this column
        enableColumnFilter: false,
        // Disable sorting for this column
        enableSorting: false,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      { accessorKey: "stats", header: "Stats", enableColumnFilter: false },
      {
        accessorKey: "stance",
        header: "Stance",
        // Cell value formatting
        cell: ({ row }) => (
          <span className="capitalize">{row.getValue("stance")}</span>
        ),
      },
      {
        accessorKey: "deckPrice",
        // Column header formatting
        header: () => <span className="text-left">Deck Price</span>,
        // Cell value formatting
        cell: ({ row }) => formatPrice(row.getValue("deckPrice")),
      },
      {
        // Column for row actions
        id: "actions",
        // Remove column from column visibility state
        enableHiding: false,
        cell: ({ row }) => {
          const skater = row.original

          return (
            <DropdownMenu
              title="Actions"
              buttonChildren={<MoreHorizontal className="h-4 w-4" />}
              items={[
                {
                  label: "Copy skater ID",
                  onClick: () => {
                    void navigator.clipboard.writeText(skater.id)
                  },
                },
                {
                  label: "View skater",
                },
                {
                  label: "View deck details",
                },
              ]}
            />
          )
        },
      },
    ],
    []
  )

  // Handle server-side column (email) filtering
  const [emailFilter, setEmailFilter] = React.useState(email ?? "")

  // Handle server-side column sorting
  const [sorting] = React.useState<ColumnSort[]>([
    {
      id: sort,
      desc: order === "desc" ? true : false,
    },
  ])

  return (
    <div className="w-full overflow-auto">
      <TableContainer component={Paper}>
        <MaterialTable
          columns={columns}
          // The inline `[]` prevents re-rendering the table when the data changes.
          data={data ?? []}
          // Number of rows per page
          itemsCount={Number(items)}
          // The states controlled by the table
          state={{ sorting }}
          // Enable controlled states
          manualPagination
          // Table renderers
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
                        placeholder="Search emails..."
                        value={emailFilter}
                        onChange={(value) => {
                          setEmailFilter(String(value))
                          startTransition(() => {
                            router.push(
                              `${pathname}?${createQueryString({
                                page: 1,
                                email: String(value),
                              })}`
                            )
                          })
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
                                  checked={stance === "mongo"}
                                  onChange={(e) => {
                                    startTransition(() => {
                                      router.push(
                                        `${pathname}?${createQueryString({
                                          page: 1,
                                          stance: e.target.value
                                            ? "mongo"
                                            : "goofy",
                                        })}`
                                      )
                                    })
                                  }}
                                />
                              }
                              label="Mongo"
                            />
                            <FormControlLabel
                              className="px-4"
                              control={
                                <Checkbox
                                  checked={stance === "goofy"}
                                  onChange={(e) => {
                                    startTransition(() => {
                                      router.push(
                                        `${pathname}?${createQueryString({
                                          page: 1,
                                          stance: e.target.value
                                            ? "goofy"
                                            : "mongo",
                                        })}`
                                      )
                                    })
                                  }}
                                />
                              }
                              label="Goofy"
                            />
                          </FormGroup>
                          {stance && (
                            <div>
                              <Divider />
                              <MenuItem
                                onClick={() => {
                                  startTransition(() => {
                                    router.push(
                                      `${pathname}?${createQueryString({
                                        page: 1,
                                        stance: null,
                                      })}`
                                    )
                                  })
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
                                  .rows.map((row) => row.original.id)
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
                    <Table aria-label="Server controlled table">
                      {children}
                    </Table>
                  </div>
                </div>
              )
            },
            header: ({ children }) => <TableHead>{children}</TableHead>,
            headerRow: ({ children }) => <TableRow>{children}</TableRow>,
            headerCell: ({ children, header }) => (
              <TableCell
                className="whitespace-nowrap"
                // Handle server-side column sorting
                onClick={() => {
                  const isSortable = header.column.getCanSort()
                  const nextSortDirection = header.column.getNextSortingOrder()

                  // Update the URL with the new sort order if the column is sortable
                  isSortable &&
                    startTransition(() => {
                      router.push(
                        `${pathname}?${createQueryString({
                          page: page,
                          sort: nextSortDirection ? header.column.id : null,
                          order: nextSortDirection ? nextSortDirection : null,
                        })}`
                      )
                    })
                }}
              >
                {children}
              </TableCell>
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
              <TableCell>{isPending ? <Skeleton /> : children}</TableCell>
            ),
            filterInput: () => null,
            paginationBar: ({ tableInstance }) => (
              <div className="flex flex-col-reverse items-center gap-4 py-4 md:flex-row">
                <div className="flex-1 text-sm font-medium">
                  {tableInstance.getFilteredSelectedRowModel().rows.length} of{" "}
                  {items} row(s) selected.
                </div>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  // This is the total number of rows in the table, not the page count (which is `Math.ceil(count / items)`)
                  count={count ?? 0}
                  rowsPerPage={Number(items)}
                  // Subtract 1 from the page number because the table starts at page 0
                  page={Number(page) - 1}
                  onPageChange={(e, newPage) => {
                    startTransition(() => {
                      router.push(
                        `${pathname}?${createQueryString({
                          page: newPage + 1,
                          items,
                          sort,
                          order,
                          email,
                        })}`
                      )
                    })
                  }}
                  onRowsPerPageChange={(event) => {
                    startTransition(() => {
                      router.push(
                        `${pathname}?${createQueryString({
                          page,
                          items: event.target.value,
                          sort,
                          order,
                          email,
                        })}`
                      )
                    })
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
