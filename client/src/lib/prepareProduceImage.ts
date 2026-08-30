const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export const isHeicImage = (file: File) => HEIC_MIME_TYPES.has(file.type.toLowerCase()) || /\.hei[cf]$/i.test(file.name);

export const isSupportedProduceImage = (file: File) => isHeicImage(file) || /^image\/(png|jpeg|webp)$/i.test(file.type);

export async function prepareProduceImage(file: File): Promise<File> {
  if (!isHeicImage(file)) return file;
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const fileName = file.name.replace(/\.hei[cf]$/i, "") || "produce-image";
  return new File([blob], `${fileName}.jpg`, { type: "image/jpeg" });
}
