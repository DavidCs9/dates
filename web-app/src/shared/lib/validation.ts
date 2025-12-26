// Validation utilities for Coffee Date Chronicles

export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function isValidCafeName(name: string): boolean {
  return typeof name === "string" && name.trim().length > 0;
}

export function isValidImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
}

export function isValidImageFormat(contentType: string): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(contentType);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
