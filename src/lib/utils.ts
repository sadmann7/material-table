
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

// For formatting the date column
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date)
}
