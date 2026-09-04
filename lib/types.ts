export type UserRole = "farmer" | "store" | "employee" | "buyer" | "logistics" | "admin";

export type SubmissionStatus = "submitted" | "received";

export type QualityGrade = "A" | "B" | "C";

export type DemandStatus = "open" | "matched" | "fulfilled";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "matched"
  | "pickup_scheduled"
  | "in_transit"
  | "delivered"
  | "completed";

export type DeliveryStatus =
  | "requested"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  village: string | null;
  role: UserRole;
  store_id: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface WhiteStore {
  id: string;
  name: string;
  village: string;
  address: string | null;
  operator_id: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface ProduceSubmission {
  id: string;
  farmer_id: string;
  store_id: string;
  crop: string;
  quantity_kg: number;
  expected_price: number | null;
  status: SubmissionStatus;
  actual_weight_kg: number | null;
  remaining_kg: number | null;
  quality_grade: QualityGrade | null;
  quality_notes: string | null;
  price_per_kg: number | null;
  paid_amount: number | null;
  paid_at: string | null;
  batch_code: string | null;
  received_by: string | null;
  created_at: string;
}

export interface Demand {
  id: string;
  buyer_id: string;
  crop: string;
  quantity_kg: number;
  offered_price: number | null;
  needed_by: string | null;
  location: string | null;
  status: DemandStatus;
  created_at: string;
}

export interface Order {
  id: string;
  demand_id: string | null;
  buyer_id: string | null;
  store_id: string;
  crop: string;
  quantity_kg: number;
  agreed_price: number;
  delivery_location: string | null;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  submission_id: string;
  quantity_kg: number;
  amount: number;
}

export interface Delivery {
  id: string;
  order_id: string;
  logistics_id: string | null;
  pickup_location: string;
  dropoff_location: string;
  status: DeliveryStatus;
  created_at: string;
}

export interface CashEntry {
  id: string;
  store_id: string;
  direction: "in" | "out";
  amount: number;
  description: string;
  created_by: string | null;
  created_at: string;
}

export interface CropDeclaration {
  id: string;
  farmer_id: string;
  crop: string;
  season: string;
  expected_quantity_kg: number | null;
  expected_harvest: string | null;
  notes: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: "Farmer",
  store: "Store Manager",
  employee: "Store Employee",
  buyer: "Bulk Buyer",
  logistics: "Logistics",
  admin: "Admin",
};

export const ROLE_HOME: Record<UserRole, string> = {
  farmer: "/farmer",
  store: "/store",
  employee: "/employee",
  buyer: "/buyer",
  logistics: "/logistics",
  admin: "/admin",
};
