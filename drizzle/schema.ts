import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing Better Auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  role: mysqlEnum("role", ["user", "admin", "vendor"])
    .default("user")
    .notNull(),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  /** Links an authenticated supplier account to the vendorId used in the live catalog. */
  vendorId: varchar("vendorId", { length: 64 }),
  preferredLanguage: mysqlEnum("preferredLanguage", ["ar", "en"])
    .notNull()
    .default("ar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: varchar("userId", { length: 64 }).notNull(),
  impersonatedBy: text("impersonatedBy"),
});

export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  providerId: varchar("providerId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Platform-level values controlled by administrators. */
export const platformSettings = mysqlTable("platform_settings", {
  key: varchar("key", { length: 96 }).primaryKey(),
  value: varchar("value", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

/** Registered commercial accounts allowed to view wholesale terms and request crop quotations. */
export const businessBuyerProfiles = mysqlTable("business_buyer_profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().unique(),
  businessType: mysqlEnum("businessType", [
    "company",
    "trader",
    "restaurant",
  ]).notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  crNumber: varchar("crNumber", { length: 120 }),
  vatNumber: varchar("vatNumber", { length: 120 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"])
    .notNull()
    .default("pending"),
  reviewedBy: varchar("reviewedBy", { length: 64 }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessBuyerProfile = typeof businessBuyerProfiles.$inferSelect;
export type InsertBusinessBuyerProfile =
  typeof businessBuyerProfiles.$inferInsert;

/** Farmer-owned crop offers for the B2B produce marketplace. */
export const produceListings = mysqlTable("produce_listings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  farmerId: varchar("farmerId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  cropType: varchar("cropType", { length: 120 }).notNull(),
  variety: varchar("variety", { length: 160 }),
  grade: varchar("grade", { length: 120 }),
  location: varchar("location", { length: 160 }).notNull(),
  harvestDate: timestamp("harvestDate"),
  availableQuantity: int("availableQuantity").notNull(),
  unit: varchar("unit", { length: 48 }).notNull().default("كجم"),
  minOrderQuantity: int("minOrderQuantity").notNull().default(1),
  priceMode: mysqlEnum("priceMode", ["request_quote", "visible_to_b2b"])
    .notNull()
    .default("request_quote"),
  wholesalePrice: int("wholesalePrice"),
  description: text("description"),
  images: json("images").$type<string[]>().notNull(),
  qualityCertificates: json("qualityCertificates").$type<
    Array<{ name: string; url: string }>
  >(),
  status: mysqlEnum("status", [
    "draft",
    "published",
    "paused",
    "sold_out",
    "archived",
  ])
    .notNull()
    .default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProduceListing = typeof produceListings.$inferSelect;
export type InsertProduceListing = typeof produceListings.$inferInsert;

/** A commercial buyer's request for a farmer's wholesale quote. */
export const produceQuoteRequests = mysqlTable("produce_quote_requests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  listingId: varchar("listingId", { length: 64 }).notNull(),
  buyerId: varchar("buyerId", { length: 64 }).notNull(),
  requestedQuantity: int("requestedQuantity").notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", [
    "new",
    "negotiating",
    "accepted",
    "rejected",
    "cancelled",
  ])
    .notNull()
    .default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProduceQuoteRequest = typeof produceQuoteRequests.$inferSelect;
export type InsertProduceQuoteRequest =
  typeof produceQuoteRequests.$inferInsert;

/** Conversation and optional price proposals scoped to one wholesale quote request. */
export const produceQuoteMessages = mysqlTable("produce_quote_messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  quoteRequestId: varchar("quoteRequestId", { length: 64 }).notNull(),
  senderId: varchar("senderId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  proposedUnitPrice: int("proposedUnitPrice"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProduceQuoteMessage = typeof produceQuoteMessages.$inferSelect;
export type InsertProduceQuoteMessage =
  typeof produceQuoteMessages.$inferInsert;

/** In-app alerts for the parties of a wholesale quotation; only the recipient can read them. */
export const produceQuoteNotifications = mysqlTable(
  "produce_quote_notifications",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    quoteRequestId: varchar("quoteRequestId", { length: 64 }).notNull(),
    recipientId: varchar("recipientId", { length: 64 }).notNull(),
    actorId: varchar("actorId", { length: 64 }).notNull(),
    type: mysqlEnum("type", [
      "status_change",
      "new_message",
      "new_request",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("isRead").notNull().default(false),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type ProduceQuoteNotification =
  typeof produceQuoteNotifications.$inferSelect;
export type InsertProduceQuoteNotification =
  typeof produceQuoteNotifications.$inferInsert;

/** Customer appointments with agricultural service providers. Provider IDs match public provider profile IDs. */
export const serviceBookings = mysqlTable("service_bookings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  customerId: varchar("customerId", { length: 64 }).notNull(),
  providerId: varchar("providerId", { length: 96 }).notNull(),
  providerName: varchar("providerName", { length: 255 }).notNull(),
  providerAvatar: text("providerAvatar"),
  serviceType: varchar("serviceType", { length: 120 }).notNull(),
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  serviceOfferId: varchar("serviceOfferId", { length: 96 }),
  packageName: varchar("packageName", { length: 255 }).notNull(),
  packagePrice: int("packagePrice").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: varchar("duration", { length: 120 }),
  location: text("location").notNull(),
  farmSize: varchar("farmSize", { length: 96 }),
  notes: text("notes"),
  contactName: varchar("contactName", { length: 160 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 32 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "transfer", "cash"])
    .notNull()
    .default("cash"),
  status: mysqlEnum("status", [
    "requested",
    "confirmed",
    "completed",
    "cancelled",
    "declined",
  ])
    .notNull()
    .default("requested"),
  providerNote: text("providerNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = typeof serviceBookings.$inferInsert;

/** Direct customer-provider conversation, persisted separately from wholesale price negotiations. */
export const serviceConversations = mysqlTable("service_conversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  customerId: varchar("customerId", { length: 64 }).notNull(),
  providerId: varchar("providerId", { length: 96 }).notNull(),
  providerName: varchar("providerName", { length: 255 }).notNull(),
  providerAvatar: text("providerAvatar"),
  subject: varchar("subject", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceConversation = typeof serviceConversations.$inferSelect;
export type InsertServiceConversation =
  typeof serviceConversations.$inferInsert;

/** Text messages within a direct customer-provider conversation. */
export const serviceConversationMessages = mysqlTable(
  "service_conversation_messages",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    conversationId: varchar("conversationId", { length: 64 }).notNull(),
    senderId: varchar("senderId", { length: 64 }).notNull(),
    message: text("message").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type ServiceConversationMessage =
  typeof serviceConversationMessages.$inferSelect;
export type InsertServiceConversationMessage =
  typeof serviceConversationMessages.$inferInsert;

/** Vendor profiles managed by administrators and referenced by catalog products. */
export const adminVendorProfiles = mysqlTable("admin_vendor_profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["supplier", "provider"])
    .notNull()
    .default("supplier"),
  category: varchar("category", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["active", "pending", "suspended", "rejected"])
    .notNull()
    .default("pending"),
  verified: boolean("verified").notNull().default(false),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  logoUrl: text("logoUrl"),
  commission: int("commission").notNull().default(0),
  description: text("description"),
  website: varchar("website", { length: 500 }),
  crNumber: varchar("crNumber", { length: 120 }),
  vatNumber: varchar("vatNumber", { length: 120 }),
  bankName: varchar("bankName", { length: 160 }),
  bankIban: varchar("bankIban", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const catalogCategories = mysqlTable("catalog_categories", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  icon: varchar("icon", { length: 32 }).notNull().default("🌿"),
  color: varchar("color", { length: 16 }).notNull().default("#4CAF50"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminVendorProfile = typeof adminVendorProfiles.$inferSelect;
export type CatalogCategory = typeof catalogCategories.$inferSelect;

/**
 * Canonical catalog used by the public storefront.
 * Image URLs and structured product attributes are stored as metadata; binary files remain in object storage.
 */
export const catalogProducts = mysqlTable("catalog_products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  sku: varchar("sku", { length: 120 }).notNull().unique(),
  category: varchar("category", { length: 120 }).notNull(),
  brand: varchar("brand", { length: 160 }),
  vendor: varchar("vendor", { length: 255 }).notNull(),
  vendorId: varchar("vendorId", { length: 64 }).notNull(),
  price: int("price").notNull(),
  originalPrice: int("originalPrice"),
  /** Quantity-based unit prices, stored as ascending minimum-quantity tiers. */
  priceTiers:
    json("priceTiers").$type<
      Array<{ minQuantity: number; unitPrice: number }>
    >(),
  tierPricingStartsAt: timestamp("tierPricingStartsAt"),
  tierPricingEndsAt: timestamp("tierPricingEndsAt"),
  unit: varchar("unit", { length: 120 }).notNull(),
  minOrder: int("minOrder").notNull().default(1),
  stock: int("stock").notNull().default(0),
  sold: int("sold").notNull().default(0),
  status: mysqlEnum("status", [
    "active",
    "inactive",
    "pending_review",
    "rejected",
    "out_of_stock",
  ])
    .notNull()
    .default("pending_review"),
  images: json("images").$type<string[]>().notNull(),
  shortDesc: text("shortDesc"),
  longDesc: text("longDesc"),
  highlights: json("highlights").$type<string[]>(),
  specs: json("specs").$type<Array<{ label: string; value: string }>>(),
  usageInstructions: json("usageInstructions").$type<string[]>(),
  certifications: json("certifications").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  shortDescEn: text("shortDescEn"),
  longDescEn: text("longDescEn"),
  highlightsEn: json("highlightsEn").$type<string[]>(),
  specsEn: json("specsEn").$type<Array<{ label: string; value: string }>>(),
  usageInstructionsEn: json("usageInstructionsEn").$type<string[]>(),
  certificationsEn: json("certificationsEn").$type<string[]>(),
  tagsEn: json("tagsEn").$type<string[]>(),
  /** Rating stored in hundredths, e.g. 480 represents 4.80. */
  rating: int("rating").notNull().default(0),
  reviewCount: int("reviewCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CatalogProduct = typeof catalogProducts.$inferSelect;
export type InsertCatalogProduct = typeof catalogProducts.$inferInsert;

/** Farmer requests for a product not currently available in the catalog. */
export const productAvailabilityRequests = mysqlTable(
  "product_availability_requests",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    requestedProduct: varchar("requestedProduct", { length: 255 }).notNull(),
    sourceProductId: varchar("sourceProductId", { length: 64 }),
    requesterName: varchar("requesterName", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }),
    city: varchar("city", { length: 120 }),
    quantity: varchar("quantity", { length: 120 }),
    notes: text("notes"),
    status: mysqlEnum("status", [
      "new",
      "contacted",
      "sourcing",
      "fulfilled",
      "closed",
    ])
      .notNull()
      .default("new"),
    adminNote: text("adminNote"),
    ownerNotificationDelivered: boolean("ownerNotificationDelivered")
      .notNull()
      .default(false),
    ownerNotifiedAt: timestamp("ownerNotifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type ProductAvailabilityRequest =
  typeof productAvailabilityRequests.$inferSelect;
export type InsertProductAvailabilityRequest =
  typeof productAvailabilityRequests.$inferInsert;

/** Recommended active suppliers for a farmer request, generated when the request is submitted. */
export const productAvailabilityRequestMatches = mysqlTable(
  "product_availability_request_matches",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    requestId: varchar("requestId", { length: 64 }).notNull(),
    vendorId: varchar("vendorId", { length: 64 }).notNull(),
    vendorName: varchar("vendorName", { length: 255 }).notNull(),
    vendorEmail: varchar("vendorEmail", { length: 320 }).notNull(),
    vendorPhone: varchar("vendorPhone", { length: 32 }).notNull(),
    vendorLocation: varchar("vendorLocation", { length: 120 }).notNull(),
    vendorCategory: varchar("vendorCategory", { length: 160 }).notNull(),
    matchScore: int("matchScore").notNull(),
    matchReason: varchar("matchReason", { length: 500 }).notNull(),
    status: mysqlEnum("status", [
      "suggested",
      "contacted",
      "accepted",
      "declined",
    ])
      .notNull()
      .default("suggested"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type ProductAvailabilityRequestMatch =
  typeof productAvailabilityRequestMatches.$inferSelect;
export type InsertProductAvailabilityRequestMatch =
  typeof productAvailabilityRequestMatches.$inferInsert;

/** Farmer questions submitted on a product and supplier responses published to the product page. */
export const productQuestions = mysqlTable("product_questions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  vendorId: varchar("vendorId", { length: 64 }).notNull(),
  vendorName: varchar("vendorName", { length: 255 }).notNull(),
  askerName: varchar("askerName", { length: 160 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answererName: varchar("answererName", { length: 160 }),
  status: mysqlEnum("status", ["pending", "answered", "hidden"])
    .notNull()
    .default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  answeredAt: timestamp("answeredAt"),
  helpfulCount: int("helpfulCount").notNull().default(0),
  notHelpfulCount: int("notHelpfulCount").notNull().default(0),
  vendorNotificationDelivered: boolean("vendorNotificationDelivered")
    .notNull()
    .default(false),
  vendorNotifiedAt: timestamp("vendorNotifiedAt"),
  vendorNotificationError: varchar("vendorNotificationError", { length: 500 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductQuestion = typeof productQuestions.$inferSelect;
export type InsertProductQuestion = typeof productQuestions.$inferInsert;

/** One anonymous device vote per answer; prevents repeat counting while preserving user privacy. */
export const productQuestionFeedback = mysqlTable("product_question_feedback", {
  id: varchar("id", { length: 160 }).primaryKey(),
  questionId: varchar("questionId", { length: 64 }).notNull(),
  feedbackToken: varchar("feedbackToken", { length: 64 }).notNull(),
  isHelpful: boolean("isHelpful").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductQuestionFeedback =
  typeof productQuestionFeedback.$inferSelect;

/** In-app alerts scoped to an approved vendor account; currently created for new product questions. */
export const vendorNotifications = mysqlTable("vendor_notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  vendorId: varchar("vendorId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["product_question"])
    .notNull()
    .default("product_question"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  questionId: varchar("questionId", { length: 64 }).notNull(),
  isRead: boolean("isRead").notNull().default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VendorNotification = typeof vendorNotifications.$inferSelect;
export type InsertVendorNotification = typeof vendorNotifications.$inferInsert;

/** Supplier-controlled delivery preferences for the notification types currently supported by the platform. */
export const vendorNotificationPreferences = mysqlTable(
  "vendor_notification_preferences",
  {
    vendorId: varchar("vendorId", { length: 64 }).primaryKey(),
    productQuestionEnabled: boolean("productQuestionEnabled")
      .notNull()
      .default(true),
    inAppToastEnabled: boolean("inAppToastEnabled").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type InsertVendorNotificationPreferences =
  typeof vendorNotificationPreferences.$inferInsert;

/** Messages submitted from the public contact form. */
export const contactInquiries = mysqlTable("contact_inquiries", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "resolved", "closed"])
    .notNull()
    .default("new"),
  adminReply: text("adminReply"),
  handledBy: varchar("handledBy", { length: 160 }),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertContactInquiry = typeof contactInquiries.$inferInsert;

/** Per-admin read state for alerts that are derived from live operational records. */
export const adminNotificationReads = mysqlTable("admin_notification_reads", {
  id: varchar("id", { length: 160 }).primaryKey(),
  adminUserId: varchar("adminUserId", { length: 64 }).notNull(),
  notificationKey: varchar("notificationKey", { length: 128 }).notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type AdminNotificationRead = typeof adminNotificationReads.$inferSelect;

/** Live commercial order header. Each record is assigned to one supplier for clear fulfillment ownership. */
const commerceOrderStatus = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
const cancellationStatus = [
  "none",
  "requested",
  "approved",
  "rejected",
] as const;

export const commerceOrders = mysqlTable("commerce_orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  customerId: varchar("customerId", { length: 64 }),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  vendorId: varchar("vendorId", { length: 64 }).notNull(),
  vendorName: varchar("vendorName", { length: 255 }).notNull(),
  deliveryAddress: json("deliveryAddress")
    .$type<{
      city: string;
      district: string;
      street: string;
      building?: string | null;
      notes?: string | null;
    }>()
    .notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }).notNull(),
  subtotal: int("subtotal").notNull(),
  discount: int("discount").notNull().default(0),
  shippingCost: int("shippingCost").notNull().default(0),
  vat: int("vat").notNull().default(0),
  total: int("total").notNull(),
  status: mysqlEnum("status", commerceOrderStatus).notNull().default("pending"),
  cancellationStatus: mysqlEnum("cancellationStatus", cancellationStatus)
    .notNull()
    .default("none"),
  cancellationReason: text("cancellationReason"),
  cancellationRequestedAt: timestamp("cancellationRequestedAt"),
  cancellationResolvedAt: timestamp("cancellationResolvedAt"),
  cancellationResponse: text("cancellationResponse"),
  trackingNumber: varchar("trackingNumber", { length: 120 }),
  shippingProvider: varchar("shippingProvider", { length: 160 }),
  estimatedDelivery: timestamp("estimatedDelivery"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const commerceOrderItems = mysqlTable("commerce_order_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  image: text("image"),
  unit: varchar("unit", { length: 120 }).notNull(),
  unitPrice: int("unitPrice").notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const commerceOrderTrackingEvents = mysqlTable(
  "commerce_order_tracking_events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    orderId: varchar("orderId", { length: 64 }).notNull(),
    status: mysqlEnum("status", commerceOrderStatus).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export const customerOrderNotifications = mysqlTable(
  "customer_order_notifications",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    customerId: varchar("customerId", { length: 64 }).notNull(),
    orderId: varchar("orderId", { length: 64 }).notNull(),
    type: mysqlEnum("type", ["order_status", "shipment_update"])
      .notNull()
      .default("order_status"),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("isRead").notNull().default(false),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

/** Supplier-facing alerts for cancellation requests requiring a decision. */
export const vendorOrderNotifications = mysqlTable(
  "vendor_order_notifications",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    vendorId: varchar("vendorId", { length: 64 }).notNull(),
    orderId: varchar("orderId", { length: 64 }).notNull(),
    type: mysqlEnum("type", ["cancellation_request"])
      .notNull()
      .default("cancellation_request"),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("isRead").notNull().default(false),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

/** Verified delivery feedback: one customer submission per delivered order. */
export const commerceOrderDeliveryRatings = mysqlTable(
  "commerce_order_delivery_ratings",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    orderId: varchar("orderId", { length: 64 }).notNull().unique(),
    customerId: varchar("customerId", { length: 64 }).notNull(),
    rating: int("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type CommerceOrder = typeof commerceOrders.$inferSelect;
export type InsertCommerceOrder = typeof commerceOrders.$inferInsert;
export type CommerceOrderItem = typeof commerceOrderItems.$inferSelect;
export type CommerceOrderTrackingEvent =
  typeof commerceOrderTrackingEvents.$inferSelect;
export type CustomerOrderNotification =
  typeof customerOrderNotifications.$inferSelect;
export type VendorOrderNotification =
  typeof vendorOrderNotifications.$inferSelect;
export type CommerceOrderDeliveryRating =
  typeof commerceOrderDeliveryRatings.$inferSelect;

/** Editorial articles shown in the public أخبار وقصص section and managed by administrators. */
export const contentArticles = mysqlTable("content_articles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  tags: json("tags").$type<string[]>(),
  titleEn: varchar("titleEn", { length: 255 }),
  excerptEn: text("excerptEn"),
  contentEn: text("contentEn"),
  categoryEn: varchar("categoryEn", { length: 120 }),
  tagsEn: json("tagsEn").$type<string[]>(),
  coverImage: varchar("coverImage", { length: 1000 }),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .notNull()
    .default("draft"),
  authorName: varchar("authorName", { length: 160 }).notNull(),
  viewCount: int("viewCount").notNull().default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentArticle = typeof contentArticles.$inferSelect;
export type InsertContentArticle = typeof contentArticles.$inferInsert;
