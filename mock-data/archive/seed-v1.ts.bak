import type {
  AppNotification,
  AvailabilityStatus,
  Buyer,
  BuyerType,
  Farmer,
  FarmerVerification,
  FarmerVerificationStatus,
  MarketPrice,
  MockDataset,
  MockDocument,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PriceTrend,
  Product,
  ProductCategory,
  QualityGrade,
  Shipment,
  ShipmentStatus,
  VerificationReviewStatus,
} from "./types";
import { addMinutes, daysBefore, mulberry32, pad, roundKm } from "./util";

const STATE = "Karnataka";

const PLACES = {
  anekal: { village: "Anekal", district: "Bengaluru Rural", lat: 12.7081, lng: 77.6955 },
  jigani: { village: "Jigani", district: "Bengaluru Rural", lat: 12.785, lng: 77.643 },
  attibele: { village: "Attibele", district: "Bengaluru Rural", lat: 12.7783, lng: 77.77 },
  hoskote: { village: "Hoskote", district: "Bengaluru Rural", lat: 13.0707, lng: 77.798 },
  doddaballapur: { village: "Doddaballapur", district: "Bengaluru Rural", lat: 13.292, lng: 77.539 },
  ramanagara: { village: "Ramanagara", district: "Ramanagara", lat: 12.715, lng: 77.281 },
  kanakapura: { village: "Kanakapura", district: "Ramanagara", lat: 12.546, lng: 77.421 },
  magadi: { village: "Magadi", district: "Ramanagara", lat: 12.957, lng: 77.223 },
  nelamangala: { village: "Nelamangala", district: "Bengaluru Rural", lat: 13.098, lng: 77.393 },
  tumakuru: { village: "Tumakuru", district: "Tumakuru", lat: 13.34, lng: 77.1 },
  mandya: { village: "Mandya", district: "Mandya", lat: 12.524, lng: 76.895 },
  kolar: { village: "Kolar", district: "Kolar", lat: 13.136, lng: 78.129 },
  chikkaballapur: { village: "Chikkaballapur", district: "Chikkaballapur", lat: 13.435, lng: 77.728 },
  mysuru: { village: "Mysuru", district: "Mysuru", lat: 12.295, lng: 76.639 },
} as const;

type PlaceKey = keyof typeof PLACES;

const DESTINATIONS = {
  ecity: { name: "FreshMart Distribution Center", location: "Electronic City Phase 1, Bengaluru", lat: 12.845, lng: 77.66 },
  krmarket: { name: "Bengaluru Wholesale Hub", location: "K.R. Market, Bengaluru", lat: 12.965, lng: 77.577 },
  bommanahalli: { name: "Retail Distribution Center", location: "Hosur Road, Bommanahalli, Bengaluru", lat: 12.899, lng: 77.623 },
  processors: { name: "South India Food Processors", location: "Bommanahalli Industrial Area, Bengaluru", lat: 12.891, lng: 77.628 },
  nagarjuna: { name: "Hotel Nagarjuna", location: "M.G. Road, Bengaluru", lat: 12.975, lng: 77.605 },
  greenleaf: { name: "GreenLeaf Retail Warehouse", location: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499 },
  hosur: { name: "Hosur Mandi Traders", location: "SIPCOT, Hosur, Tamil Nadu", lat: 12.74, lng: 77.825 },
  citykitchen: { name: "City Kitchen Co.", location: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408 },
  agrolink: { name: "AgroLink Exports Yard", location: "Peenya, Bengaluru", lat: 13.028, lng: 77.519 },
  neighborhood: { name: "Neighborhood Mart", location: "Jayanagar 4th Block, Bengaluru", lat: 12.925, lng: 77.5938 },
} as const;

type DestKey = keyof typeof DESTINATIONS;

const DRIVERS = [
  { name: "Ravi Kumar", vehicle: "KA-01-AB-1234", type: "Tata Ace / Covered Goods Vehicle" },
  { name: "Suresh Naik", vehicle: "KA-02-CD-5678", type: "Mahindra Bolero Pickup" },
  { name: "Imtiaz Ali", vehicle: "KA-05-EF-9012", type: "Tata 407 Covered" },
] as const;

type FarmerDraft = {
  id: string;
  name: string;
  phone: string;
  place: PlaceKey;
  crops: string[];
  farmSize: number;
  verificationStatus: FarmerVerificationStatus;
  rating: number;
  joinedDate: string;
};

const FARMER_DRAFTS: FarmerDraft[] = [
  { id: "frm-01", name: "Ramesh Kumar", phone: "9000000101", place: "anekal", crops: ["Tomato", "Onion"], farmSize: 2.4, verificationStatus: "verified", rating: 4.7, joinedDate: "2025-03-12" },
  { id: "frm-02", name: "Sita Devi", phone: "9000000102", place: "anekal", crops: ["Ragi", "Tomato"], farmSize: 1.8, verificationStatus: "verified", rating: 4.8, joinedDate: "2025-04-02" },
  { id: "frm-03", name: "Mahesh Patil", phone: "9000000103", place: "jigani", crops: ["Cabbage", "Potato"], farmSize: 3.1, verificationStatus: "verified", rating: 4.5, joinedDate: "2025-02-18" },
  { id: "frm-04", name: "Lakshmi Gowda", phone: "9000000104", place: "attibele", crops: ["Onion", "Chilli"], farmSize: 2.0, verificationStatus: "verified", rating: 4.6, joinedDate: "2025-05-09" },
  { id: "frm-05", name: "Anand Reddy", phone: "9000000105", place: "hoskote", crops: ["Mango", "Banana"], farmSize: 4.2, verificationStatus: "pending", rating: 4.2, joinedDate: "2026-06-14" },
  { id: "frm-06", name: "Kavitha N", phone: "9000000106", place: "doddaballapur", crops: ["Tomato", "Beans"], farmSize: 1.6, verificationStatus: "verified", rating: 4.9, joinedDate: "2025-01-22" },
  { id: "frm-07", name: "Prakash Hegde", phone: "9000000107", place: "ramanagara", crops: ["Coconut", "Arecanut"], farmSize: 5.0, verificationStatus: "verified", rating: 4.4, joinedDate: "2024-11-03" },
  { id: "frm-08", name: "Manjula S", phone: "9000000108", place: "kanakapura", crops: ["Ragi", "Maize"], farmSize: 2.8, verificationStatus: "pending", rating: 4.1, joinedDate: "2026-07-01" },
  { id: "frm-09", name: "Venkatesh Rao", phone: "9000000109", place: "magadi", crops: ["Potato", "Onion"], farmSize: 3.4, verificationStatus: "verified", rating: 4.6, joinedDate: "2025-08-19" },
  { id: "frm-10", name: "Fatima Bee", phone: "9000000110", place: "nelamangala", crops: ["Tomato", "Coriander"], farmSize: 1.2, verificationStatus: "verified", rating: 4.8, joinedDate: "2025-09-11" },
  { id: "frm-11", name: "Gopal Krishna", phone: "9000000111", place: "tumakuru", crops: ["Ragi", "Groundnut"], farmSize: 3.6, verificationStatus: "unverified", rating: 3.9, joinedDate: "2026-05-20" },
  { id: "frm-12", name: "Savitri Bai", phone: "9000000112", place: "mandya", crops: ["Banana", "Sugarcane"], farmSize: 4.8, verificationStatus: "verified", rating: 4.7, joinedDate: "2024-12-08" },
  { id: "frm-13", name: "Imran Pasha", phone: "9000000113", place: "kolar", crops: ["Tomato", "Potato"], farmSize: 2.2, verificationStatus: "pending", rating: 4.0, joinedDate: "2026-08-02" },
  { id: "frm-14", name: "Nagaraj M", phone: "9000000114", place: "chikkaballapur", crops: ["Grapes", "Tomato"], farmSize: 2.6, verificationStatus: "verified", rating: 4.5, joinedDate: "2025-06-27" },
  { id: "frm-15", name: "Poornima K", phone: "9000000115", place: "anekal", crops: ["Cabbage", "Cauliflower"], farmSize: 1.9, verificationStatus: "verified", rating: 4.6, joinedDate: "2025-10-15" },
  { id: "frm-16", name: "Basavaraj", phone: "9000000116", place: "mysuru", crops: ["Banana", "Coconut"], farmSize: 3.9, verificationStatus: "verified", rating: 4.3, joinedDate: "2025-03-30" },
  { id: "frm-17", name: "Yusuf Khan", phone: "9000000117", place: "attibele", crops: ["Chilli", "Onion"], farmSize: 2.1, verificationStatus: "pending", rating: 4.2, joinedDate: "2026-07-18" },
  { id: "frm-18", name: "Meenakshi", phone: "9000000118", place: "jigani", crops: ["Beans", "Tomato"], farmSize: 1.5, verificationStatus: "verified", rating: 4.8, joinedDate: "2025-11-04" },
];

type ProductDraft = {
  id: string;
  farmerId: string;
  cropName: string;
  category: ProductCategory;
  quantity: number;
  pricePerUnit: number;
  minimumOrderQuantity: number;
  harvestDaysAgo: number;
  qualityGrade: QualityGrade;
  availabilityStatus: AvailabilityStatus;
};

const PRODUCT_DRAFTS: ProductDraft[] = [
  { id: "prd-01", farmerId: "frm-01", cropName: "Tomato", category: "vegetable", quantity: 5200, pricePerUnit: 22, minimumOrderQuantity: 200, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-02", farmerId: "frm-01", cropName: "Onion", category: "vegetable", quantity: 3800, pricePerUnit: 18, minimumOrderQuantity: 250, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-03", farmerId: "frm-02", cropName: "Ragi", category: "grain", quantity: 2400, pricePerUnit: 42, minimumOrderQuantity: 100, harvestDaysAgo: 8, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-04", farmerId: "frm-02", cropName: "Tomato", category: "vegetable", quantity: 1600, pricePerUnit: 20, minimumOrderQuantity: 100, harvestDaysAgo: 1, qualityGrade: "B", availabilityStatus: "limited" },
  { id: "prd-05", farmerId: "frm-03", cropName: "Cabbage", category: "vegetable", quantity: 3500, pricePerUnit: 14, minimumOrderQuantity: 200, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-06", farmerId: "frm-03", cropName: "Potato", category: "vegetable", quantity: 4100, pricePerUnit: 16, minimumOrderQuantity: 250, harvestDaysAgo: 4, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-07", farmerId: "frm-04", cropName: "Onion", category: "vegetable", quantity: 3000, pricePerUnit: 19, minimumOrderQuantity: 200, harvestDaysAgo: 3, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-08", farmerId: "frm-04", cropName: "Chilli", category: "vegetable", quantity: 900, pricePerUnit: 78, minimumOrderQuantity: 50, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-09", farmerId: "frm-05", cropName: "Mango", category: "fruit", quantity: 1800, pricePerUnit: 55, minimumOrderQuantity: 80, harvestDaysAgo: 3, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-10", farmerId: "frm-05", cropName: "Banana", category: "fruit", quantity: 2200, pricePerUnit: 34, minimumOrderQuantity: 100, harvestDaysAgo: 1, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-11", farmerId: "frm-06", cropName: "Tomato", category: "vegetable", quantity: 4500, pricePerUnit: 23, minimumOrderQuantity: 200, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-12", farmerId: "frm-06", cropName: "Beans", category: "vegetable", quantity: 1100, pricePerUnit: 42, minimumOrderQuantity: 60, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-13", farmerId: "frm-07", cropName: "Coconut", category: "fruit", quantity: 2600, pricePerUnit: 28, minimumOrderQuantity: 100, harvestDaysAgo: 5, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-14", farmerId: "frm-07", cropName: "Arecanut", category: "grain", quantity: 700, pricePerUnit: 340, minimumOrderQuantity: 40, harvestDaysAgo: 10, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-15", farmerId: "frm-08", cropName: "Ragi", category: "grain", quantity: 3100, pricePerUnit: 40, minimumOrderQuantity: 150, harvestDaysAgo: 12, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-16", farmerId: "frm-08", cropName: "Maize", category: "grain", quantity: 2800, pricePerUnit: 22, minimumOrderQuantity: 200, harvestDaysAgo: 9, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-17", farmerId: "frm-09", cropName: "Potato", category: "vegetable", quantity: 3600, pricePerUnit: 15, minimumOrderQuantity: 200, harvestDaysAgo: 3, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-18", farmerId: "frm-09", cropName: "Onion", category: "vegetable", quantity: 2700, pricePerUnit: 17, minimumOrderQuantity: 200, harvestDaysAgo: 4, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-19", farmerId: "frm-10", cropName: "Tomato", category: "vegetable", quantity: 1900, pricePerUnit: 24, minimumOrderQuantity: 80, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-20", farmerId: "frm-10", cropName: "Coriander", category: "vegetable", quantity: 420, pricePerUnit: 88, minimumOrderQuantity: 20, harvestDaysAgo: 0, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-21", farmerId: "frm-11", cropName: "Ragi", category: "grain", quantity: 2000, pricePerUnit: 38, minimumOrderQuantity: 100, harvestDaysAgo: 14, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-22", farmerId: "frm-11", cropName: "Groundnut", category: "grain", quantity: 1500, pricePerUnit: 72, minimumOrderQuantity: 80, harvestDaysAgo: 11, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-23", farmerId: "frm-12", cropName: "Banana", category: "fruit", quantity: 3300, pricePerUnit: 32, minimumOrderQuantity: 150, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-24", farmerId: "frm-12", cropName: "Sugarcane", category: "grain", quantity: 8000, pricePerUnit: 4, minimumOrderQuantity: 500, harvestDaysAgo: 6, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-25", farmerId: "frm-13", cropName: "Tomato", category: "vegetable", quantity: 2100, pricePerUnit: 21, minimumOrderQuantity: 100, harvestDaysAgo: 2, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-26", farmerId: "frm-13", cropName: "Potato", category: "vegetable", quantity: 1800, pricePerUnit: 16, minimumOrderQuantity: 150, harvestDaysAgo: 5, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-27", farmerId: "frm-14", cropName: "Grapes", category: "fruit", quantity: 1400, pricePerUnit: 62, minimumOrderQuantity: 60, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-28", farmerId: "frm-14", cropName: "Tomato", category: "vegetable", quantity: 2600, pricePerUnit: 22, minimumOrderQuantity: 150, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-29", farmerId: "frm-15", cropName: "Cabbage", category: "vegetable", quantity: 2800, pricePerUnit: 13, minimumOrderQuantity: 200, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-30", farmerId: "frm-15", cropName: "Cauliflower", category: "vegetable", quantity: 1600, pricePerUnit: 26, minimumOrderQuantity: 80, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-31", farmerId: "frm-16", cropName: "Banana", category: "fruit", quantity: 2900, pricePerUnit: 33, minimumOrderQuantity: 120, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-32", farmerId: "frm-18", cropName: "Beans", category: "vegetable", quantity: 980, pricePerUnit: 44, minimumOrderQuantity: 50, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "limited" },
];

type BuyerDraft = {
  id: string;
  name: string;
  type: BuyerType;
  dest: DestKey;
  contact: string;
  rating: number;
};

const BUYER_DRAFTS: BuyerDraft[] = [
  { id: "byr-01", name: "FreshMart Wholesale", type: "wholesaler", dest: "ecity", contact: "9000000201", rating: 4.6 },
  { id: "byr-02", name: "Bengaluru Wholesale Hub", type: "wholesaler", dest: "krmarket", contact: "9000000202", rating: 4.4 },
  { id: "byr-03", name: "South India Food Processors", type: "retailer", dest: "processors", contact: "9000000203", rating: 4.5 },
  { id: "byr-04", name: "Hotel Nagarjuna", type: "restaurant", dest: "nagarjuna", contact: "9000000204", rating: 4.7 },
  { id: "byr-05", name: "GreenLeaf Retail", type: "retailer", dest: "greenleaf", contact: "9000000205", rating: 4.3 },
  { id: "byr-06", name: "Hosur Mandi Traders", type: "wholesaler", dest: "hosur", contact: "9000000206", rating: 4.2 },
  { id: "byr-07", name: "City Kitchen Co.", type: "restaurant", dest: "citykitchen", contact: "9000000207", rating: 4.8 },
  { id: "byr-08", name: "AgroLink Exports", type: "wholesaler", dest: "agrolink", contact: "9000000208", rating: 4.1 },
  { id: "byr-09", name: "Neighborhood Mart", type: "individual", dest: "neighborhood", contact: "9000000209", rating: 4.5 },
  { id: "byr-10", name: "Retail Distribution Center", type: "retailer", dest: "bommanahalli", contact: "9000000210", rating: 4.4 },
];

type OrderSpec = {
  id: string;
  buyerId: string;
  productId: string;
  quantity: number;
  status: OrderStatus;
  daysAgo: number;
  hour: number;
  expectedInDays: number;
  tripCode?: string;
  driverIndex?: number;
  payment?: PaymentStatus;
  method?: PaymentMethod;
};

const ORDER_SPECS: OrderSpec[] = [
  { id: "ord-01", buyerId: "byr-02", productId: "prd-02", quantity: 3000, status: "pending", daysAgo: 0, hour: 8, expectedInDays: 1, tripCode: "AS-TRP-1051", payment: "pending", method: "UPI" },
  { id: "ord-02", buyerId: "byr-01", productId: "prd-11", quantity: 4500, status: "pending", daysAgo: 0, hour: 9, expectedInDays: 1, tripCode: "AS-TRP-1052", payment: "pending", method: "NEFT" },
  { id: "ord-03", buyerId: "byr-10", productId: "prd-06", quantity: 2000, status: "confirmed", daysAgo: 0, hour: 7, expectedInDays: 1, tripCode: "AS-TRP-1053", payment: "pending", method: "UPI" },
  { id: "ord-04", buyerId: "byr-01", productId: "prd-01", quantity: 5000, status: "in_transit", daysAgo: 0, hour: 6, expectedInDays: 0, tripCode: "AS-TRP-1048", driverIndex: 0, payment: "pending", method: "UPI" },
  { id: "ord-05", buyerId: "byr-02", productId: "prd-07", quantity: 3000, status: "delivered", daysAgo: 3, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1047", driverIndex: 0, payment: "success", method: "IMPS" },
  { id: "ord-06", buyerId: "byr-01", productId: "prd-04", quantity: 1500, status: "delivered", daysAgo: 5, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1046", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-07", buyerId: "byr-10", productId: "prd-17", quantity: 2000, status: "delivered", daysAgo: 6, hour: 10, expectedInDays: 0, tripCode: "AS-TRP-1045", driverIndex: 1, payment: "success", method: "NEFT" },
  { id: "ord-08", buyerId: "byr-03", productId: "prd-05", quantity: 3500, status: "delivered", daysAgo: 7, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1044", driverIndex: 0, payment: "success", method: "UPI" },
  { id: "ord-09", buyerId: "byr-02", productId: "prd-18", quantity: 2500, status: "delivered", daysAgo: 8, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1043", driverIndex: 2, payment: "success", method: "IMPS" },
  { id: "ord-10", buyerId: "byr-01", productId: "prd-25", quantity: 1800, status: "cancelled", daysAgo: 9, hour: 11, expectedInDays: 1, tripCode: "AS-TRP-1042", payment: "failed", method: "UPI" },
  { id: "ord-11", buyerId: "byr-10", productId: "prd-26", quantity: 1600, status: "delivered", daysAgo: 10, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1041", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-12", buyerId: "byr-03", productId: "prd-29", quantity: 2600, status: "delivered", daysAgo: 11, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1040", driverIndex: 0, payment: "success", method: "NEFT" },
  { id: "ord-13", buyerId: "byr-02", productId: "prd-02", quantity: 2800, status: "delivered", daysAgo: 13, hour: 7, expectedInDays: 0, tripCode: "AS-TRP-1039", driverIndex: 2, payment: "success", method: "UPI" },
  { id: "ord-14", buyerId: "byr-01", productId: "prd-11", quantity: 3200, status: "delivered", daysAgo: 15, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1038", driverIndex: 0, payment: "success", method: "IMPS" },
  { id: "ord-15", buyerId: "byr-04", productId: "prd-19", quantity: 400, status: "delivered", daysAgo: 2, hour: 12, expectedInDays: 0, tripCode: "AS-TRP-1049", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-16", buyerId: "byr-07", productId: "prd-32", quantity: 220, status: "in_transit", daysAgo: 0, hour: 7, expectedInDays: 0, tripCode: "AS-TRP-1050", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-17", buyerId: "byr-05", productId: "prd-12", quantity: 600, status: "ready_for_pickup", daysAgo: 1, hour: 16, expectedInDays: 1, tripCode: "AS-TRP-1054", driverIndex: 2, payment: "pending", method: "NEFT" },
  { id: "ord-18", buyerId: "byr-06", productId: "prd-08", quantity: 350, status: "processing", daysAgo: 1, hour: 11, expectedInDays: 2, tripCode: "AS-TRP-1055", payment: "pending", method: "UPI" },
  { id: "ord-19", buyerId: "byr-08", productId: "prd-03", quantity: 1200, status: "ready_for_pickup", daysAgo: 1, hour: 9, expectedInDays: 1, tripCode: "AS-TRP-1056", driverIndex: 2, payment: "success", method: "NEFT" },
  { id: "ord-20", buyerId: "byr-03", productId: "prd-30", quantity: 900, status: "delivered", daysAgo: 4, hour: 10, expectedInDays: 0, tripCode: "AS-TRP-1060", driverIndex: 2, payment: "success", method: "UPI" },
  { id: "ord-21", buyerId: "byr-09", productId: "prd-20", quantity: 40, status: "delivered", daysAgo: 1, hour: 14, expectedInDays: 0, tripCode: "AS-TRP-1057", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-22", buyerId: "byr-05", productId: "prd-09", quantity: 500, status: "confirmed", daysAgo: 2, hour: 15, expectedInDays: 3, payment: "pending", method: "IMPS" },
  { id: "ord-23", buyerId: "byr-08", productId: "prd-14", quantity: 80, status: "processing", daysAgo: 3, hour: 10, expectedInDays: 4, tripCode: "AS-TRP-1058", payment: "pending", method: "NEFT" },
  { id: "ord-24", buyerId: "byr-04", productId: "prd-27", quantity: 180, status: "cancelled", daysAgo: 12, hour: 13, expectedInDays: 2, payment: "failed", method: "UPI" },
  { id: "ord-25", buyerId: "byr-02", productId: "prd-23", quantity: 1400, status: "delivered", daysAgo: 16, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1037", driverIndex: 0, payment: "success", method: "NEFT" },
  { id: "ord-26", buyerId: "byr-06", productId: "prd-16", quantity: 2000, status: "in_transit", daysAgo: 1, hour: 6, expectedInDays: 0, tripCode: "AS-TRP-1059", driverIndex: 2, payment: "success", method: "UPI" },
];

const MARKETS = [
  { market: "Anekal APMC", location: "Anekal, Bengaluru Rural" },
  { market: "K.R. Market", location: "K.R. Market, Bengaluru" },
  { market: "Ramanagara APMC", location: "Ramanagara" },
  { market: "Tumakuru APMC", location: "Tumakuru" },
  { market: "Mandya APMC", location: "Mandya" },
  { market: "Kolar APMC", location: "Kolar" },
] as const;

const CROP_BASE: Record<string, number> = {
  Tomato: 2200,
  Onion: 1800,
  Potato: 1500,
  Cabbage: 1100,
  Ragi: 4200,
  Banana: 2800,
  Chilli: 7800,
  Beans: 4100,
};

function loc(place: PlaceKey) {
  const p = PLACES[place];
  return `${p.village}, ${p.district}, ${STATE}`;
}

function shipmentStatusFor(order: OrderStatus, hasDriver: boolean, hasTripCode: boolean): ShipmentStatus | null {
  if (order === "cancelled") return null;
  if (!hasTripCode) return null;
  if (order === "pending" || order === "confirmed") return "pending";
  if (order === "processing") return "pending";
  if (order === "ready_for_pickup") return hasDriver ? "assigned" : "pending";
  if (order === "in_transit") return "in_transit";
  if (order === "delivered") return "delivered";
  return null;
}

function buildFarmers(): Farmer[] {
  return FARMER_DRAFTS.map((d) => {
    const p = PLACES[d.place];
    return {
      id: d.id,
      name: d.name,
      phone: d.phone,
      village: p.village,
      district: p.district,
      state: STATE,
      location: loc(d.place),
      crops: d.crops,
      farmSize: d.farmSize,
      verificationStatus: d.verificationStatus,
      rating: d.rating,
      totalSales: 0,
      joinedDate: d.joinedDate,
      lat: p.lat,
      lng: p.lng,
    };
  });
}

function buildProducts(farmers: Farmer[]): Product[] {
  return PRODUCT_DRAFTS.map((d) => {
    const farmer = farmers.find((f) => f.id === d.farmerId);
    if (!farmer) throw new Error(`Product ${d.id} references missing farmer ${d.farmerId}`);
    return {
      id: d.id,
      farmerId: d.farmerId,
      cropName: d.cropName,
      category: d.category,
      quantity: d.quantity,
      unit: "kg",
      pricePerUnit: d.pricePerUnit,
      minimumOrderQuantity: d.minimumOrderQuantity,
      harvestDate: daysBefore(d.harvestDaysAgo, 6).slice(0, 10),
      location: farmer.location,
      qualityGrade: d.qualityGrade,
      availabilityStatus: d.availabilityStatus,
    };
  });
}

function buildBuyers(): Buyer[] {
  return BUYER_DRAFTS.map((d) => {
    const dest = DESTINATIONS[d.dest];
    return {
      id: d.id,
      name: d.name,
      type: d.type,
      location: dest.location,
      contact: d.contact,
      totalOrders: 0,
      totalSpent: 0,
      rating: d.rating,
      lat: dest.lat,
      lng: dest.lng,
    };
  });
}

function buildOrders(farmers: Farmer[], buyers: Buyer[], products: Product[]) {
  const orders: Order[] = [];
  const shipments: Shipment[] = [];
  const payments: Payment[] = [];

  for (const spec of ORDER_SPECS) {
    const product = products.find((p) => p.id === spec.productId);
    if (!product) throw new Error(`Order ${spec.id} references missing product ${spec.productId}`);
    const farmer = farmers.find((f) => f.id === product.farmerId);
    const buyer = buyers.find((b) => b.id === spec.buyerId);
    if (!farmer || !buyer) throw new Error(`Order ${spec.id} is missing farmer or buyer`);

    const orderDate = daysBefore(spec.daysAgo, spec.hour);
    const subtotal = spec.quantity * product.pricePerUnit;
    const distance = roundKm(farmer, buyer);
    const rate = 50 + (distance % 25);
    const deliveryFee = Math.max(180, distance * rate);
    const totalAmount = subtotal + deliveryFee;
    const expected = new Date(orderDate);
    expected.setDate(expected.getDate() + spec.expectedInDays);

    const order: Order = {
      id: spec.id,
      buyerId: buyer.id,
      farmerId: farmer.id,
      productId: product.id,
      status: spec.status,
      orderDate,
      quantity: spec.quantity,
      subtotal,
      deliveryFee,
      totalAmount,
      expectedDeliveryDate: expected.toISOString().slice(0, 10),
      tripCode: spec.tripCode,
    };
    orders.push(order);

    const payStatus = spec.payment ?? "pending";
    const payDate =
      payStatus === "pending" ? addMinutes(orderDate, 40) : addMinutes(orderDate, 95);
    payments.push({
      paymentId: spec.id.replace("ord", "pay"),
      orderId: order.id,
      amount: totalAmount,
      method: spec.method ?? "UPI",
      status: payStatus,
      transactionDate: payDate,
      transactionReference: `UPI${spec.id.slice(-2)}${pad(spec.daysAgo + 11, 4)}X`,
    });

    const driver = spec.driverIndex != null ? DRIVERS[spec.driverIndex] : null;
    const shipStatus = shipmentStatusFor(spec.status, Boolean(driver), Boolean(spec.tripCode));
    if (!shipStatus || !spec.tripCode) continue;

    const pickupTime =
      shipStatus === "pending" ? null : addMinutes(orderDate, shipStatus === "assigned" ? 90 : 120);
    const deliveryTime = shipStatus === "delivered" ? addMinutes(orderDate, 280) : null;
    const estimatedDelivery = addMinutes(orderDate, 260);
    const progressLabel =
      shipStatus === "in_transit"
        ? `En route · ${Math.round(distance * 0.45)} km done`
        : shipStatus === "delivered"
          ? buyer.location
          : farmer.location;

    shipments.push({
      shipmentId: spec.id.replace("ord", "shp"),
      orderId: order.id,
      tripCode: spec.tripCode,
      pickupLocation: `White Store — ${farmer.village}`,
      deliveryLocation: `${buyer.name} · ${buyer.location}`,
      pickupLat: farmer.lat,
      pickupLng: farmer.lng,
      deliveryLat: buyer.lat,
      deliveryLng: buyer.lng,
      assignedDriver: driver?.name ?? null,
      vehicleNumber: driver?.vehicle ?? null,
      vehicleType: driver?.type ?? "Covered Goods Vehicle",
      status: shipStatus,
      estimatedDelivery,
      currentLocation: progressLabel,
      distance,
      pickupTime,
      deliveryTime,
      earnings: deliveryFee,
      rate,
    });
  }

  return { orders, shipments, payments };
}

function buildVerifications(farmers: Farmer[]): FarmerVerification[] {
  return farmers.map((farmer) => {
    const review: VerificationReviewStatus =
      farmer.verificationStatus === "verified"
        ? "verified"
        : farmer.verificationStatus === "unverified"
          ? "rejected"
          : "pending";
    const docs: MockDocument[] =
      review === "pending"
        ? [
            { name: "Land Record.pdf — submitted", status: "submitted" },
            { name: "Soil Health Card.pdf — submitted", status: "submitted" },
          ]
        : review === "rejected"
          ? [
              { name: "Land Record.pdf — unreadable photo", status: "rejected" },
              { name: "Bank passbook (masked).pdf — submitted", status: "submitted" },
            ]
          : [
              { name: "Land Record.pdf — reviewed", status: "reviewed" },
              { name: "Soil Health Card.pdf — reviewed", status: "reviewed" },
              { name: "Bank passbook (masked).pdf — reviewed", status: "reviewed" },
            ];
    return {
      verificationId: farmer.id.replace("frm", "ver"),
      farmerId: farmer.id,
      status: review,
      submittedDocuments: docs,
      submittedDate: farmer.joinedDate,
      reviewedDate: review === "pending" ? null : addMinutes(`${farmer.joinedDate}T09:00:00+05:30`, 48 * 60),
      rejectionReason:
        review === "rejected"
          ? "Land record photo was unreadable. Please re-upload a clear scan of the RTC / pahani. Do not send government ID numbers."
          : null,
    };
  });
}

function buildNotifications(
  orders: Order[],
  payments: Payment[],
  shipments: Shipment[],
  verifications: FarmerVerification[],
  farmers: Farmer[],
  buyers: Buyer[],
  products: Product[],
): AppNotification[] {
  const notes: AppNotification[] = [];
  let n = 1;
  const push = (
    userId: string,
    type: AppNotification["type"],
    title: string,
    message: string,
    timestamp: string,
    relatedEntityId: string,
  ) => {
    notes.push({
      id: `ntf-${pad(n++, 3)}`,
      userId,
      type,
      title,
      message,
      timestamp,
      read: new Date(timestamp) < new Date(daysBefore(2, 0)),
      relatedEntityId,
    });
  };

  for (const order of orders) {
    const farmer = farmers.find((f) => f.id === order.farmerId)!;
    const buyer = buyers.find((b) => b.id === order.buyerId)!;
    const product = products.find((p) => p.id === order.productId)!;
    push(
      buyer.id,
      "new_order",
      "New order placed",
      `${buyer.name} ordered ${order.quantity.toLocaleString("en-IN")} kg ${product.cropName} from ${farmer.name}.`,
      order.orderDate,
      order.id,
    );
    if (order.status !== "pending" && order.status !== "cancelled") {
      push(
        farmer.id,
        "order_confirmed",
        "Order confirmed",
        `Order ${order.id} for ${product.cropName} is confirmed.`,
        addMinutes(order.orderDate, 40),
        order.id,
      );
    }
    const payment = payments.find((p) => p.orderId === order.id)!;
    if (payment.status === "success") {
      push(
        farmer.id,
        "payment_success",
        "Payment received",
        `₹${payment.amount.toLocaleString("en-IN")} settled for order ${order.id}.`,
        payment.transactionDate,
        payment.paymentId,
      );
    }
    if (payment.status === "failed") {
      push(
        buyer.id,
        "payment_failed",
        "Payment failed",
        `Payment for order ${order.id} did not go through. No live gateway was charged.`,
        payment.transactionDate,
        payment.paymentId,
      );
    }
    const shipment = shipments.find((s) => s.orderId === order.id);
    if (!shipment) continue;
    if (shipment.status !== "pending") {
      push(
        buyer.id,
        "shipment_assigned",
        "Shipment assigned",
        `${shipment.assignedDriver ?? "A logistics partner"} assigned to ${shipment.tripCode}.`,
        addMinutes(order.orderDate, 80),
        shipment.shipmentId,
      );
    }
    if (shipment.status === "picked_up" || shipment.status === "in_transit" || shipment.status === "delivered") {
      push(
        buyer.id,
        "shipment_picked_up",
        "Cargo picked up",
        `${product.cropName} picked up at ${shipment.pickupLocation}.`,
        shipment.pickupTime ?? addMinutes(order.orderDate, 120),
        shipment.shipmentId,
      );
    }
    if (shipment.status === "in_transit" || shipment.status === "delivered") {
      push(
        buyer.id,
        "shipment_in_transit",
        "Shipment in transit",
        `${shipment.tripCode} is moving toward ${buyer.location}.`,
        addMinutes(shipment.pickupTime ?? order.orderDate, 25),
        shipment.shipmentId,
      );
    }
    if (shipment.status === "delivered" && shipment.deliveryTime) {
      push(
        farmer.id,
        "delivery_completed",
        "Delivery completed",
        `${order.quantity.toLocaleString("en-IN")} kg ${product.cropName} delivered to ${buyer.name}.`,
        shipment.deliveryTime,
        shipment.shipmentId,
      );
    }
  }

  for (const v of verifications) {
    if (!v.reviewedDate) continue;
    const farmer = farmers.find((f) => f.id === v.farmerId)!;
    push(
      farmer.id,
      "verification_update",
      v.status === "verified" ? "Farmer verified" : "Verification needs attention",
      v.status === "verified"
        ? `${farmer.name} is verified on Agri Setu.`
        : `${farmer.name}: ${v.rejectionReason}`,
      v.reviewedDate,
      v.verificationId,
    );
  }

  return notes.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

function buildMarketPrices(): MarketPrice[] {
  const rng = mulberry32(20260904);
  const rows: MarketPrice[] = [];
  for (const crop of Object.keys(CROP_BASE)) {
    for (const market of MARKETS) {
      let prev = CROP_BASE[crop];
      for (let day = 20; day >= 0; day--) {
        const date = daysBefore(day, 18).slice(0, 10);
        const trendWave = Math.sin(day / 5.5) * (CROP_BASE[crop] * 0.04);
        const noise = (rng() - 0.5) * (CROP_BASE[crop] * 0.03);
        const modalPrice = Math.max(200, Math.round(CROP_BASE[crop] + trendWave + noise));
        const minPrice = Math.round(modalPrice - 70 - rng() * 50);
        const maxPrice = Math.round(modalPrice + 80 + rng() * 60);
        const delta = modalPrice - prev;
        const trend: PriceTrend = delta > 25 ? "up" : delta < -25 ? "down" : "stable";
        rows.push({
          crop,
          market: market.market,
          location: market.location,
          date,
          minPrice,
          maxPrice,
          modalPrice,
          unit: "₹/quintal",
          trend,
        });
        prev = modalPrice;
      }
    }
  }
  return rows;
}

function applyAggregates(farmers: Farmer[], buyers: Buyer[], orders: Order[]) {
  const delivered = orders.filter((o) => o.status === "delivered");
  for (const farmer of farmers) {
    farmer.totalSales = delivered
      .filter((o) => o.farmerId === farmer.id)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }
  for (const buyer of buyers) {
    const theirs = orders.filter((o) => o.buyerId === buyer.id);
    buyer.totalOrders = theirs.length;
    buyer.totalSpent = theirs
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }
}

export function assertDataset(data: MockDataset) {
  const farmers = new Set(data.farmers.map((f) => f.id));
  const products = new Map(data.products.map((p) => [p.id, p]));
  const buyers = new Set(data.buyers.map((b) => b.id));
  const orders = new Map(data.orders.map((o) => [o.id, o]));

  for (const product of data.products) {
    if (!farmers.has(product.farmerId)) throw new Error(`Orphan product ${product.id}`);
  }
  for (const order of data.orders) {
    if (!farmers.has(order.farmerId) || !buyers.has(order.buyerId) || !products.has(order.productId)) {
      throw new Error(`Orphan order ${order.id}`);
    }
    const product = products.get(order.productId)!;
    if (product.farmerId !== order.farmerId) {
      throw new Error(`Order ${order.id} farmer does not own product ${order.productId}`);
    }
    const expected = order.quantity * product.pricePerUnit + order.deliveryFee;
    if (order.subtotal !== order.quantity * product.pricePerUnit) {
      throw new Error(`Order ${order.id} subtotal mismatch`);
    }
    if (order.totalAmount !== expected) throw new Error(`Order ${order.id} total mismatch`);
  }
  if (data.payments.length !== data.orders.length) {
    throw new Error("Every order must have exactly one payment");
  }
  for (const payment of data.payments) {
    const order = orders.get(payment.orderId);
    if (!order) throw new Error(`Orphan payment ${payment.paymentId}`);
    if (payment.amount !== order.totalAmount) {
      throw new Error(`Payment ${payment.paymentId} amount ${payment.amount} != order ${order.totalAmount}`);
    }
  }
  for (const shipment of data.shipments) {
    if (!orders.has(shipment.orderId)) throw new Error(`Orphan shipment ${shipment.shipmentId}`);
  }
  for (const v of data.verifications) {
    if (!farmers.has(v.farmerId)) throw new Error(`Orphan verification ${v.verificationId}`);
  }
  for (const n of data.notifications) {
    const known = farmers.has(n.userId) || buyers.has(n.userId);
    if (!known) throw new Error(`Notification ${n.id} user ${n.userId} does not exist`);
  }
}

export function buildDataset(): MockDataset {
  const farmers = buildFarmers();
  const products = buildProducts(farmers);
  const buyers = buildBuyers();
  const { orders, shipments, payments } = buildOrders(farmers, buyers, products);
  applyAggregates(farmers, buyers, orders);
  const verifications = buildVerifications(farmers);
  const notifications = buildNotifications(orders, payments, shipments, verifications, farmers, buyers, products);
  const marketPrices = buildMarketPrices();
  const data: MockDataset = {
    farmers,
    products,
    buyers,
    orders,
    shipments,
    payments,
    marketPrices,
    verifications,
    notifications,
  };
  assertDataset(data);
  return data;
}

export const DATASET = buildDataset();

export const FLEET = {
  vehicle: DRIVERS[0].vehicle,
  driver: DRIVERS[0].name,
  coverage: "Bengaluru Rural · Anekal · Jigani · Attibele",
  drivers: DRIVERS,
};
