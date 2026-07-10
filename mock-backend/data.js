"use strict";

/**
 * In-memory "database" for the mock AN-group backend. Reset on every
 * server restart — this is a testing/dev fixture, not a real datastore.
 * Seeded with just enough data to exercise every screen in the frontend.
 */

let idCounter = 1000;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

const users = [
  {
    id: "user_admin",
    name: "Admin User",
    email: "admin@native.test",
    phone: "9000000001",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user_vendor",
    name: "Priya's Kitchen",
    email: "vendor@native.test",
    phone: "9000000002",
    password: "vendor123",
    role: "vendor",
    vendorId: "vendor_1",
  },
  {
    id: "user_customer",
    name: "Test Customer",
    email: "customer@native.test",
    phone: "9000000003",
    password: "customer123",
    role: "customer",
  },
];

const tokens = new Map(); // token -> userId

const categories = [
  { _id: "cat_1", name: "Cold Pressed Oils", type: "website" },
  { _id: "cat_2", name: "Flours & Millets", type: "website" },
  { _id: "cat_3", name: "Spices & Masalas", type: "website" },
];

const products = [
  {
    _id: "prod_1",
    productKey: "native-groundnut-oil-1l",
    slug: "cold-pressed-groundnut-oil-1l",
    name: "Cold Pressed Groundnut Oil (1L)",
    displayName: "Cold Pressed Groundnut Oil (1L)",
    description: "Traditionally wood-pressed groundnut oil, no chemicals, no refining.",
    shortDescription: "Wood-pressed, unrefined, cholesterol-free.",
    images: ["/placeholder.png"],
    category: "cat_1",
    mrp: 399,
    sellingPrice: 349,
    displayPrice: 349,
    stock: 42,
    sizeValue: 1,
    sizeUnit: "L",
    ingredients: [{ _id: "ing_1", name: "Groundnut" }],
    vendor: { id: "vendor_1", name: "Priya's Kitchen" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "prod_2",
    productKey: "native-ragi-flour-500g",
    slug: "organic-ragi-flour-500g",
    name: "Organic Ragi Flour (500g)",
    displayName: "Organic Ragi Flour (500g)",
    description: "Stone-ground finger millet flour, high in calcium and iron.",
    shortDescription: "Stone-ground, high calcium, gluten-free.",
    images: ["/placeholder.png"],
    category: "cat_2",
    mrp: 149,
    sellingPrice: 129,
    displayPrice: 129,
    stock: 0,
    sizeValue: 500,
    sizeUnit: "g",
    ingredients: [{ _id: "ing_2", name: "Finger Millet (Ragi)" }],
    vendor: null,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "prod_3",
    productKey: "native-turmeric-powder-200g",
    slug: "native-turmeric-powder-200g",
    name: "Native Turmeric Powder (200g)",
    displayName: "Native Turmeric Powder (200g)",
    description: "Sun-dried, single-origin turmeric with high curcumin content.",
    shortDescription: "Single-origin, high curcumin.",
    images: ["/placeholder.png"],
    category: "cat_3",
    mrp: 99,
    sellingPrice: 89,
    displayPrice: 89,
    stock: 3,
    sizeValue: 200,
    sizeUnit: "g",
    ingredients: [{ _id: "ing_3", name: "Turmeric" }],
    vendor: { id: "vendor_1", name: "Priya's Kitchen" },
    createdAt: new Date().toISOString(),
  },
];

const orders = [];
const reviews = [];
const wishlists = new Map(); // userId -> [{productId, ...}]
const coupons = [
  {
    _id: "coupon_1",
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minCart: 299,
    active: true,
    usedCount: 0,
    usedBy: [],
  },
];

const vendors = [
  {
    _id: "vendor_1",
    businessName: "Priya's Kitchen",
    contactName: "Priya Sharma",
    email: "vendor@native.test",
    phone: "9000000002",
    status: "active",
    slug: "priyas-kitchen",
    description: "Home-style cold-pressed oils and spice blends, made in small batches.",
  },
];

const business = {
  registered: true,
  businessId: "biz_native_001",
  businessName: "Native",
  status: "active",
};

const blogPosts = [
  {
    _id: "blog_1",
    slug: "why-cold-pressed-oil",
    title: "Why Cold-Pressed Oil Matters",
    excerpt: "The difference between cold-pressed and refined oils, explained.",
    content: "Cold-pressed oils retain more nutrients because they're extracted without heat...",
    publishedAt: new Date().toISOString(),
  },
];

let companySettings = {
  name: "Native",
  gstNumber: "29ABCDE1234F1Z5",
  address: "Bengaluru, Karnataka, India",
  supportEmail: "care@shopnative.in",
  supportPhone: "+918985229693",
};

let paymentSettings = { razorpay: true, cod: true, upi: true };

module.exports = {
  nextId,
  users,
  tokens,
  categories,
  products,
  orders,
  reviews,
  wishlists,
  coupons,
  vendors,
  business,
  blogPosts,
  get companySettings() {
    return companySettings;
  },
  setCompanySettings(v) {
    companySettings = { ...companySettings, ...v };
  },
  get paymentSettings() {
    return paymentSettings;
  },
  setPaymentSettings(v) {
    paymentSettings = { ...paymentSettings, ...v };
  },
};
