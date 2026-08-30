// واجهات بيانات مقدم الخدمة. تُحمّل الملفات العامة من tRPC ولا تحفظ سجلات تجريبية هنا.

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  serviceType: string;
  location: string;
  helpful: number;
  verified: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  duration: string;
  icon: string;
  popular?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  location: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  icon: string;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  yearsExperience: number;
  responseTime: string;
  location: string;
  city: string;
  bio: string;
  skills: string[];
  languages: string[];
  availability: "available" | "busy" | "unavailable";
  verified: boolean;
  topRated: boolean;
  priceRange: string;
  successRate: number;
  repeatClients: number;
  services: Service[];
  reviews: Review[];
  portfolio: PortfolioItem[];
  certifications: Certification[];
  crops: string[];
}

export const PROVIDERS: Provider[] = [];
export const getProvider = (id: string): Provider | undefined => PROVIDERS.find((provider) => provider.id === id);
export const getProvidersBySpecialty = (specialty: string): Provider[] => PROVIDERS.filter((provider) => provider.specialty === specialty);
