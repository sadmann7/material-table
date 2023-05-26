"use client";

import type { Order, Sort } from "@/app/page";
import { type Skater } from "@/lib/get-data";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Pagination,
  PaletteSkeleton,
  Skeleton,
  TableContainer,
  Paper,
  TablePagination,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import {
  Table as MaterialTable,
  type ColumnDef,
  type ColumnSort,
  type VisibilityState,
} from "unstyled-table";

interface ServerControlledTableProps {
  data: Skater[];
  pageCount?: number;
}

export function ServerControlledTable({
  data,
  pageCount,
}: ServerControlledTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This lets us update states without blocking the UI
  // Read more: https://react.dev/reference/react/useTransition#usage
  const [isPending, startTransition] = React.useTransition();

  const page = searchParams.get("page") ?? "1";
  const items = searchParams.get("items") ?? "10";
  const sort = (searchParams.get("sort") ?? "email") as Sort;
  const order = searchParams.get("order") as Order | null;
  const query = searchParams.get("query");

  // create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Handle row selection
  const [rowSelection, setRowSelection] = React.useState({});

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
    ],
    []
  );

  // Handle column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Handle server-side column (email) filtering
  const [emailFilter, setEmailFilter] = React.useState(query ?? "");

  // Handle server-side column sorting
  const [sorting] = React.useState<ColumnSort[]>([
    {
      id: sort,
      desc: order === "desc" ? true : false,
    },
  ]);

  return (
    <React.Fragment>
      <Paper>
        <TableContainer>
          <MaterialTable
            columns={columns}
            // The inline `[]` prevents re-rendering the table when the data changes.
            data={data ?? []}
            // States controlled by the table
            state={{ columnVisibility, sorting }}
            // Handle global filtering
            // Handle column visibility
            setColumnVisibility={setColumnVisibility}
            // Handle server-side sorting
            manualPagination
            manualFiltering
            itemsCount={Number(items)}
            renders={{
              table: ({ children }) => <Table>{children}</Table>,
              header: ({ children }) => <TableHead>{children}</TableHead>,
              headerRow: ({ children }) => <TableRow>{children}</TableRow>,
              headerCell: ({ children, header }) => (
                <TableCell
                  onClick={() => {
                    const isSortable = header.column.getCanSort();
                    const nextSortDirection =
                      header.column.getNextSortingOrder();

                    // Update the URL with the new sort order if the column is sortable
                    isSortable &&
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: page,
                            sort: nextSortDirection ? header.column.id : null,
                            order: nextSortDirection ? nextSortDirection : null,
                          })}`
                        );
                      });
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
                  count={Number(pageCount)}
                  rowsPerPage={Number(items)}
                  page={Number(page) + 1}
                  onPageChange={(event, currentPage) => {
                    startTransition(() => {
                      router.push(
                        `${pathname}?${createQueryString({
                          page: currentPage + 1,
                          items,
                          sort,
                          order,
                          query,
                        })}`
                      );
                    });
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
                      );
                    });
                  }}
                />
              ),
            }}
          />
        </TableContainer>
      </Paper>
    </React.Fragment>
  );
}
