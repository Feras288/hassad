// واجهات رحلة الحجز. الخدمات والمواعيد المتاحة لا تُخزَّن كبيانات تجريبية في العميل.

export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bg: string;
  priceRange: string;
  duration: string;
  popular?: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  visits: string;
  features: string[];
  recommended?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  role: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  availability: "available" | "busy" | "away";
  availabilityText: string;
  priceRange: string;
  avatar: string;
  verified: boolean;
  completedJobs: number;
  responseTime: string;
  tags: string[];
  serviceTypes: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
}

export const serviceTypes: ServiceType[] = [];
export const servicePackages: Record<string, ServicePackage[]> = {};
export const providers: Provider[] = [];
export const timeSlots: TimeSlot[] = [];
export const arabicMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
export const arabicDays = ["أح", "إث", "ثل", "أر", "خم", "جم", "س"];

export interface BookingState {
  step: 1 | 2 | 3 | 4;
  serviceType: ServiceType | null;
  package: ServicePackage | null;
  provider: Provider | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
  location: string;
  farmSize: string;
  notes: string;
  contactName: string;
  contactPhone: string;
}
