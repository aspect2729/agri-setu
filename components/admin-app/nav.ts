export type Page =
  | "dashboard"
  | "stores"
  | "transactions"
  | "cashflow"
  | "matching"
  | "orders"
  | "inventory"
  | "users"
  | "reports"
  | "simulated";

export interface NavContext {
  navigateTo: (page: Page, params?: Record<string, string>) => void;
  currentParams: Record<string, string>;
}
