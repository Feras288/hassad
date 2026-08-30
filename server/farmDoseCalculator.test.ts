import { describe, expect, it } from "vitest";
import { calculateFarmDose } from "../client/src/lib/farmDoseCalculator";
import { cropDosePresets } from "../client/src/lib/cropDosePresets";

describe("calculateFarmDose", () => {
  it("يحسب كمية السماد ويقدّر عدد الأكياس لمساحة بالمتر المربع", () => {
    expect(calculateFarmDose({ area: "2500", areaUnit: "m2", dose: "3", applicationUnit: "kg", doseBasis: "per_1000_m2", productUnit: "كيس 25 كجم" })).toEqual({ quantity: 7.5, packages: 1 });
  });

  it("يتعامل مع الأرقام العربية والهكتار ووحدة اللتر", () => {
    expect(calculateFarmDose({ area: "٢", areaUnit: "hectare", dose: "١٫٥", applicationUnit: "liter", doseBasis: "per_1000_m2", productUnit: "عبوة 5 لتر" })).toEqual({ quantity: 30, packages: 6 });
  });

  it("يدعم أساس الجرعة لكل هكتار ووحدة العبوة", () => {
    expect(calculateFarmDose({ area: "5000", areaUnit: "m2", dose: "2", applicationUnit: "pack", doseBasis: "per_hectare", productUnit: "عبوة" })).toEqual({ quantity: 1, packages: 1 });
  });

  it("يرفض القيم غير الصالحة بدلاً من إظهار تقدير مضلل", () => {
    expect(calculateFarmDose({ area: "", areaUnit: "m2", dose: "3", applicationUnit: "kg", doseBasis: "per_1000_m2", productUnit: "كيس 25 كجم" })).toBeNull();
  });

  it("يوفر قوالب محاصيل صالحة لملء الحاسبة مع إبقاء قيمها قابلة للتعديل", () => {
    expect(cropDosePresets.map((preset) => preset.crop)).toEqual(expect.arrayContaining(["خضروات", "أشجار مثمرة", "محاصيل حقلية", "بيوت محمية"]));
    const vegetablePreset = cropDosePresets.find((preset) => preset.id === "vegetable-growth")!;
    expect(calculateFarmDose({ area: "1000", areaUnit: "m2", dose: vegetablePreset.dose, applicationUnit: vegetablePreset.applicationUnit, doseBasis: vegetablePreset.doseBasis, productUnit: "كيس 25 كجم" })).toEqual({ quantity: 2, packages: 1 });
  });
});
