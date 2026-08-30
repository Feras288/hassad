export type NotificationLanguage = "ar" | "en";
export type OrderNotificationStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const orderCopy: Record<NotificationLanguage, Record<OrderNotificationStatus, { title: string; message: string }>> = {
  ar: {
    pending: { title: "تم استلام الطلب", message: "تم استلام طلبك وهو بانتظار تأكيد المورد." },
    confirmed: { title: "تم تأكيد الطلب", message: "أكد المورد طلبك وبدأت متابعة تجهيزه." },
    processing: { title: "جاري تجهيز الطلب", message: "يقوم المورد بتجهيز منتجاتك للشحن." },
    shipped: { title: "تم شحن الطلب", message: "تم تسليم طلبك لشركة الشحن وهو في الطريق إليك." },
    delivered: { title: "تم توصيل الطلب", message: "تم تسجيل توصيل طلبك بنجاح." },
    cancelled: { title: "تم إلغاء الطلب", message: "تم تحديث حالة طلبك إلى ملغي." },
  },
  en: {
    pending: { title: "Order received", message: "We received your order and it is awaiting supplier confirmation." },
    confirmed: { title: "Order confirmed", message: "The supplier confirmed your order and has started preparing it." },
    processing: { title: "Order being prepared", message: "The supplier is preparing your items for dispatch." },
    shipped: { title: "Order shipped", message: "Your order has been handed to the shipping provider and is on its way." },
    delivered: { title: "Order delivered", message: "Your order has been marked as delivered successfully." },
    cancelled: { title: "Order cancelled", message: "Your order status has been updated to cancelled." },
  },
};

export function localizeOrderStatus(language: NotificationLanguage, status: OrderNotificationStatus, details?: { trackingNumber?: string | null; shippingProvider?: string | null; note?: string | null }) {
  const copy = orderCopy[language][status];
  const shipment = status === "shipped" && details?.trackingNumber
    ? language === "en"
      ? ` Tracking number: ${details.trackingNumber}${details.shippingProvider ? ` via ${details.shippingProvider}` : ""}.`
      : ` رقم التتبع: ${details.trackingNumber}${details.shippingProvider ? ` عبر ${details.shippingProvider}` : ""}.`
    : "";
  const note = details?.note?.trim()
    ? language === "en" ? ` Supplier note: ${details.note.trim()}` : ` ملاحظة المورد: ${details.note.trim()}`
    : "";
  return { title: copy.title, message: `${copy.message}${shipment}${note}` };
}

export function localizeCancellationDecision(language: NotificationLanguage, approved: boolean, orderNumber: string, response?: string | null) {
  const title = approved
    ? language === "en" ? "Cancellation approved" : "تمت الموافقة على الإلغاء"
    : language === "en" ? "Cancellation request declined" : "تم رفض طلب الإلغاء";
  const base = approved
    ? language === "en" ? `The supplier approved cancellation of order ${orderNumber}.` : `وافق المورد على إلغاء الطلب ${orderNumber}.`
    : language === "en" ? `The supplier declined cancellation of order ${orderNumber}.` : `رفض المورد طلب إلغاء الطلب ${orderNumber}.`;
  return { title, message: `${base}${response?.trim() ? ` ${response.trim()}` : ""}` };
}

export function localizeCancellationRequestForVendor(language: NotificationLanguage, customerName: string, orderNumber: string) {
  return language === "en"
    ? { title: "New cancellation request", message: `${customerName} requested cancellation of order ${orderNumber}. Review the request and make a decision.` }
    : { title: "طلب إلغاء جديد", message: `طلب ${customerName} إلغاء الطلب ${orderNumber}. راجع السبب واتخذ قرارك.` };
}

export function orderStatusEmailTemplate(language: NotificationLanguage, orderNumber: string, status: OrderNotificationStatus, details?: { trackingNumber?: string | null; shippingProvider?: string | null; note?: string | null }) {
  const notification = localizeOrderStatus(language, status, details);
  const greeting = language === "en" ? "Hello," : "مرحباً،";
  const footer = language === "en" ? "Thank you for choosing Hassad." : "شكراً لاختيارك حصاد.";
  return {
    subject: `${notification.title} — ${orderNumber}`,
    text: `${greeting}\n\n${notification.message}\n\n${footer}`,
  };
}
