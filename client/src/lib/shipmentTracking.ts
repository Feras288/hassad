/** Creates official carrier tracking links from the carrier label entered by the supplier. */
export function getShipmentTrackingUrl(provider: string | null | undefined, trackingNumber: string | null | undefined) {
  const tracking = trackingNumber?.trim();
  if (!tracking) return null;
  const normalized = (provider ?? "").trim().toLocaleLowerCase("ar-SA");
  const encoded = encodeURIComponent(tracking);

  if (normalized.includes("spl") || normalized.includes("البريد السعودي") || normalized.includes("سبل")) {
    return `https://splonline.com.sa/ar/shipmentdetailsstatic/?tid=${encoded}`;
  }
  if (normalized.includes("dhl")) return `https://www.dhl.com/sa-en/home/tracking.html?tracking-id=${encoded}`;
  if (normalized.includes("aramex") || normalized.includes("ارامكس") || normalized.includes("أرامكس") || normalized.includes("إرامكس")) return "https://www.aramex.com/sa/en/track/shipments";
  if (normalized.includes("smsa") || normalized.includes("سمسا")) return "https://www.smsaexpress.com/sa/ar/tracking/";
  if (normalized.includes("naqel") || normalized.includes("ناقل")) return "https://www.naqelexpress.com/track-shipment/";
  return null;
}
