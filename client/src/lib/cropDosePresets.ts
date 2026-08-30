/**
 * Editable estimate templates for the calculator UI. They are deliberately labelled as starting values;
 * the farmer must match them to the product label and local agronomist guidance.
 */
import type { ApplicationUnit, DoseBasis } from "./farmDoseCalculator";

export type CropDosePreset = {
  id: string;
  crop: string;
  stage: string;
  dose: string;
  applicationUnit: ApplicationUnit;
  doseBasis: DoseBasis;
  note: string;
};

export const cropDosePresets: CropDosePreset[] = [
  { id: "vegetable-growth", crop: "خضروات", stage: "نمو خضري", dose: "2", applicationUnit: "kg", doseBasis: "per_1000_m2", note: "قيمة بداية تقديرية قابلة للتعديل" },
  { id: "fruit-tree-care", crop: "أشجار مثمرة", stage: "تغذية دورية", dose: "1", applicationUnit: "kg", doseBasis: "per_1000_m2", note: "قيمة بداية تقديرية قابلة للتعديل" },
  { id: "field-crops", crop: "محاصيل حقلية", stage: "نمو عام", dose: "2", applicationUnit: "kg", doseBasis: "per_1000_m2", note: "قيمة بداية تقديرية قابلة للتعديل" },
  { id: "greenhouse", crop: "بيوت محمية", stage: "دعم النمو", dose: "1.5", applicationUnit: "kg", doseBasis: "per_1000_m2", note: "قيمة بداية تقديرية قابلة للتعديل" },
];
