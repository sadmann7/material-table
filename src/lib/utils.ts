import { twMerge } from "tailwind-merge"

// For merging tailwind classes
export function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(inputs)
}

// For formatting the price column
export function formatPrice(
  price: number,
  currency: "USD" | "EUR" | "GBP" | "JPY" | "RUB" | "CNY" | "BDT" = "USD"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price)
}
