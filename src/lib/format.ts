import { type VariantProps } from "class-variance-authority";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning";

export function formatCurrency(
  amount: number,
  currencyCode: string | null = "USD"
): string {
  // Plaid returns positive for debits, negative for credits
  const absAmount = Math.abs(amount);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
  });
  // Invert for display: negative in Plaid = income = show as positive green
  const prefix = amount < 0 ? "+" : "";
  return `${prefix}${formatter.format(absAmount)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00"); // Ensure consistent parsing
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// Map Plaid categories to badge variants
const CATEGORY_VARIANT_MAP: Record<string, BadgeVariant> = {
  INCOME: "success",
  TRANSFER_IN: "success",
  TRANSFER_OUT: "outline",
  LOAN_PAYMENTS: "warning",
  BANK_FEES: "warning",
  ENTERTAINMENT: "secondary",
  FOOD_AND_DRINK: "default",
  GENERAL_MERCHANDISE: "default",
  HOME_IMPROVEMENT: "secondary",
  MEDICAL: "secondary",
  PERSONAL_CARE: "secondary",
  GENERAL_SERVICES: "secondary",
  GOVERNMENT_AND_NON_PROFIT: "outline",
  TRANSPORTATION: "default",
  TRAVEL: "secondary",
  RENT_AND_UTILITIES: "outline",
};

export function getCategoryVariant(category: string | null): BadgeVariant {
  if (!category) return "secondary";
  return CATEGORY_VARIANT_MAP[category] || "secondary";
}

export function formatCategory(category: string | null): string {
  if (!category) return "Uncategorized";
  // Convert SNAKE_CASE to Title Case
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
