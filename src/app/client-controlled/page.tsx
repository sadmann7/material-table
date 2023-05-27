import { data } from "@/lib/get-data"
import { ClientControlledTable } from "@/components/client-controlled-table"
import { columns } from "@/components/columns"

export default function ClinetControlledPage() {
  return (
    <main className="container grid items-center py-5">
      <ClientControlledTable data={data} columns={columns} />
    </main>
  )
}
