/**
 * Compress an image file to a target size using canvas.
 * Returns a JPEG Blob ≤ maxSizeKB (default 200KB).
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  maxSizeKB = 100
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  // Scale down proportionally
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Iteratively lower quality until under target size
  let quality = 0.85;
  let blob = await canvas.convertToBlob({ type: "image/jpeg", quality });

  while (blob.size > maxSizeKB * 1024 && quality > 0.1) {
    quality -= 0.1;
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  }

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}
