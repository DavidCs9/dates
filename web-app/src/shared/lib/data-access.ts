import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, AWS_CONFIG } from './aws-config';

/**
 * Custom error classes for data access operations
 */
export class DataAccessError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DataAccessError';
  }
}

export class ItemNotFoundError extends DataAccessError {
  constructor(itemType: string, id: string) {
    super(`${itemType} with ID ${id} not found`);
    this.name = 'ItemNotFoundError';
  }
}

export class ValidationError extends DataAccessError {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Generic data access operations with error handling
 */
export class DataAccessLayer {
  /**
   * Get an item by primary key
   */
  static async getItem<T>(
    tableName: string,
    pk: string,
    sk: string
  ): Promise<T | null> {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: { PK: pk, SK: sk },
      });

      const result = await docClient.send(command);
      return result.Item as T | null;
    } catch (error) {
      throw new DataAccessError(
        `Failed to get item from ${tableName}`,
        error as Error
      );
    }
  }

  /**
   * Put an item into the table
   */
  static async putItem<T>(
    tableName: string,
    item: T & { PK: string; SK: string }
  ): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: item,
      });

      await docClient.send(command);
    } catch (error) {
      throw new DataAccessError(
        `Failed to put item into ${tableName}`,
        error as Error
      );
    }
  }

  /**
   * Update an item in the table
   */
  static async updateItem(
    tableName: string,
    pk: string,
    sk: string,
    updateExpression: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { PK: pk, SK: sk },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      await docClient.send(command);
    } catch (error) {
      throw new DataAccessError(
        `Failed to update item in ${tableName}`,
        error as Error
      );
    }
  }

  /**
   * Delete an item from the table
   */
  static async deleteItem(
    tableName: string,
    pk: string,
    sk: string
  ): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: { PK: pk, SK: sk },
      });

      await docClient.send(command);
    } catch (error) {
      throw new DataAccessError(
        `Failed to delete item from ${tableName}`,
        error as Error
      );
    }
  }

  /**
   * Query items using GSI
   */
  static async queryGSI<T>(
    tableName: string,
    indexName: string,
    gsiPK: string,
    gsiSK?: string,
    sortAscending: boolean = true
  ): Promise<T[]> {
    try {
      const keyConditionExpression = gsiSK
        ? 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk'
        : 'GSI1PK = :gsi1pk';

      const expressionAttributeValues: Record<string, any> = {
        ':gsi1pk': gsiPK,
      };

      if (gsiSK) {
        expressionAttributeValues[':gsi1sk'] = gsiSK;
      }

      const command = new QueryCommand({
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ScanIndexForward: sortAscending,
      });

      const result = await docClient.send(command);
      return (result.Items as T[]) || [];
    } catch (error) {
      throw new DataAccessError(
        `Failed to query GSI ${indexName} in ${tableName}`,
        error as Error
      );
    }
  }

  /**
   * Query items by partition key
   */
  static async queryByPK<T>(
    tableName: string,
    pk: string,
    sortAscending: boolean = true
  ): Promise<T[]> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': pk,
        },
        ScanIndexForward: sortAscending,
      });

      const result = await docClient.send(command);
      return (result.Items as T[]) || [];
    } catch (error) {
      throw new DataAccessError(
        `Failed to query by PK in ${tableName}`,
        error as Error
      );
    }
  }

  /**
   * Scan all items in a table (use with caution)
   */
  static async scanTable<T>(tableName: string): Promise<T[]> {
    try {
      const command = new ScanCommand({
        TableName: tableName,
      });

      const result = await docClient.send(command);
      return (result.Items as T[]) || [];
    } catch (error) {
      throw new DataAccessError(
        `Failed to scan table ${tableName}`,
        error as Error
      );
    }
  }
}

/**
 * Validation utilities
 */
export class DataValidator {
  /**
   * Validate required fields
   */
  static validateRequired(
    data: Record<string, any>,
    requiredFields: string[]
  ): void {
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        throw new ValidationError(`${field} is required`, field);
      }
    }
  }

  /**
   * Validate string length
   */
  static validateStringLength(
    value: string,
    fieldName: string,
    minLength: number = 1,
    maxLength: number = 1000
  ): void {
    if (value.length < minLength || value.length > maxLength) {
      throw new ValidationError(
        `${fieldName} must be between ${minLength} and ${maxLength} characters`,
        fieldName
      );
    }
  }

  /**
   * Validate rating value
   */
  static validateRating(rating: number, fieldName: string): void {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError(
        `${fieldName} must be an integer between 1 and 5`,
        fieldName
      );
    }
  }

  /**
   * Validate date
   */
  static validateDate(date: Date | string, fieldName: string): Date {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationError(`${fieldName} must be a valid date`, fieldName);
    }

    return parsedDate;
  }
}

/**
 * Data access layer is ready to use once AWS infrastructure is deployed via CloudFormation.
 * See /infra/README.md for deployment instructions.
 */