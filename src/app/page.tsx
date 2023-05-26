import { ServerControlledTable } from "@/components/server-controlled-table";
import { getData } from "@/lib/get-data";

export type Sort = "name" | "age" | "email" | "stats" | "stance" | "deckPrice";
export type Order = "asc" | "desc";

interface IndexPageProps {
  searchParams: {
    page?: string;
    items?: string;
    sort?: Sort;
    order?: Order;
    query?: string;
  };
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, items, sort, order, query } = searchParams;

  // Number of skaters to show per page
  const limit = items ? parseInt(items) : 10;
  // Number of skaters to skip
  const offset = page ? (parseInt(page) - 1) * limit : 1;

  // Get skaters and total skaters count in a single query
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dataQuery = await getData({
    limit: limit,
    offset: offset,
    sort: sort,
    order: order,
    query: query,
  });

  // Page count
  const pageCount = Math.ceil(dataQuery.count / limit);

  return (
    <main className="container grid items-center px-6 py-5">
      <ServerControlledTable data={dataQuery.data} pageCount={pageCount} />
    </main>
  );
}
