// واجهات نتائج التشخيص. لا تعرض المنصة نتائج نموذجية على أنها تحليل فعلي.

export interface DiagnosisResult {
  id: string;
  diseaseName: string;
  scientificName: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  severityLabel: string;
  severityColor: string;
  cropType: string;
  affectedArea: number;
  description: string;
  symptoms: string[];
  causes: string[];
  immediateActions: string[];
  treatments: Treatment[];
  preventionTips: string[];
  estimatedYieldLoss: string;
  spreadRisk: "low" | "medium" | "high";
  spreadRiskLabel: string;
  urgency: "routine" | "soon" | "urgent" | "critical";
  urgencyLabel: string;
  urgencyColor: string;
  recommendedProducts: RecommendedProduct[];
  expertConsultation: boolean;
  detectedAt: string;
  analysisId: string;
}

export interface Treatment {
  type: "chemical" | "organic" | "biological" | "cultural";
  typeLabel: string;
  typeColor: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  badge?: string;
}

export const SAMPLE_DIAGNOSES: DiagnosisResult[] = [];
export const CROP_TYPES = [
  { id: "tomato", name: "طماطم", icon: "🍅" },
  { id: "wheat", name: "قمح", icon: "🌾" },
  { id: "palm", name: "نخيل", icon: "🌴" },
  { id: "cucumber", name: "خيار", icon: "🥒" },
  { id: "pepper", name: "فلفل", icon: "🫑" },
  { id: "other", name: "محصول آخر", icon: "🌱" },
] as const;
export const SAMPLE_IMAGES: Array<{ id: string; label: string; url: string; resultId: string }> = [];
export const getDiagnosisResult = (id: string): DiagnosisResult | undefined => SAMPLE_DIAGNOSES.find((result) => result.id === id);
export const getRandomDiagnosis = (): DiagnosisResult | undefined => undefined;
