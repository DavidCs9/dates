// Environment variable validation and access

export const ENV = {
  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "coffee-date-chronicles-photos",
  DYNAMODB_TABLE_PREFIX:
    process.env.DYNAMODB_TABLE_PREFIX || "coffee-date-chronicles",

  // Google Maps API (client-side)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",

  // Authentication
  AUTH_PASSWORD: process.env.AUTH_PASSWORD || "",
  AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET || "",

  // Next.js
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
} as const;

export function validateServerEnv(): void {
  const requiredServerVars = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME",
    "DYNAMODB_TABLE_PREFIX",
    "AUTH_PASSWORD",
    "AUTH_SESSION_SECRET",
  ];

  const missingVars = requiredServerVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing required server environment variables: ${missingVars.join(", ")}`,
    );
  }
}

export function validateClientEnv(): void {
  const requiredClientVars = ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"];

  const missingVars = requiredClientVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing required client environment variables: ${missingVars.join(", ")}`,
    );
  }
}
