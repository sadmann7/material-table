import { faker } from "@faker-js/faker";

export type Skater = {
  name: string;
  age: number;
  email: string;
  stats: number;
  stance: "mongo" | "goofy";
  deckPrice: number;
  createdAt?: Date;
};

const range = (len: number) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newSkater = (): Skater => {
  return {
    name: faker.person.firstName(),
    age: faker.number.int({ min: 10, max: 60 }),
    email: faker.internet.email(),
    stats: faker.number.int({ min: 10, max: 100 }),
    stance:
      faker.helpers.shuffle<Skater["stance"]>(["mongo", "goofy"])[0] ?? "goofy",
    deckPrice: faker.number.int({ min: 25, max: 100 }),
    createdAt: faker.date.past(),
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Skater[] => {
    const len = lens[depth] ?? 0;
    return range(len).map((_): Skater => {
      return {
        ...newSkater(),
      };
    });
  };

  return makeDataLevel();
}

export const data = makeData(100);

export async function getData(options: {
  limit: number;
  offset: number;
  sort?:
    | "name"
    | "age"
    | "email"
    | "stats"
    | "stance"
    | "deckPrice"
    | "createdAt";
  order?: "asc" | "desc";
  query?: string;
}) {
  // Simulate some network latency
  await new Promise((r) => setTimeout(r, 500));

  const { limit, offset, sort, order, query } = options;

  const filteredData = data.filter((row) => {
    if (query) {
      return row.name.includes(query);
    }
    return true;
  });

  const sortedData = filteredData.sort((a, b) => {
    if (sort) {
      if (order === "asc") {
        return a[sort]! > b[sort]! ? 1 : -1;
      } else {
        return a[sort]! < b[sort]! ? 1 : -1;
      }
    }
    return 0;
  });

  const paginatedData = sortedData.slice(offset, offset + limit);

  return {
    data: paginatedData,
    count: filteredData.length,
  };
}
