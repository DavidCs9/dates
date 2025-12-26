import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

// S3 Client
export const s3Client = new S3Client(awsConfig);

// DynamoDB Clients
const dynamoDBClient = new DynamoDBClient(awsConfig);
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// Configuration constants
export const AWS_CONFIG = {
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "coffee-date-chronicles-photos",
  DYNAMODB_TABLE_PREFIX:
    process.env.DYNAMODB_TABLE_PREFIX || "coffee-date-chronicles",
  get COFFEE_DATES_TABLE() {
    return `${this.DYNAMODB_TABLE_PREFIX}-coffee-dates`;
  },
  get PHOTOS_TABLE() {
    return `${this.DYNAMODB_TABLE_PREFIX}-photos`;
  },
} as const;

// Validate AWS configuration
export function validateAWSConfig(): void {
  const requiredEnvVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME",
    "DYNAMODB_TABLE_PREFIX",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing AWS environment variables: ${missingVars.join(", ")}`,
    );
  }
}
