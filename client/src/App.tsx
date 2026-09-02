import { Switch, Route, Redirect } from "wouter";
import { ReactNode, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import { LoyaltyProvider } from "./contexts/LoyaltyContext";
import { VendorProductsProvider } from "./contexts/VendorProductsContext";
import { CommissionProvider } from "./contexts/CommissionContext";
import { AdminVendorsProvider } from "./contexts/AdminVendorsContext";
import { AdminProductsProvider } from "./contexts/AdminProductsContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import CartDrawer from "./components/CartDrawer";
import LanguageSwitcher from "./components/LanguageSwitcher";
import PublicPageScrollManager from "./components/PublicPageScrollManager";
import { useAuth } from "@/_core/hooks/useAuth";

// Core Public Pages (bundled immediately for instant load)
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

// Lazy-loaded Public Pages (loaded on-demand)
const DiagnosisPage = lazy(() => import("./pages/DiagnosisPage"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const StoryArticlePage = lazy(() => import("./pages/StoryArticlePage"));
const FooterInfoPage = lazy(() => import("./pages/FooterInfoPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));
const ProduceMarketplacePage = lazy(() => import("./pages/ProduceMarketplacePage"));
const SuppliersMap = lazy(() => import("./pages/SuppliersMap"));
const SupplierPending = lazy(() => import("./pages/SupplierPending"));

// Lazy-loaded Farmer Dashboard Pages
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const DashboardOrders = lazy(() => import("./pages/dashboard/DashboardOrders"));
const DashboardOrderDetail = lazy(() => import("./pages/dashboard/DashboardOrderDetail"));
const DashboardDiagnoses = lazy(() => import("./pages/dashboard/DashboardDiagnoses"));
const DashboardNotifications = lazy(() => import("./pages/dashboard/DashboardNotifications"));
const DashboardFavorites = lazy(() => import("./pages/dashboard/DashboardFavorites"));
const DashboardProfile = lazy(() => import("./pages/dashboard/DashboardProfile"));
const DashboardLoyalty = lazy(() => import("./pages/dashboard/DashboardLoyalty"));
const DashboardProduce = lazy(() => import("./pages/dashboard/DashboardProduce"));
const DashboardBookings = lazy(() => import("./pages/dashboard/DashboardBookings"));
const DashboardMessages = lazy(() => import("./pages/dashboard/DashboardMessages"));

// Lazy-loaded Vendor Dashboard Pages
const VendorDashboardHome = lazy(() => import("./pages/vendor/VendorDashboardHome"));
const VendorProducts = lazy(() => import("./pages/vendor/VendorProducts"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));
const VendorAnalytics = lazy(() => import("./pages/vendor/VendorAnalytics"));
const VendorSettings = lazy(() => import("./pages/vendor/VendorSettings"));
const VendorReviews = lazy(() => import("./pages/vendor/VendorReviews"));
const VendorServices = lazy(() => import("./pages/vendor/VendorServices"));
const ProviderBookings = lazy(() => import("./pages/vendor/ProviderBookings"));
const ProviderMessages = lazy(() => import("./pages/vendor/ProviderMessages"));
const VendorNotifications = lazy(() => import("./pages/vendor/VendorNotifications"));
const VendorCustomers = lazy(() => import("./pages/vendor/VendorCustomers"));
const VendorAddProduct = lazy(() => import("./pages/vendor/VendorAddProduct"));
const VendorEditProduct = lazy(() => import("./pages/vendor/VendorEditProduct"));
const VendorProductQuestions = lazy(() => import("./pages/vendor/VendorProductQuestions"));

// Lazy-loaded Admin Dashboard Pages
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminVendors = lazy(() => import("./pages/admin/AdminVendors"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminProductAvailabilityRequests = lazy(() => import("./pages/admin/AdminProductAvailabilityRequests"));
const AdminVendorAccountLinks = lazy(() => import("./pages/admin/AdminVendorAccountLinks"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminContactInquiries = lazy(() => import("./pages/admin/AdminContactInquiries"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));

/** Loading spinner shared by all route guards and lazy components. */
function GuardSpinner() {
  return (
    <div
      className="min-h-screen bg-[#F5F1E8]/30 grid place-items-center"
      role="status"
      aria-label="جاري التحقق من الصلاحيات"
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#2E7D32]/20 border-t-[#2E7D32] animate-spin" />
    </div>
  );
}

/** Protects routes that require any authenticated user (farmer dashboard). */
function AuthRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <GuardSpinner />;
  if (!user) return <Redirect to="/auth" />;

  return (
    <Suspense fallback={<GuardSpinner />}>
      {children}
    </Suspense>
  );
}

/** Protects routes that require admin role, scoping admin providers only to admin routes. */
function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <GuardSpinner />;
  if (!user) return <Redirect to="/auth" />;
  if (user.role !== "admin") return <Redirect to="/" />;

  return (
    <AdminVendorsProvider>
      <AdminProductsProvider>
        <CommissionProvider>
          <Suspense fallback={<GuardSpinner />}>
            {children}
          </Suspense>
        </CommissionProvider>
      </AdminProductsProvider>
    </AdminVendorsProvider>
  );
}

/** Protects routes that require an approved vendor/supplier account, scoping vendor products provider. */
function SupplierRouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <GuardSpinner />;
  if (user?.role === "admin") return <Redirect to="/admin" />;
  if (!user) return <Redirect to="/auth" />;
  if (user.role !== "vendor") return <Redirect to="/dashboard" />;
  if (!user.vendorId) return <Redirect to="/supplier-pending" />;

  return (
    <VendorProductsProvider>
      <Suspense fallback={<GuardSpinner />}>
        {children}
      </Suspense>
    </VendorProductsProvider>
  );
}

function Router() {
  return (
    <Suspense fallback={<GuardSpinner />}>
      <Switch>
        {/* Public Pages */}
        <Route path={"/"} component={Home} />
        <Route path={"/auth"} component={AuthPage} />
        <Route path={"/login"} component={AuthPage} />
        <Route path={"/register"} component={AuthPage} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/product" component={ProductDetail} />
        <Route path="/diagnosis" component={DiagnosisPage} />
        <Route path="/provider/:id" component={ProviderProfile} />
        <Route path="/provider" component={ProviderProfile} />
        <Route path="/booking" component={BookingPage} />
        <Route path="/booking/:serviceType" component={BookingPage} />
        <Route path="/info/stories" component={StoriesPage} />
        <Route path="/stories/:id" component={StoryArticlePage} />
        <Route path="/info/:slug" component={FooterInfoPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/help" component={HelpCenterPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/shop" component={MarketplacePage} />
        <Route path="/produce-marketplace" component={ProduceMarketplacePage} />
        <Route path="/produce-marketplace/:id" component={ProduceMarketplacePage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/supplier-pending" component={SupplierPending} />
        <Route path="/suppliers-map">{() => <AdminRouteGuard><SuppliersMap /></AdminRouteGuard>}</Route>
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/order-confirmation" component={OrderConfirmationPage} />
        <Route path="/dashboard/orders/:id">{() => <AuthRouteGuard><DashboardOrderDetail /></AuthRouteGuard>}</Route>

        {/* Farmer Dashboard — protected by AuthRouteGuard */}
        <Route path="/dashboard">{() => <AuthRouteGuard><DashboardHome /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/orders">{() => <AuthRouteGuard><DashboardOrders /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/diagnoses">{() => <AuthRouteGuard><DashboardDiagnoses /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/notifications">{() => <AuthRouteGuard><DashboardNotifications /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/services">{() => <AuthRouteGuard><DashboardBookings /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/favorites">{() => <AuthRouteGuard><DashboardFavorites /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/profile">{() => <AuthRouteGuard><DashboardProfile /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/messages">{() => <AuthRouteGuard><DashboardMessages /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/loyalty">{() => <AuthRouteGuard><DashboardLoyalty /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/produce">{() => <AuthRouteGuard><DashboardProduce /></AuthRouteGuard>}</Route>
        <Route path="/dashboard/settings">{() => <AuthRouteGuard><DashboardProfile /></AuthRouteGuard>}</Route>

        {/* Supplier/Vendor Dashboard */}
        <Route path="/vendor/dashboard">{() => <SupplierRouteGuard><VendorDashboardHome vendorType="supplier" /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/products/new">{() => <SupplierRouteGuard><VendorAddProduct /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/products/:id/edit">{() => <SupplierRouteGuard><VendorEditProduct /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/products">{() => <SupplierRouteGuard><VendorProducts /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/questions">{() => <SupplierRouteGuard><VendorProductQuestions /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/orders">{() => <SupplierRouteGuard><VendorOrders /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/analytics">{() => <SupplierRouteGuard><VendorAnalytics vendorType="supplier" /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/reviews">{() => <SupplierRouteGuard><VendorReviews vendorType="supplier" /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/customers">{() => <SupplierRouteGuard><VendorCustomers vendorType="supplier" /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/notifications">{() => <SupplierRouteGuard><VendorNotifications vendorType="supplier" /></SupplierRouteGuard>}</Route>
        <Route path="/vendor/settings">{() => <SupplierRouteGuard><VendorSettings vendorType="supplier" /></SupplierRouteGuard>}</Route>

        {/* Service Provider Dashboard — protected by SupplierRouteGuard */}
        <Route path="/provider-dashboard">{() => <SupplierRouteGuard><VendorDashboardHome vendorType="provider" /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/services">{() => <SupplierRouteGuard><VendorServices vendorType="provider" /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/orders">{() => <SupplierRouteGuard><ProviderBookings /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/messages">{() => <SupplierRouteGuard><ProviderMessages /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/analytics">{() => <SupplierRouteGuard><VendorAnalytics vendorType="provider" /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/reviews">{() => <SupplierRouteGuard><VendorReviews vendorType="provider" /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/notifications">{() => <SupplierRouteGuard><VendorNotifications vendorType="provider" /></SupplierRouteGuard>}</Route>
        <Route path="/provider-dashboard/settings">{() => <SupplierRouteGuard><VendorSettings vendorType="provider" /></SupplierRouteGuard>}</Route>

        {/* Admin Dashboard — protected by AdminRouteGuard */}
        <Route path="/admin">{() => <AdminRouteGuard><AdminHome /></AdminRouteGuard>}</Route>
        <Route path="/admin/users">{() => <AdminRouteGuard><AdminUsers /></AdminRouteGuard>}</Route>
        <Route path="/admin/vendors">{() => <AdminRouteGuard><AdminVendors /></AdminRouteGuard>}</Route>
        <Route path="/admin/products">{() => <AdminRouteGuard><AdminProducts /></AdminRouteGuard>}</Route>
        <Route path="/admin/orders">{() => <AdminRouteGuard><AdminOrders /></AdminRouteGuard>}</Route>
        <Route path="/admin/reports">{() => <AdminRouteGuard><AdminReports /></AdminRouteGuard>}</Route>
        <Route path="/admin/support">{() => <AdminRouteGuard><AdminSupport /></AdminRouteGuard>}</Route>
        <Route path="/admin/settings">{() => <AdminRouteGuard><AdminSettings /></AdminRouteGuard>}</Route>
        <Route path="/admin/categories">{() => <AdminRouteGuard><AdminCategories /></AdminRouteGuard>}</Route>
        <Route path="/admin/product-requests">{() => <AdminRouteGuard><AdminProductAvailabilityRequests /></AdminRouteGuard>}</Route>
        <Route path="/admin/vendor-accounts">{() => <AdminRouteGuard><AdminVendorAccountLinks /></AdminRouteGuard>}</Route>
        <Route path="/admin/articles">{() => <AdminRouteGuard><AdminArticles /></AdminRouteGuard>}</Route>
        <Route path="/admin/contact-inquiries">{() => <AdminRouteGuard><AdminContactInquiries /></AdminRouteGuard>}</Route>
        <Route path="/admin/notifications">{() => <AdminRouteGuard><AdminNotifications /></AdminRouteGuard>}</Route>

        <Route path={"404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <FavoritesProvider>
            <CartProvider>
              <OrdersProvider>
                <NotificationsProvider>
                  <MessagesProvider>
                    <LoyaltyProvider>
                      <TooltipProvider>
                        <Toaster />
                        <CartDrawer />
                        <PublicPageScrollManager />
                        <Router />
                        <LanguageSwitcher />
                      </TooltipProvider>
                    </LoyaltyProvider>
                  </MessagesProvider>
                </NotificationsProvider>
              </OrdersProvider>
            </CartProvider>
          </FavoritesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
