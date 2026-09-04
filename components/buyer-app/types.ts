export type Grade = "A" | "B" | "C";
export type Freshness = "Excellent" | "Good" | "Fair";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "dispatched"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export interface ScoreBreakdown {
  price: number;
  quality: number;
  quantity: number;
  location: number;
}

export interface ProduceListing {
  id: string;
  crop: string;
  grade: Grade;
  quantity: number;
  available: number;
  reserved: number;
  pricePerKg: number;
  bulkPrices?: { minQty: number; price: number }[];
  whiteStore: string;
  region: string;
  city: string;
  distance: number;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  image: string;
  collectedDaysAgo: number;
  availableFrom: string;
  farmersCount: number;
  batchId: string;
  freshness: Freshness;
  inspectionDate: string;
  category: string;
  qualityNotes: string | null;
}

export interface TrackingStep {
  step: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export interface BuyerOrder {
  id: string;
  rawId: string;
  produceId: string;
  crop: string;
  grade: Grade;
  quantity: number;
  pricePerKg: number;
  total: number;
  whiteStore: string;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  matchScore: number;
  batchId: string;
  deliveryLocation: string;
  trackingSteps: TrackingStep[];
  image: string;
}

export interface ClearanceDeal {
  id: string;
  produceId: string;
  crop: string;
  grade: Grade;
  quantity: number;
  originalPrice: number;
  clearancePrice: number;
  discount: number;
  whiteStore: string;
  region: string;
  distance: number;
  freshness: string;
  image: string;
  hoursRemaining: number;
  collectedDaysAgo: number;
}

export interface Requirement {
  id: string;
  crop: string;
  quantity: number;
  requiredBy: string;
  location: string;
  grade: Grade;
  maxPrice: number;
  status: "active" | "matched" | "expired";
  matchCount: number;
  createdAt: string;
}

export interface BuyerNotification {
  id: string;
  type: "order" | "match" | "deal" | "delivery";
  text: string;
  time: string;
  unread: boolean;
}

export interface BuyerData {
  buyerName: string;
  buyerVillage: string | null;
  buyerPhone: string | null;
  listings: ProduceListing[];
  orders: BuyerOrder[];
  deals: ClearanceDeal[];
  requirements: Requirement[];
  notifications: BuyerNotification[];
  crops: string[];
}
