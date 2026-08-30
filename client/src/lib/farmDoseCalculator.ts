/** Pure calculation helpers for the farm dose estimator. Values are estimates, never agronomic prescriptions. */
export type AreaUnit = "m2" | "hectare";
export type ApplicationUnit = "kg" | "liter" | "pack";
export type DoseBasis = "per_1000_m2" | "per_hectare";

const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
export const toLatinDigits = (value: string) => value
  .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
  .replace(/[٫،]/g, ".")
  .trim();

export function packageSize(unit: string, applicationUnit: ApplicationUnit) {
  const normalized = toLatinDigits(unit).toLowerCase();
  if (applicationUnit === "pack") return 1;
  const pattern = applicationUnit === "kg" ? /(\d+(?:\.\d+)?)\s*(?:كجم|كيلو|kg)/i : /(\d+(?:\.\d+)?)\s*(?:لتر|ليتر|liter|l)/i;
  const match = normalized.match(pattern);
  return match ? Number(match[1]) : null;
}

export function calculateFarmDose(input: { area: string; areaUnit: AreaUnit; dose: string; applicationUnit: ApplicationUnit; doseBasis: DoseBasis; productUnit: string }) {
  const areaValue = Number(toLatinDigits(input.area));
  const doseValue = Number(toLatinDigits(input.dose));
  if (!Number.isFinite(areaValue) || !Number.isFinite(doseValue) || areaValue <= 0 || doseValue <= 0) return null;
  const squareMeters = input.areaUnit === "hectare" ? areaValue * 10_000 : areaValue;
  const multiplier = input.doseBasis === "per_hectare" ? squareMeters / 10_000 : squareMeters / 1_000;
  const quantity = multiplier * doseValue;
  const size = packageSize(input.productUnit, input.applicationUnit);
  return { quantity, packages: input.applicationUnit === "pack" ? Math.ceil(quantity) : size ? Math.ceil(quantity / size) : null };
}
