import { type Skater } from "@prisma/client"

import { prisma } from "@/lib/db"
import { ServerControlledTable } from "@/components/server-controlled-table"

interface IndexPageProps {
  searchParams: {
    page?: string
    items?: string
    sort?: keyof Skater
    order?: "asc" | "desc"
    email?: string
    stance?: string
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, items, sort, order, email, stance } = searchParams

  // Number of skaters to show per page
  const limit = items ? parseInt(items) : 10
  // Number of skaters to skip
  const offset = page ? (parseInt(page) - 1) * limit : 1

  // Check if we need to filter skaters
  const needFiltering = email || stance

  // Get skaters and total skaters count in a single query
  const [skaters, totalSkaters] = await prisma.$transaction([
    prisma.skater.findMany({
      // For server-side pagination
      take: limit,
      skip: offset,
      // For server-side filtering
      where: needFiltering
        ? {
            AND: {
              email: email ? { contains: email } : undefined,
              stance: stance ? { equals: stance } : undefined,
            },
          }
        : undefined,
      // For server-side sorting
      orderBy: { [sort ?? "email"]: order ?? "asc" },
    }),
    prisma.skater.count(),
  ])

  return (
    <main className="container grid items-center px-6 py-5">
      <ServerControlledTable data={skaters} count={totalSkaters} />
    </main>
  )
}
