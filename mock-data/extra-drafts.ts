/**
 * Additional demo rows appended onto the v1 drafts in seed.ts.
 * Original IDs (frm-01..18, prd-01..32, byr-01..10, ord-01..26) stay untouched.
 */
import type {
  AvailabilityStatus,
  BuyerType,
  FarmerVerificationStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
  QualityGrade,
} from "./types";

export const EXTRA_FARMERS: {
  id: string;
  name: string;
  phone: string;
  place: string;
  crops: string[];
  farmSize: number;
  verificationStatus: FarmerVerificationStatus;
  rating: number;
  joinedDate: string;
}[] = [
  { id: "frm-19", name: "Chandrashekar B", phone: "9000000119", place: "bidadi", crops: ["Tomato", "Ragi"], farmSize: 2.7, verificationStatus: "verified", rating: 4.6, joinedDate: "2025-07-08" },
  { id: "frm-20", name: "Radha Krishnan", phone: "9000000120", place: "channapatna", crops: ["Coconut", "Banana"], farmSize: 3.3, verificationStatus: "verified", rating: 4.5, joinedDate: "2025-02-14" },
  { id: "frm-21", name: "Shivakumar Gowda", phone: "9000000121", place: "malur", crops: ["Potato", "Beans"], farmSize: 2.0, verificationStatus: "verified", rating: 4.7, joinedDate: "2025-09-22" },
  { id: "frm-22", name: "Ayesha Banu", phone: "9000000122", place: "sidlaghatta", crops: ["Tomato", "Chilli"], farmSize: 1.4, verificationStatus: "verified", rating: 4.8, joinedDate: "2025-12-03" },
  { id: "frm-23", name: "Hanumanthappa", phone: "9000000123", place: "gauribidanur", crops: ["Ragi", "Groundnut"], farmSize: 4.1, verificationStatus: "pending", rating: 4.0, joinedDate: "2026-06-21" },
  { id: "frm-24", name: "Parvathi Bai", phone: "9000000124", place: "hassan", crops: ["Coconut", "Banana"], farmSize: 5.2, verificationStatus: "verified", rating: 4.4, joinedDate: "2024-10-19" },
  { id: "frm-25", name: "Raghavendra Swamy", phone: "9000000125", place: "davangere", crops: ["Maize", "Onion"], farmSize: 3.8, verificationStatus: "verified", rating: 4.3, joinedDate: "2025-01-09" },
  { id: "frm-26", name: "Geetha M", phone: "9000000126", place: "chitradurga", crops: ["Groundnut", "Ragi"], farmSize: 2.9, verificationStatus: "verified", rating: 4.6, joinedDate: "2025-04-17" },
  { id: "frm-27", name: "Salman Khan P", phone: "9000000127", place: "hoskote", crops: ["Grapes", "Mango"], farmSize: 3.0, verificationStatus: "verified", rating: 4.5, joinedDate: "2025-05-28" },
  { id: "frm-28", name: "Jayamma", phone: "9000000128", place: "mandya", crops: ["Sugarcane", "Banana"], farmSize: 6.0, verificationStatus: "verified", rating: 4.7, joinedDate: "2024-09-12" },
  { id: "frm-29", name: "Umesh Rao", phone: "9000000129", place: "tumakuru", crops: ["Coconut", "Arecanut"], farmSize: 2.5, verificationStatus: "pending", rating: 4.1, joinedDate: "2026-07-09" },
  { id: "frm-30", name: "Noorjahan", phone: "9000000130", place: "nelamangala", crops: ["Coriander", "Beans"], farmSize: 1.1, verificationStatus: "verified", rating: 4.9, joinedDate: "2025-11-21" },
  { id: "frm-31", name: "Srinivas Murthy", phone: "9000000131", place: "doddaballapur", crops: ["Potato", "Cabbage"], farmSize: 2.3, verificationStatus: "verified", rating: 4.4, joinedDate: "2025-08-04" },
  { id: "frm-32", name: "Kamalamma", phone: "9000000132", place: "kanakapura", crops: ["Ragi", "Tomato"], farmSize: 1.7, verificationStatus: "verified", rating: 4.6, joinedDate: "2025-06-16" },
  { id: "frm-33", name: "Firoz Ahmed", phone: "9000000133", place: "attibele", crops: ["Onion", "Chilli"], farmSize: 2.2, verificationStatus: "unverified", rating: 3.8, joinedDate: "2026-08-11" },
  { id: "frm-34", name: "Bhagyamma", phone: "9000000134", place: "jigani", crops: ["Cauliflower", "Cabbage"], farmSize: 1.8, verificationStatus: "verified", rating: 4.5, joinedDate: "2025-10-02" },
  { id: "frm-35", name: "Mohan Das", phone: "9000000135", place: "magadi", crops: ["Mango", "Coconut"], farmSize: 4.4, verificationStatus: "verified", rating: 4.3, joinedDate: "2025-03-07" },
  { id: "frm-36", name: "Leelavathi K", phone: "9000000136", place: "mysuru", crops: ["Banana", "Coconut"], farmSize: 3.2, verificationStatus: "verified", rating: 4.8, joinedDate: "2025-01-30" },
];

export const EXTRA_PRODUCTS: {
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
}[] = [
  { id: "prd-33", farmerId: "frm-17", cropName: "Chilli", category: "vegetable", quantity: 760, pricePerUnit: 76, minimumOrderQuantity: 40, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-34", farmerId: "frm-17", cropName: "Onion", category: "vegetable", quantity: 2100, pricePerUnit: 18, minimumOrderQuantity: 150, harvestDaysAgo: 3, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-35", farmerId: "frm-19", cropName: "Tomato", category: "vegetable", quantity: 2800, pricePerUnit: 21, minimumOrderQuantity: 150, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-36", farmerId: "frm-19", cropName: "Ragi", category: "grain", quantity: 1900, pricePerUnit: 41, minimumOrderQuantity: 100, harvestDaysAgo: 9, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-37", farmerId: "frm-20", cropName: "Coconut", category: "fruit", quantity: 2400, pricePerUnit: 29, minimumOrderQuantity: 80, harvestDaysAgo: 4, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-38", farmerId: "frm-20", cropName: "Banana", category: "fruit", quantity: 1700, pricePerUnit: 31, minimumOrderQuantity: 100, harvestDaysAgo: 1, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-39", farmerId: "frm-21", cropName: "Potato", category: "vegetable", quantity: 3200, pricePerUnit: 15, minimumOrderQuantity: 200, harvestDaysAgo: 3, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-40", farmerId: "frm-21", cropName: "Beans", category: "vegetable", quantity: 860, pricePerUnit: 43, minimumOrderQuantity: 40, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-41", farmerId: "frm-22", cropName: "Tomato", category: "vegetable", quantity: 2100, pricePerUnit: 24, minimumOrderQuantity: 100, harvestDaysAgo: 0, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-42", farmerId: "frm-22", cropName: "Chilli", category: "vegetable", quantity: 640, pricePerUnit: 82, minimumOrderQuantity: 30, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-43", farmerId: "frm-23", cropName: "Ragi", category: "grain", quantity: 2600, pricePerUnit: 39, minimumOrderQuantity: 120, harvestDaysAgo: 11, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-44", farmerId: "frm-23", cropName: "Groundnut", category: "grain", quantity: 1400, pricePerUnit: 74, minimumOrderQuantity: 60, harvestDaysAgo: 8, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-45", farmerId: "frm-24", cropName: "Coconut", category: "fruit", quantity: 1800, pricePerUnit: 30, minimumOrderQuantity: 80, harvestDaysAgo: 6, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-46", farmerId: "frm-24", cropName: "Banana", category: "fruit", quantity: 900, pricePerUnit: 36, minimumOrderQuantity: 50, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-47", farmerId: "frm-25", cropName: "Maize", category: "grain", quantity: 4200, pricePerUnit: 21, minimumOrderQuantity: 250, harvestDaysAgo: 7, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-48", farmerId: "frm-25", cropName: "Onion", category: "vegetable", quantity: 2500, pricePerUnit: 17, minimumOrderQuantity: 200, harvestDaysAgo: 4, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-49", farmerId: "frm-26", cropName: "Groundnut", category: "grain", quantity: 1700, pricePerUnit: 70, minimumOrderQuantity: 80, harvestDaysAgo: 10, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-50", farmerId: "frm-26", cropName: "Ragi", category: "grain", quantity: 2200, pricePerUnit: 40, minimumOrderQuantity: 100, harvestDaysAgo: 13, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-51", farmerId: "frm-27", cropName: "Grapes", category: "fruit", quantity: 1100, pricePerUnit: 64, minimumOrderQuantity: 40, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-52", farmerId: "frm-27", cropName: "Mango", category: "fruit", quantity: 1600, pricePerUnit: 52, minimumOrderQuantity: 60, harvestDaysAgo: 3, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-53", farmerId: "frm-28", cropName: "Sugarcane", category: "grain", quantity: 9000, pricePerUnit: 4, minimumOrderQuantity: 500, harvestDaysAgo: 5, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-54", farmerId: "frm-28", cropName: "Banana", category: "fruit", quantity: 2100, pricePerUnit: 32, minimumOrderQuantity: 100, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-55", farmerId: "frm-29", cropName: "Coconut", category: "fruit", quantity: 1500, pricePerUnit: 27, minimumOrderQuantity: 80, harvestDaysAgo: 4, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-56", farmerId: "frm-29", cropName: "Arecanut", category: "grain", quantity: 480, pricePerUnit: 335, minimumOrderQuantity: 30, harvestDaysAgo: 12, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-57", farmerId: "frm-30", cropName: "Coriander", category: "vegetable", quantity: 380, pricePerUnit: 90, minimumOrderQuantity: 15, harvestDaysAgo: 0, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-58", farmerId: "frm-30", cropName: "Beans", category: "vegetable", quantity: 720, pricePerUnit: 45, minimumOrderQuantity: 40, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "limited" },
  { id: "prd-59", farmerId: "frm-31", cropName: "Potato", category: "vegetable", quantity: 2900, pricePerUnit: 16, minimumOrderQuantity: 180, harvestDaysAgo: 4, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-60", farmerId: "frm-31", cropName: "Cabbage", category: "vegetable", quantity: 2400, pricePerUnit: 13, minimumOrderQuantity: 150, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-61", farmerId: "frm-32", cropName: "Ragi", category: "grain", quantity: 1800, pricePerUnit: 43, minimumOrderQuantity: 80, harvestDaysAgo: 10, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-62", farmerId: "frm-32", cropName: "Tomato", category: "vegetable", quantity: 1500, pricePerUnit: 22, minimumOrderQuantity: 80, harvestDaysAgo: 1, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-63", farmerId: "frm-33", cropName: "Onion", category: "vegetable", quantity: 1900, pricePerUnit: 18, minimumOrderQuantity: 120, harvestDaysAgo: 3, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-64", farmerId: "frm-33", cropName: "Chilli", category: "vegetable", quantity: 520, pricePerUnit: 75, minimumOrderQuantity: 25, harvestDaysAgo: 2, qualityGrade: "C", availabilityStatus: "limited" },
  { id: "prd-65", farmerId: "frm-34", cropName: "Cauliflower", category: "vegetable", quantity: 1400, pricePerUnit: 27, minimumOrderQuantity: 60, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-66", farmerId: "frm-34", cropName: "Cabbage", category: "vegetable", quantity: 2000, pricePerUnit: 14, minimumOrderQuantity: 150, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-67", farmerId: "frm-35", cropName: "Mango", category: "fruit", quantity: 2000, pricePerUnit: 54, minimumOrderQuantity: 80, harvestDaysAgo: 2, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-68", farmerId: "frm-35", cropName: "Coconut", category: "fruit", quantity: 1300, pricePerUnit: 28, minimumOrderQuantity: 60, harvestDaysAgo: 5, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-69", farmerId: "frm-36", cropName: "Banana", category: "fruit", quantity: 2600, pricePerUnit: 33, minimumOrderQuantity: 120, harvestDaysAgo: 1, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-70", farmerId: "frm-36", cropName: "Coconut", category: "fruit", quantity: 1100, pricePerUnit: 29, minimumOrderQuantity: 50, harvestDaysAgo: 4, qualityGrade: "B", availabilityStatus: "available" },
  { id: "prd-71", farmerId: "frm-16", cropName: "Coconut", category: "fruit", quantity: 1600, pricePerUnit: 27, minimumOrderQuantity: 80, harvestDaysAgo: 6, qualityGrade: "A", availabilityStatus: "available" },
  { id: "prd-72", farmerId: "frm-01", cropName: "Tomato", category: "vegetable", quantity: 0, pricePerUnit: 20, minimumOrderQuantity: 200, harvestDaysAgo: 8, qualityGrade: "B", availabilityStatus: "sold_out" },
];

export const EXTRA_BUYERS: {
  id: string;
  name: string;
  type: BuyerType;
  dest: string;
  contact: string;
  rating: number;
}[] = [
  { id: "byr-11", name: "Yeshwanthpur Mandi Yard", type: "wholesaler", dest: "yeshwanthpur", contact: "9000000211", rating: 4.3 },
  { id: "byr-12", name: "Silk Board Fresh Hub", type: "retailer", dest: "silkboard", contact: "9000000212", rating: 4.5 },
  { id: "byr-13", name: "Koramangala Food Court Supply", type: "restaurant", dest: "koramangala", contact: "9000000213", rating: 4.6 },
  { id: "byr-14", name: "Hebbal Cold Chain", type: "wholesaler", dest: "hebbal", contact: "9000000214", rating: 4.2 },
  { id: "byr-15", name: "Mysuru Central Mandi", type: "wholesaler", dest: "mysuru", contact: "9000000215", rating: 4.4 },
  { id: "byr-16", name: "Tumakuru APMC Traders", type: "wholesaler", dest: "tumakuru", contact: "9000000216", rating: 4.1 },
];

export const EXTRA_ORDERS: {
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
}[] = [
  { id: "ord-27", buyerId: "byr-11", productId: "prd-35", quantity: 1800, status: "pending", daysAgo: 0, hour: 8, expectedInDays: 1, tripCode: "AS-TRP-1061", payment: "pending", method: "UPI" },
  { id: "ord-28", buyerId: "byr-12", productId: "prd-41", quantity: 900, status: "confirmed", daysAgo: 0, hour: 9, expectedInDays: 1, tripCode: "AS-TRP-1062", payment: "pending", method: "NEFT" },
  { id: "ord-29", buyerId: "byr-05", productId: "prd-65", quantity: 600, status: "ready_for_pickup", daysAgo: 0, hour: 7, expectedInDays: 1, tripCode: "AS-TRP-1063", driverIndex: 3, payment: "success", method: "UPI" },
  { id: "ord-30", buyerId: "byr-14", productId: "prd-39", quantity: 2200, status: "in_transit", daysAgo: 0, hour: 5, expectedInDays: 0, tripCode: "AS-TRP-1064", driverIndex: 3, payment: "success", method: "IMPS" },
  { id: "ord-31", buyerId: "byr-13", productId: "prd-57", quantity: 80, status: "in_transit", daysAgo: 0, hour: 6, expectedInDays: 0, tripCode: "AS-TRP-1065", driverIndex: 4, payment: "success", method: "UPI" },
  { id: "ord-32", buyerId: "byr-15", productId: "prd-69", quantity: 1400, status: "delivered", daysAgo: 2, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1066", driverIndex: 0, payment: "success", method: "NEFT" },
  { id: "ord-33", buyerId: "byr-01", productId: "prd-47", quantity: 2500, status: "delivered", daysAgo: 4, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1067", driverIndex: 2, payment: "success", method: "UPI" },
  { id: "ord-34", buyerId: "byr-02", productId: "prd-48", quantity: 1800, status: "delivered", daysAgo: 4, hour: 10, expectedInDays: 0, tripCode: "AS-TRP-1068", driverIndex: 1, payment: "success", method: "IMPS" },
  { id: "ord-35", buyerId: "byr-06", productId: "prd-34", quantity: 1500, status: "delivered", daysAgo: 5, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1069", driverIndex: 4, payment: "success", method: "UPI" },
  { id: "ord-36", buyerId: "byr-10", productId: "prd-60", quantity: 1600, status: "delivered", daysAgo: 6, hour: 7, expectedInDays: 0, tripCode: "AS-TRP-1070", driverIndex: 3, payment: "success", method: "NEFT" },
  { id: "ord-37", buyerId: "byr-03", productId: "prd-66", quantity: 1400, status: "delivered", daysAgo: 7, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1071", driverIndex: 0, payment: "success", method: "UPI" },
  { id: "ord-38", buyerId: "byr-08", productId: "prd-36", quantity: 900, status: "delivered", daysAgo: 8, hour: 11, expectedInDays: 0, tripCode: "AS-TRP-1072", driverIndex: 2, payment: "success", method: "NEFT" },
  { id: "ord-39", buyerId: "byr-16", productId: "prd-50", quantity: 1200, status: "delivered", daysAgo: 9, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1073", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-40", buyerId: "byr-04", productId: "prd-51", quantity: 220, status: "cancelled", daysAgo: 9, hour: 14, expectedInDays: 2, payment: "failed", method: "UPI" },
  { id: "ord-41", buyerId: "byr-07", productId: "prd-58", quantity: 180, status: "delivered", daysAgo: 1, hour: 13, expectedInDays: 0, tripCode: "AS-TRP-1074", driverIndex: 4, payment: "success", method: "UPI" },
  { id: "ord-42", buyerId: "byr-12", productId: "prd-40", quantity: 400, status: "processing", daysAgo: 1, hour: 10, expectedInDays: 2, tripCode: "AS-TRP-1075", payment: "pending", method: "IMPS" },
  { id: "ord-43", buyerId: "byr-11", productId: "prd-59", quantity: 1800, status: "ready_for_pickup", daysAgo: 1, hour: 8, expectedInDays: 1, tripCode: "AS-TRP-1076", driverIndex: 1, payment: "success", method: "NEFT" },
  { id: "ord-44", buyerId: "byr-15", productId: "prd-53", quantity: 4000, status: "delivered", daysAgo: 11, hour: 7, expectedInDays: 0, tripCode: "AS-TRP-1077", driverIndex: 2, payment: "success", method: "NEFT" },
  { id: "ord-45", buyerId: "byr-01", productId: "prd-52", quantity: 700, status: "delivered", daysAgo: 12, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1078", driverIndex: 0, payment: "success", method: "UPI" },
  { id: "ord-46", buyerId: "byr-02", productId: "prd-67", quantity: 900, status: "delivered", daysAgo: 14, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1079", driverIndex: 3, payment: "success", method: "IMPS" },
  { id: "ord-47", buyerId: "byr-08", productId: "prd-44", quantity: 600, status: "processing", daysAgo: 2, hour: 11, expectedInDays: 3, tripCode: "AS-TRP-1080", payment: "pending", method: "NEFT" },
  { id: "ord-48", buyerId: "byr-14", productId: "prd-47", quantity: 1600, status: "confirmed", daysAgo: 1, hour: 16, expectedInDays: 2, tripCode: "AS-TRP-1081", payment: "pending", method: "UPI" },
  { id: "ord-49", buyerId: "byr-06", productId: "prd-42", quantity: 250, status: "delivered", daysAgo: 3, hour: 12, expectedInDays: 0, tripCode: "AS-TRP-1082", driverIndex: 4, payment: "success", method: "UPI" },
  { id: "ord-50", buyerId: "byr-09", productId: "prd-46", quantity: 120, status: "delivered", daysAgo: 2, hour: 15, expectedInDays: 0, tripCode: "AS-TRP-1083", driverIndex: 1, payment: "success", method: "UPI" },
  { id: "ord-51", buyerId: "byr-03", productId: "prd-37", quantity: 1000, status: "delivered", daysAgo: 15, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1084", driverIndex: 0, payment: "success", method: "NEFT" },
  { id: "ord-52", buyerId: "byr-16", productId: "prd-43", quantity: 1100, status: "delivered", daysAgo: 16, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1085", driverIndex: 2, payment: "success", method: "UPI" },
  { id: "ord-53", buyerId: "byr-10", productId: "prd-71", quantity: 800, status: "delivered", daysAgo: 17, hour: 10, expectedInDays: 0, tripCode: "AS-TRP-1086", driverIndex: 3, payment: "success", method: "IMPS" },
  { id: "ord-54", buyerId: "byr-01", productId: "prd-72", quantity: 1400, status: "delivered", daysAgo: 18, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1087", driverIndex: 0, payment: "success", method: "UPI" },
  { id: "ord-55", buyerId: "byr-05", productId: "prd-38", quantity: 700, status: "cancelled", daysAgo: 13, hour: 16, expectedInDays: 2, payment: "failed", method: "UPI" },
  { id: "ord-56", buyerId: "byr-13", productId: "prd-20", quantity: 60, status: "delivered", daysAgo: 3, hour: 11, expectedInDays: 0, tripCode: "AS-TRP-1088", driverIndex: 4, payment: "success", method: "UPI" },
  { id: "ord-57", buyerId: "byr-02", productId: "prd-63", quantity: 1000, status: "pending", daysAgo: 0, hour: 10, expectedInDays: 1, tripCode: "AS-TRP-1089", payment: "pending", method: "UPI" },
  { id: "ord-58", buyerId: "byr-11", productId: "prd-49", quantity: 800, status: "delivered", daysAgo: 19, hour: 8, expectedInDays: 0, tripCode: "AS-TRP-1090", driverIndex: 1, payment: "success", method: "NEFT" },
  { id: "ord-59", buyerId: "byr-15", productId: "prd-54", quantity: 1100, status: "delivered", daysAgo: 20, hour: 9, expectedInDays: 0, tripCode: "AS-TRP-1091", driverIndex: 2, payment: "success", method: "UPI" },
  { id: "ord-60", buyerId: "byr-04", productId: "prd-30", quantity: 400, status: "delivered", daysAgo: 21, hour: 12, expectedInDays: 0, tripCode: "AS-TRP-1092", driverIndex: 0, payment: "success", method: "UPI" },
  { id: "ord-61", buyerId: "byr-08", productId: "prd-56", quantity: 80, status: "processing", daysAgo: 2, hour: 9, expectedInDays: 4, tripCode: "AS-TRP-1093", payment: "pending", method: "NEFT" },
  { id: "ord-62", buyerId: "byr-12", productId: "prd-62", quantity: 700, status: "ready_for_pickup", daysAgo: 1, hour: 15, expectedInDays: 1, tripCode: "AS-TRP-1094", driverIndex: 4, payment: "success", method: "UPI" },
];
