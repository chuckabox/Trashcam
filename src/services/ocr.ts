/**
 * OCR stub.
 *
 * Real integration options:
 *   A) MLKit on-device: `@react-native-ml-kit/text-recognition` (requires prebuild).
 *   B) Cloud: Claude Vision API or Google Vision - POST base64 image, receive text.
 *
 * Usage pattern: call after YOLO crops the bounding-box region from the snapped photo,
 * pass that crop to `recognizeText(uri)`.
 */

export async function recognizeText(_imageUri: string): Promise<string | undefined> {
  await new Promise((r) => setTimeout(r, 200));
  const samples = ['', '', 'BEST BY 12/25', 'PET 1', 'RECYCLE', '500ML'];
  return samples[Math.floor(Math.random() * samples.length)] || undefined;
}
