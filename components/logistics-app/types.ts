export type TripStatus =
  | "available"
  | "assigned"
  | "pickup-started"
  | "pickup-completed"
  | "in-transit"
  | "arrived"
  | "delivered"
  | "cancelled";

export interface Location {
  name: string;
  address: string;
}

export interface Cargo {
  crop: string;
  grade: string;
  quantity: number;
  crates: number;
  handling?: string;
  batchCode?: string | null;
}

export interface Trip {
  id: string;
  rawId: string;
  live: boolean;
  status: TripStatus;
  pickup: Location;
  destination: Location;
  cargo: Cargo;
  vehicle?: string;
  vehicleType?: string;
  driver?: string;
  pickupWindow: string;
  deliveryWindow: string;
  pickupTime: string;
  expectedDelivery?: string;
  distance: number;
  travelTime: string;
  earnings: number;
  rate: number;
  vehicleRequired: string;
  minCapacity: number;
  date: string;
  buyerContact?: string;
  storeContact?: string;
}

export interface TripHistoryItem {
  id: string;
  date: string;
  crop: string;
  quantity: string;
  route: string;
  pickup: string;
  destination: string;
  status: TripStatus;
  earnings: number;
}

export interface Vehicle {
  id: string;
  type: string;
  make: string;
  capacity: number;
  status: "on-trip" | "available";
  currentTrip: string | null;
  year: number;
  insurance: string;
  registration: string;
}

export interface LogisticsNotification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: "trip" | "update" | "delivery" | "payment";
  tripId?: string;
}

export interface RecentPayment {
  tripId: string;
  date: string;
  route: string;
  amount: number;
  status: "paid" | "pending";
}

export interface EarningsPoint {
  date: string;
  earnings: number;
}

export type Page =
  | "dashboard"
  | "available-trips"
  | "trip-details"
  | "active-delivery"
  | "delivery-completion"
  | "my-trips"
  | "earnings"
  | "trip-history"
  | "vehicles"
  | "profile"
  | "notifications";

export type NavigateFn = (page: Page, params?: { tripId?: string }) => void;

export interface EarningsSummary {
  total: number;
  thisMonth: number;
  pending: number;
  pendingTripId: string | null;
  completedCount: number;
  onTimePercent: number;
}

export interface LogisticsData {
  operatorName: string;
  operatorVillage: string | null;
  operatorPhone: string | null;
  partnerId: string;
  vehicle: string;
  driver: string;
  coverage: string;
  trips: Trip[];
  notifications: LogisticsNotification[];
  vehicles: Vehicle[];
  tripHistory: TripHistoryItem[];
  earningsChartData: EarningsPoint[];
  recentPayments: RecentPayment[];
  earningsSummary: EarningsSummary;
}
