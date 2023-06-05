"use client"

import { type Skater } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"
import { type ColumnDef } from "unstyled-table"

import { formatPrice } from "@/lib/utils"

import { ControlledCheckbox } from "./controlled-checkbox"
import { DropdownMenu } from "./dropdown-menu"

export const columns: ColumnDef<Skater, unknown>[] = [
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
    // Disable column visibility for this column
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
]
