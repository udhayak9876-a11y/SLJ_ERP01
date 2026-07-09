import type { ShopSettings } from "@prisma/client";

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  id: "singleton",
  shopName: "Sri Lakshmi Jewellery",
  address: "",
  city: "Tiruppur",
  state: "Tamil Nadu",
  pincode: "",
  phone: "",
  email: "",
  gstin: "",
  bankDetails: "",
  logoUrl: "",
  financialYearStart: 4,
};

export const EMPTY_DASHBOARD_STATS = {
  todaySalesCount: 0,
  todaySalesTotal: 0,
  cashCollected: 0,
  totalCollected: 0,
  chitCollected: 0,
  pendingDrafts: 0,
  outstanding: 0,
};
