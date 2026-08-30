import { systemRouter } from "../_core/systemRouter";
import { router } from "../_core/trpc";
import {
  authRouter,
  accountPreferencesRouter,
  platformPreferencesRouter,
} from "./auth.router";
import {
  serviceProvidersRouter,
  serviceBookingsRouter,
  serviceMessagingRouter,
} from "./services.router";
import { produceMarketplaceRouter } from "./produce.router";
import {
  contactInquiriesRouter,
  contentArticlesRouter,
} from "./content.router";
import {
  adminNotificationsRouter,
  adminManagementRouter,
  vendorAccountsRouter,
} from "./admin.router";
import {
  productsRouter,
  productAvailabilityRequestsRouter,
  productQuestionsRouter,
} from "./products.router";
import {
  ordersRouter,
  vendorNotificationsRouter,
  vendorNotificationPreferencesRouter,
} from "./orders.router";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  accountPreferences: accountPreferencesRouter,
  platformPreferences: platformPreferencesRouter,
  serviceProviders: serviceProvidersRouter,
  serviceBookings: serviceBookingsRouter,
  serviceMessaging: serviceMessagingRouter,
  produceMarketplace: produceMarketplaceRouter,
  contactInquiries: contactInquiriesRouter,
  adminNotifications: adminNotificationsRouter,
  contentArticles: contentArticlesRouter,
  adminManagement: adminManagementRouter,
  products: productsRouter,
  productAvailabilityRequests: productAvailabilityRequestsRouter,
  productQuestions: productQuestionsRouter,
  vendorNotifications: vendorNotificationsRouter,
  vendorNotificationPreferences: vendorNotificationPreferencesRouter,
  vendorAccounts: vendorAccountsRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
