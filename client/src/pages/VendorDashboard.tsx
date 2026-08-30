// ===================================================
// Hasaad Platform — Vendor Dashboard Router/Wrapper
// Routes vendor pages based on path and vendor type
// ===================================================
import { useLocation } from "wouter";
import VendorDashboardHome from "./vendor/VendorDashboardHome";
import VendorProducts from "./vendor/VendorProducts";
import VendorOrders from "./vendor/VendorOrders";
import VendorAnalytics from "./vendor/VendorAnalytics";
import VendorSettings from "./vendor/VendorSettings";
import VendorReviews from "./vendor/VendorReviews";
import VendorServices from "./vendor/VendorServices";
import VendorNotifications from "./vendor/VendorNotifications";
import VendorCustomers from "./vendor/VendorCustomers";

interface VendorDashboardProps {
  vendorType?: "supplier" | "provider";
  subPage?: string;
}

export default function VendorDashboard({ vendorType = "supplier", subPage }: VendorDashboardProps) {
  const [location] = useLocation();

  // Determine vendor type from URL if not passed as prop
  const isProvider =
    vendorType === "provider" ||
    location.startsWith("/provider-dashboard");

  const type = isProvider ? "provider" : "supplier";

  // Determine sub-page from URL
  const path = location;

  if (path.includes("/products")) return <VendorProducts />;
  if (path.includes("/orders")) return <VendorOrders />;
  if (path.includes("/analytics")) return <VendorAnalytics vendorType={type} />;
  if (path.includes("/settings")) return <VendorSettings vendorType={type} />;
  if (path.includes("/reviews")) return <VendorReviews vendorType={type} />;
  if (path.includes("/services")) return <VendorServices vendorType={type} />;
  if (path.includes("/notifications")) return <VendorNotifications vendorType={type} />;
  if (path.includes("/customers")) return <VendorCustomers vendorType={type} />;

  return <VendorDashboardHome vendorType={type} />;
}
