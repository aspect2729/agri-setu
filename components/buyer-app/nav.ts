export type NavView =
  | "marketplace"
  | "produce-detail"
  | "post-demand"
  | "my-orders"
  | "order-tracking"
  | "qr-verify"
  | "clearance"
  | "account";

export interface AppNav {
  navigate: (view: NavView, id?: string) => void;
  currentView: NavView;
}
