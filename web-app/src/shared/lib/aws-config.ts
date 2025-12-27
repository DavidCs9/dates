import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getRequiredEnv } from "./env";

// Lazy initialization to ensure environment variables are loaded
let s3ClientInstance: S3Client | null = null;
let docClientInstance: DynamoDBDocumentClient | null = null;
let awsConfigInstance: any | null = null;

function initializeAWSConfig() {
  if (awsConfigInstance) return awsConfigInstance;

  awsConfigInstance = {
    region: getRequiredEnv("AWS_REGION"),
    credentials: {
      accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
    },
  };

  return awsConfigInstance;
}

// S3 Client with lazy initialization
export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    const awsConfig = initializeAWSConfig();
    s3ClientInstance = new S3Client(awsConfig);
  }
  return s3ClientInstance;
}

// DynamoDB Document Client with lazy initialization
export function getDocClient(): DynamoDBDocumentClient {
  if (!docClientInstance) {
    const awsConfig = initializeAWSConfig();
    const dynamoDBClient = new DynamoDBClient(awsConfig);
    docClientInstance = DynamoDBDocumentClient.from(dynamoDBClient);
  }
  return docClientInstance;
}

// For backward compatibility, export the clients directly
export const s3Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    return getS3Client()[prop as keyof S3Client];
  },
});

export const docClient = new Proxy({} as DynamoDBDocumentClient, {
  get(_target, prop) {
    return getDocClient()[prop as keyof DynamoDBDocumentClient];
  },
});

// Configuration constants with lazy initialization
export const AWS_CONFIG = {
  get S3_BUCKET_NAME() {
    return getRequiredEnv("S3_BUCKET_NAME");
  },
  get DYNAMODB_TABLE_PREFIX() {
    return getRequiredEnv("DYNAMODB_TABLE_PREFIX");
  },
  get COFFEE_DATES_TABLE() {
    return `${this.DYNAMODB_TABLE_PREFIX}-coffee-dates`;
  },
  get PHOTOS_TABLE() {
    return `${this.DYNAMODB_TABLE_PREFIX}-photos`;
  },
} as const;
