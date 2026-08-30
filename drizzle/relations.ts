import { relations } from "drizzle-orm";
import {
  users,
  platformSettings,
  businessBuyerProfiles,
  produceListings,
  produceQuoteRequests,
  produceQuoteMessages,
  produceQuoteNotifications,
  serviceBookings,
  serviceConversations,
  serviceConversationMessages,
  adminVendorProfiles,
  catalogCategories,
  catalogProducts,
  productAvailabilityRequests,
  productAvailabilityRequestMatches,
  productQuestions,
  productQuestionFeedback,
  vendorNotifications,
  vendorNotificationPreferences,
  contactInquiries,
  adminNotificationReads,
  commerceOrders,
  commerceOrderItems,
  commerceOrderTrackingEvents,
  customerOrderNotifications,
  vendorOrderNotifications,
  commerceOrderDeliveryRatings,
  contentArticles,
} from "./schema";

// ─── Users ──────────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  businessBuyerProfile: one(businessBuyerProfiles, {
    fields: [users.id],
    references: [businessBuyerProfiles.userId],
  }),
  produceListings: many(produceListings),
  commerceOrders: many(commerceOrders),
  serviceBookings: many(serviceBookings),
  serviceConversations: many(serviceConversations),
  adminNotificationReads: many(adminNotificationReads),
  customerOrderNotifications: many(customerOrderNotifications),
  commerceOrderDeliveryRatings: many(commerceOrderDeliveryRatings),
}));

// ─── Business Buyer Profiles ────────────────────────────────────────────────────
export const businessBuyerProfilesRelations = relations(businessBuyerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [businessBuyerProfiles.userId],
    references: [users.id],
  }),
  quoteRequests: many(produceQuoteRequests),
}));

// ─── Admin Vendor Profiles ──────────────────────────────────────────────────────
export const adminVendorProfilesRelations = relations(adminVendorProfiles, ({ many }) => ({
  catalogProducts: many(catalogProducts),
  commerceOrders: many(commerceOrders),
  vendorNotifications: many(vendorNotifications),
  vendorOrderNotifications: many(vendorOrderNotifications),
}));

// ─── Catalog Products ───────────────────────────────────────────────────────────
export const catalogProductsRelations = relations(catalogProducts, ({ one, many }) => ({
  vendor: one(adminVendorProfiles, {
    fields: [catalogProducts.vendorId],
    references: [adminVendorProfiles.id],
  }),
  orderItems: many(commerceOrderItems),
  questions: many(productQuestions),
}));

// ─── Produce Listings ───────────────────────────────────────────────────────────
export const produceListingsRelations = relations(produceListings, ({ one, many }) => ({
  farmer: one(users, {
    fields: [produceListings.farmerId],
    references: [users.id],
  }),
  quoteRequests: many(produceQuoteRequests),
}));

// ─── Produce Quote Requests ─────────────────────────────────────────────────────
export const produceQuoteRequestsRelations = relations(produceQuoteRequests, ({ one, many }) => ({
  listing: one(produceListings, {
    fields: [produceQuoteRequests.listingId],
    references: [produceListings.id],
  }),
  messages: many(produceQuoteMessages),
  notifications: many(produceQuoteNotifications),
}));

// ─── Produce Quote Messages ─────────────────────────────────────────────────────
export const produceQuoteMessagesRelations = relations(produceQuoteMessages, ({ one }) => ({
  quoteRequest: one(produceQuoteRequests, {
    fields: [produceQuoteMessages.quoteRequestId],
    references: [produceQuoteRequests.id],
  }),
}));

// ─── Produce Quote Notifications ────────────────────────────────────────────────
export const produceQuoteNotificationsRelations = relations(produceQuoteNotifications, ({ one }) => ({
  quoteRequest: one(produceQuoteRequests, {
    fields: [produceQuoteNotifications.quoteRequestId],
    references: [produceQuoteRequests.id],
  }),
}));

// ─── Service Bookings ───────────────────────────────────────────────────────────
export const serviceBookingsRelations = relations(serviceBookings, ({ one }) => ({
  customer: one(users, {
    fields: [serviceBookings.customerId],
    references: [users.id],
  }),
}));

// ─── Service Conversations ──────────────────────────────────────────────────────
export const serviceConversationsRelations = relations(serviceConversations, ({ one, many }) => ({
  customer: one(users, {
    fields: [serviceConversations.customerId],
    references: [users.id],
  }),
  messages: many(serviceConversationMessages),
}));

// ─── Service Conversation Messages ──────────────────────────────────────────────
export const serviceConversationMessagesRelations = relations(serviceConversationMessages, ({ one }) => ({
  conversation: one(serviceConversations, {
    fields: [serviceConversationMessages.conversationId],
    references: [serviceConversations.id],
  }),
}));

// ─── Product Availability Requests ──────────────────────────────────────────────
export const productAvailabilityRequestsRelations = relations(productAvailabilityRequests, ({ many }) => ({
  matches: many(productAvailabilityRequestMatches),
}));

// ─── Product Availability Request Matches ───────────────────────────────────────
export const productAvailabilityRequestMatchesRelations = relations(productAvailabilityRequestMatches, ({ one }) => ({
  request: one(productAvailabilityRequests, {
    fields: [productAvailabilityRequestMatches.requestId],
    references: [productAvailabilityRequests.id],
  }),
}));

// ─── Product Questions ──────────────────────────────────────────────────────────
export const productQuestionsRelations = relations(productQuestions, ({ one, many }) => ({
  product: one(catalogProducts, {
    fields: [productQuestions.productId],
    references: [catalogProducts.id],
  }),
  feedback: many(productQuestionFeedback),
}));

// ─── Product Question Feedback ──────────────────────────────────────────────────
export const productQuestionFeedbackRelations = relations(productQuestionFeedback, ({ one }) => ({
  question: one(productQuestions, {
    fields: [productQuestionFeedback.questionId],
    references: [productQuestions.id],
  }),
}));

// ─── Vendor Notifications ───────────────────────────────────────────────────────
export const vendorNotificationsRelations = relations(vendorNotifications, ({ one }) => ({
  vendor: one(adminVendorProfiles, {
    fields: [vendorNotifications.vendorId],
    references: [adminVendorProfiles.id],
  }),
  product: one(catalogProducts, {
    fields: [vendorNotifications.productId],
    references: [catalogProducts.id],
  }),
}));

// ─── Commerce Orders ────────────────────────────────────────────────────────────
export const commerceOrdersRelations = relations(commerceOrders, ({ one, many }) => ({
  customer: one(users, {
    fields: [commerceOrders.customerId],
    references: [users.id],
  }),
  vendor: one(adminVendorProfiles, {
    fields: [commerceOrders.vendorId],
    references: [adminVendorProfiles.id],
  }),
  items: many(commerceOrderItems),
  trackingEvents: many(commerceOrderTrackingEvents),
  customerNotifications: many(customerOrderNotifications),
  vendorNotifications: many(vendorOrderNotifications),
  deliveryRating: one(commerceOrderDeliveryRatings, {
    fields: [commerceOrders.id],
    references: [commerceOrderDeliveryRatings.orderId],
  }),
}));

// ─── Commerce Order Items ───────────────────────────────────────────────────────
export const commerceOrderItemsRelations = relations(commerceOrderItems, ({ one }) => ({
  order: one(commerceOrders, {
    fields: [commerceOrderItems.orderId],
    references: [commerceOrders.id],
  }),
  product: one(catalogProducts, {
    fields: [commerceOrderItems.productId],
    references: [catalogProducts.id],
  }),
}));

// ─── Commerce Order Tracking Events ─────────────────────────────────────────────
export const commerceOrderTrackingEventsRelations = relations(commerceOrderTrackingEvents, ({ one }) => ({
  order: one(commerceOrders, {
    fields: [commerceOrderTrackingEvents.orderId],
    references: [commerceOrders.id],
  }),
}));

// ─── Customer Order Notifications ───────────────────────────────────────────────
export const customerOrderNotificationsRelations = relations(customerOrderNotifications, ({ one }) => ({
  customer: one(users, {
    fields: [customerOrderNotifications.customerId],
    references: [users.id],
  }),
  order: one(commerceOrders, {
    fields: [customerOrderNotifications.orderId],
    references: [commerceOrders.id],
  }),
}));

// ─── Vendor Order Notifications ─────────────────────────────────────────────────
export const vendorOrderNotificationsRelations = relations(vendorOrderNotifications, ({ one }) => ({
  vendor: one(adminVendorProfiles, {
    fields: [vendorOrderNotifications.vendorId],
    references: [adminVendorProfiles.id],
  }),
  order: one(commerceOrders, {
    fields: [vendorOrderNotifications.orderId],
    references: [commerceOrders.id],
  }),
}));

// ─── Commerce Order Delivery Ratings ────────────────────────────────────────────
export const commerceOrderDeliveryRatingsRelations = relations(commerceOrderDeliveryRatings, ({ one }) => ({
  order: one(commerceOrders, {
    fields: [commerceOrderDeliveryRatings.orderId],
    references: [commerceOrders.id],
  }),
  customer: one(users, {
    fields: [commerceOrderDeliveryRatings.customerId],
    references: [users.id],
  }),
}));

// ─── Admin Notification Reads ───────────────────────────────────────────────────
export const adminNotificationReadsRelations = relations(adminNotificationReads, ({ one }) => ({
  admin: one(users, {
    fields: [adminNotificationReads.adminUserId],
    references: [users.id],
  }),
}));
