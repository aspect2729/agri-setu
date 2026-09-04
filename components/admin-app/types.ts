export type StoreStatus = "Active" | "Inactive" | "Needs Attention";
export type OrderStatus = "Placed" | "Matched" | "Preparing" | "Fulfilled" | "Delivered" | "Paid";
export type TxType = "Purchase" | "Sale";
export type PaymentStatus = "Paid" | "Pending" | "Partial";
export type MatchStatus = "Matched" | "Partially Matched" | "Unmatched" | "Shortage" | "Surplus";
export type UserStatus = "Active" | "Inactive";
export type InvStatus = "Fresh" | "Aging" | "Critical";

export interface Store {
  id: string;
  name: string;
  location: string;
  village: string;
  cluster: string;
  manager: string;
  employees: number;
  farmersServed: number;
  todayPurchases: number;
  todaySales: number;
  todayVolume: number;
  inventory: number;
  orders: number;
  cashBalance: number;
  status: StoreStatus;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  storeId: string;
  totalProduce: number;
  lastCollection: string;
  totalPayments: number;
  status: UserStatus;
  crops: string[];
  joinDate: string;
}

export interface Buyer {
  id: string;
  name: string;
  company: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalPurchases: number;
  status: UserStatus;
  lastOrder: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  storeId: string;
  storeName: string;
  phone: string;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: TxType;
  storeId: string;
  storeName: string;
  farmerId?: string;
  farmerName?: string;
  buyerId?: string;
  buyerName?: string;
  crop: string;
  quantity: number;
  quality: string;
  pricePerKg: number;
  amount: number;
  paymentStatus: PaymentStatus;
  orderId?: string;
  qrId: string;
}

export interface Order {
  id: string;
  date: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  quantity: number;
  quality: string;
  value: number;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  matchedAt?: string;
  fulfilledAt?: string;
  deliveredAt?: string;
  paidAt?: string;
}

export interface CashEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  type: "In" | "Out";
  storeId: string;
  storeName: string;
  partyName: string;
  amount: number;
  balance: number;
  reference: string;
  isAnomaly?: boolean;
  anomalyNote?: string;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  storeName: string;
  crop: string;
  totalQty: number;
  available: number;
  reserved: number;
  quality: string;
  avgAge: number;
  freshness: number;
  status: InvStatus;
}

export interface SupplyItem {
  id: string;
  storeId: string;
  storeName: string;
  crop: string;
  available: number;
  quality: string;
  freshness: number;
  matchStatus: MatchStatus;
  matchedDemandId?: string;
}

export interface DemandItem {
  id: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  requested: number;
  quality: string;
  orderId: string;
  offeredPrice?: number;
  matchStatus: MatchStatus;
  matchedSupplyId?: string;
}

export interface AdminNotification {
  id: string;
  type: "Critical" | "Attention" | "Info";
  title: string;
  body: string;
  time: string;
  read: boolean;
  link: string;
  storeId?: string;
}

export interface AdminData {
  adminName: string;
  stores: Store[];
  farmers: Farmer[];
  buyers: Buyer[];
  employees: Employee[];
  transactions: Transaction[];
  orders: Order[];
  cashEntries: CashEntry[];
  inventory: InventoryItem[];
  supplyItems: SupplyItem[];
  demandItems: DemandItem[];
  notifications: AdminNotification[];
  supplyDemandChart: { date: string; supply: number; demand: number }[];
  cashFlowChart: { date: string; inflow: number; outflow: number }[];
  storeVolumeChart: { name: string; volume: number; revenue: number }[];
  topCrops: { crop: string; supply: number; demand: number; gap: number }[];
  storeKpiHistory: { date: string; sales: number; purchases: number }[];
}
