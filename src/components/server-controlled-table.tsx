"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  MenuItem,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material"
import { MoreHorizontal } from "lucide-react"
import {
  Table as MaterialTable,
  type ColumnDef,
  type ColumnSort,
  type VisibilityState,
} from "unstyled-table"

import { type Skater } from "@/lib/get-data"
import { formatDate, formatPrice } from "@/lib/utils"
import type { Order, Sort } from "@/app/page"

import { DebouncedInput } from "./debounced-input"
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
  const sort = (searchParams.get("sort") ?? "email") as Sort
  const order = searchParams.get("order") as Order | null
  const query = searchParams.get("query")

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

  // Handle row selection
  const [rowSelection, setRowSelection] = React.useState({})

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Skater, unknown>[]>(
    () => [
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
        accessorKey: "createdAt",
        header: "Created At",
        // Cell value formatting
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
        // Date column can not be filtered because dates are not unique
        enableColumnFilter: false,
        enableGlobalFilter: false,
      },
      {
        // Column for row actions
        id: "actions",
        cell: ({ row }) => {
          const skater = row.original

          return (
            <DropdownMenu
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

  // Handle column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  // Handle server-side column (email) filtering
  const [emailFilter, setEmailFilter] = React.useState(query ?? "")

  // Handle server-side column sorting
  const [sorting] = React.useState<ColumnSort[]>([
    {
      id: sort,
      desc: order === "desc" ? true : false,
    },
  ])

  return (
    <React.Fragment>
      <div className="mb-4 flex items-center justify-between">
        <DebouncedInput
          className="max-w-xs"
          label="Search emails..."
          variant="outlined"
          value={emailFilter}
          onChange={(value) => {
            setEmailFilter(value.toString())
            startTransition(() => {
              router.push(
                `${pathname}?${createQueryString({
                  page,
                  sort,
                  order,
                  query: value,
                })}`
              )
            })
          }}
        />
      </div>
      <TableContainer component={Paper}>
        <MaterialTable
          columns={columns}
          // The inline `[]` prevents re-rendering the table when the data changes.
          data={data ?? []}
          // Number of rows per page
          itemsCount={Number(items)}
          // The states controlled by the table
          state={{ columnVisibility, sorting }}
          // Handle column visibility
          setColumnVisibility={setColumnVisibility}
          // This lets us use controlled pagination
          manualPagination
          // This lets us use controlled filtering
          manualFiltering
          // Table renderers
          renders={{
            table: ({ children }) => (
              <Table aria-label="Server controlled table">{children}</Table>
            ),
            header: ({ children }) => <TableHead>{children}</TableHead>,
            headerRow: ({ children }) => <TableRow>{children}</TableRow>,
            headerCell: ({ children, header }) => (
              <TableCell
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
            body: ({ children }) => <TableBody>{children}</TableBody>,
            bodyRow: ({ children }) => <TableRow>{children}</TableRow>,
            bodyCell: ({ children }) => (
              <TableCell>{isPending ? <Skeleton /> : children}</TableCell>
            ),
            filterInput: () => null,
            paginationBar: () => (
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
                        query,
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
                        query,
                      })}`
                    )
                  })
                }}
              />
            ),
          }}
        />
      </TableContainer>
    </React.Fragment>
  )
}
