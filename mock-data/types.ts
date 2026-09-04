export type FarmerVerificationStatus = "verified" | "pending" | "unverified";
export type VerificationReviewStatus = "verified" | "pending" | "rejected";
export type ProductCategory = "vegetable" | "fruit" | "grain";
export type AvailabilityStatus = "available" | "limited" | "sold_out";
export type QualityGrade = "A" | "B" | "C";
export type BuyerType = "restaurant" | "retailer" | "wholesaler" | "individual";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_pickup"
  | "in_transit"
  | "delivered"
  | "cancelled";
export type ShipmentStatus = "pending" | "assigned" | "picked_up" | "in_transit" | "delivered";
export type PaymentStatus = "success" | "pending" | "failed";
export type PaymentMethod = "UPI" | "NEFT" | "IMPS" | "Cash on delivery";
export type PriceTrend = "up" | "down" | "stable";
export type NotificationType =
  | "new_order"
  | "order_confirmed"
  | "payment_success"
  | "payment_failed"
  | "shipment_assigned"
  | "shipment_picked_up"
  | "shipment_in_transit"
  | "delivery_completed"
  | "verification_update";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  location: string;
  village: string;
  district: string;
  state: string;
  crops: string[];
  farmSize: number;
  verificationStatus: FarmerVerificationStatus;
  rating: number;
  totalSales: number;
  joinedDate: string;
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  farmerId: string;
  cropName: string;
  category: ProductCategory;
  quantity: number;
  unit: "kg";
  pricePerUnit: number;
  minimumOrderQuantity: number;
  harvestDate: string;
  location: string;
  qualityGrade: QualityGrade;
  availabilityStatus: AvailabilityStatus;
}

export interface Buyer {
  id: string;
  name: string;
  type: BuyerType;
  location: string;
  contact: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  productId: string;
  status: OrderStatus;
  orderDate: string;
  quantity: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  expectedDeliveryDate: string;
  tripCode?: string;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  tripCode: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  assignedDriver: string | null;
  vehicleNumber: string | null;
  vehicleType: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  currentLocation: string;
  distance: number;
  pickupTime: string | null;
  deliveryTime: string | null;
  earnings: number;
  rate: number;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionDate: string;
  transactionReference: string;
}

export interface MarketPrice {
  crop: string;
  market: string;
  location: string;
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: "₹/quintal";
  trend: PriceTrend;
}

export interface MockDocument {
  name: string;
  status: "submitted" | "reviewed" | "rejected";
}

export interface FarmerVerification {
  verificationId: string;
  farmerId: string;
  status: VerificationReviewStatus;
  submittedDocuments: MockDocument[];
  submittedDate: string;
  reviewedDate: string | null;
  rejectionReason: string | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedEntityId: string;
}

export interface VehicleLocation {
  shipmentId: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  updatedAt: string;
  progress: number;
  simulated: true;
}

export interface MarketplaceAnalytics {
  totalFarmers: number;
  activeFarmers: number;
  totalBuyers: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingCrops: { crop: string; quantity: number; revenue: number }[];
  topFarmers: { farmerId: string; name: string; totalSales: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  orderStatusBreakdown: { status: OrderStatus; count: number }[];
  farmerEarnings: { farmerId: string; name: string; earnings: number }[];
  logisticsPerformance: {
    delivered: number;
    onTime: number;
    delayed: number;
    onTimePercent: number;
    delayedPercent: number;
    avgDistanceKm: number;
  };
}

export interface MockDataset {
  farmers: Farmer[];
  products: Product[];
  buyers: Buyer[];
  orders: Order[];
  shipments: Shipment[];
  payments: Payment[];
  marketPrices: MarketPrice[];
  verifications: FarmerVerification[];
  notifications: AppNotification[];
}

export type MockOk<T> = { ok: true; data: T; simulated: true };
export type MockErr = { ok: false; error: string; simulated: true };
export type MockResult<T> = MockOk<T> | MockErr;
