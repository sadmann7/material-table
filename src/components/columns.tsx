"use client"

import { MoreHorizontal } from "lucide-react"
import { type ColumnDef } from "unstyled-table"

import { type Skater } from "@/lib/get-data"
import { formatDate, formatPrice } from "@/lib/utils"

import { DropdownMenu } from "./dropdown-menu"

export const columns: ColumnDef<Skater, unknown>[] = [
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
]
