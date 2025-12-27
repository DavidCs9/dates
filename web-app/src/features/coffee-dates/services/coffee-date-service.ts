import { v4 as uuidv4 } from "uuid";
import {
  AWS_CONFIG,
  DataAccessLayer,
  DataValidator,
  ItemNotFoundError,
  ValidationError,
} from "@/shared/lib";
import type {
  CoffeeDate,
  CoffeeDateRecord,
  CreateCoffeeDateRequest,
  Photo,
  PhotoRecord,
  UpdateCoffeeDateRequest,
} from "@/shared/types";
import type { CoffeeDateService as ICoffeeDateService } from "../types";

/**
 * Service for managing coffee date data operations
 */
export class CoffeeDateService implements ICoffeeDateService {
  private get coffeeDatesTable() {
    return AWS_CONFIG.COFFEE_DATES_TABLE;
  }

  private get photosTable() {
    return AWS_CONFIG.PHOTOS_TABLE;
  }

  /**
   * Get all coffee dates, sorted by visit date (newest first)
   */
  async getAll(): Promise<CoffeeDate[]> {
    try {
      console.log(
        `[CoffeeDateService] Querying table: ${this.coffeeDatesTable}`,
      );
      console.log(`[CoffeeDateService] GSI1PK: COFFEE_DATES`);

      const records = await DataAccessLayer.queryGSI<CoffeeDateRecord>(
        this.coffeeDatesTable,
        "GSI1",
        "COFFEE_DATES",
        undefined,
        false, // Sort descending (newest first)
      );

      console.log(
        `[CoffeeDateService] Found ${records.length} records:`,
        records.map((r) => ({ id: r.id, GSI1PK: r.GSI1PK })),
      );

      const coffeeDates = await Promise.all(
        records.map((record) => this.recordToCoffeeDate(record)),
      );

      return coffeeDates;
    } catch (error) {
      console.error("Failed to get all coffee dates:", error);
      throw error;
    }
  }

  /**
   * Get a coffee date by ID
   */
  async getById(id: string): Promise<CoffeeDate | null> {
    try {
      this.validateId(id);

      const record = await DataAccessLayer.getItem<CoffeeDateRecord>(
        this.coffeeDatesTable,
        `COFFEE_DATE#${id}`,
        "METADATA",
      );

      if (!record) {
        return null;
      }

      return await this.recordToCoffeeDate(record);
    } catch (error) {
      console.error(`Failed to get coffee date ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new coffee date
   */
  async create(data: CreateCoffeeDateRequest): Promise<CoffeeDate> {
    try {
      this.validateCreateRequest(data);

      const id = uuidv4();
      const now = new Date();
      const visitDate = DataValidator.validateDate(data.visitDate, "visitDate");

      // For now, we'll create the record without photos since photo upload
      // is handled by the PhotoService in subtask 3.4
      const record: CoffeeDateRecord = {
        PK: `COFFEE_DATE#${id}`,
        SK: "METADATA",
        GSI1PK: "COFFEE_DATES",
        GSI1SK: visitDate.toISOString(),
        id,
        cafeInfo: data.cafeInfo,
        photoIds: [], // Will be populated when photos are uploaded
        primaryPhotoId: "", // Will be set when photos are uploaded
        ratings: data.ratings,
        visitDate: visitDate.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await DataAccessLayer.putItem(this.coffeeDatesTable, record);

      return await this.recordToCoffeeDate(record);
    } catch (error) {
      console.error("Failed to create coffee date:", error);
      throw error;
    }
  }

  /**
   * Update an existing coffee date
   */
  async update(id: string, data: UpdateCoffeeDateRequest): Promise<CoffeeDate> {
    try {
      this.validateId(id);
      this.validateUpdateRequest(data);

      // Check if coffee date exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new ItemNotFoundError("Coffee date", id);
      }

      const now = new Date();
      const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
      const expressionAttributeNames: Record<string, string> = {
        "#updatedAt": "updatedAt",
      };
      const expressionAttributeValues: Record<string, unknown> = {
        ":updatedAt": now.toISOString(),
      };

      // Build update expression based on provided fields
      if (data.cafeInfo) {
        updateExpressions.push("#cafeInfo = :cafeInfo");
        expressionAttributeNames["#cafeInfo"] = "cafeInfo";
        expressionAttributeValues[":cafeInfo"] = data.cafeInfo;
      }

      if (data.ratings) {
        updateExpressions.push("#ratings = :ratings");
        expressionAttributeNames["#ratings"] = "ratings";
        expressionAttributeValues[":ratings"] = data.ratings;
      }

      if (data.visitDate) {
        const visitDate = DataValidator.validateDate(
          data.visitDate,
          "visitDate",
        );
        updateExpressions.push("#visitDate = :visitDate");
        updateExpressions.push("#GSI1SK = :GSI1SK");
        expressionAttributeNames["#visitDate"] = "visitDate";
        expressionAttributeNames["#GSI1SK"] = "GSI1SK";
        expressionAttributeValues[":visitDate"] = visitDate.toISOString();
        expressionAttributeValues[":GSI1SK"] = visitDate.toISOString();
      }

      if (data.primaryPhotoId) {
        updateExpressions.push("#primaryPhotoId = :primaryPhotoId");
        expressionAttributeNames["#primaryPhotoId"] = "primaryPhotoId";
        expressionAttributeValues[":primaryPhotoId"] = data.primaryPhotoId;
      }

      await DataAccessLayer.updateItem(
        this.coffeeDatesTable,
        `COFFEE_DATE#${id}`,
        "METADATA",
        `SET ${updateExpressions.join(", ")}`,
        expressionAttributeNames,
        expressionAttributeValues,
      );

      // Return updated coffee date
      const updated = await this.getById(id);
      if (!updated) {
        throw new Error("Failed to retrieve updated coffee date");
      }

      return updated;
    } catch (error) {
      console.error(`Failed to update coffee date ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a coffee date and its associated photos
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateId(id);

      // Check if coffee date exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new ItemNotFoundError("Coffee date", id);
      }

      // Delete associated photos first
      const photoRecords = await DataAccessLayer.queryGSI<PhotoRecord>(
        this.photosTable,
        "GSI1",
        `COFFEE_DATE#${id}`,
      );

      // Delete photo records
      await Promise.all(
        photoRecords.map((photo) =>
          DataAccessLayer.deleteItem(this.photosTable, photo.PK, photo.SK),
        ),
      );

      // Delete the coffee date record
      await DataAccessLayer.deleteItem(
        this.coffeeDatesTable,
        `COFFEE_DATE#${id}`,
        "METADATA",
      );
    } catch (error) {
      console.error(`Failed to delete coffee date ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add photo IDs to a coffee date
   */
  async addPhotos(coffeeDateId: string, photoIds: string[]): Promise<void> {
    try {
      this.validateId(coffeeDateId);

      if (!photoIds || photoIds.length === 0) {
        return;
      }

      // Get current coffee date to append to existing photo IDs
      const existing = await DataAccessLayer.getItem<CoffeeDateRecord>(
        this.coffeeDatesTable,
        `COFFEE_DATE#${coffeeDateId}`,
        "METADATA",
      );

      if (!existing) {
        throw new ItemNotFoundError("Coffee date", coffeeDateId);
      }

      const updatedPhotoIds = [...existing.photoIds, ...photoIds];
      const primaryPhotoId = existing.primaryPhotoId || photoIds[0];

      await DataAccessLayer.updateItem(
        this.coffeeDatesTable,
        `COFFEE_DATE#${coffeeDateId}`,
        "METADATA",
        "SET #photoIds = :photoIds, #primaryPhotoId = :primaryPhotoId, #updatedAt = :updatedAt",
        {
          "#photoIds": "photoIds",
          "#primaryPhotoId": "primaryPhotoId",
          "#updatedAt": "updatedAt",
        },
        {
          ":photoIds": updatedPhotoIds,
          ":primaryPhotoId": primaryPhotoId,
          ":updatedAt": new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error(
        `Failed to add photos to coffee date ${coffeeDateId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Convert DynamoDB record to CoffeeDate domain object
   */
  private async recordToCoffeeDate(
    record: CoffeeDateRecord,
  ): Promise<CoffeeDate> {
    // Get associated photos
    const photoRecords = await DataAccessLayer.queryGSI<PhotoRecord>(
      this.photosTable,
      "GSI1",
      `COFFEE_DATE#${record.id}`,
    );

    const photos: Photo[] = photoRecords.map((photoRecord) => ({
      id: photoRecord.id,
      s3Key: photoRecord.s3Key,
      s3Url: `https://${photoRecord.s3Bucket}.s3.amazonaws.com/${photoRecord.s3Key}`,
      thumbnailUrl: photoRecord.thumbnailS3Key
        ? `https://${photoRecord.s3Bucket}.s3.amazonaws.com/${photoRecord.thumbnailS3Key}`
        : `https://${photoRecord.s3Bucket}.s3.amazonaws.com/${photoRecord.s3Key}`,
      filename: photoRecord.filename,
      contentType: photoRecord.contentType,
      size: photoRecord.size,
      uploadedAt: new Date(photoRecord.uploadedAt),
    }));

    return {
      id: record.id,
      cafeInfo: record.cafeInfo,
      photos,
      primaryPhotoId: record.primaryPhotoId,
      ratings: record.ratings,
      visitDate: new Date(record.visitDate),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    };
  }

  /**
   * Validate coffee date ID
   */
  private validateId(id: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new ValidationError("Coffee date ID is required", "id");
    }
  }

  /**
   * Validate create request data
   */
  private validateCreateRequest(data: CreateCoffeeDateRequest): void {
    DataValidator.validateRequired(data as unknown as Record<string, unknown>, [
      "cafeInfo",
      "ratings",
      "visitDate",
    ]);

    // Validate cafe info
    if (!data.cafeInfo.name || data.cafeInfo.name.trim() === "") {
      throw new ValidationError("Cafe name is required", "cafeInfo.name");
    }

    DataValidator.validateStringLength(
      data.cafeInfo.name,
      "cafeInfo.name",
      1,
      200,
    );

    // Validate ratings
    DataValidator.validateRating(data.ratings.coffee, "ratings.coffee");
    if (data.ratings.dessert !== undefined) {
      DataValidator.validateRating(data.ratings.dessert, "ratings.dessert");
    }

    // Validate visit date
    DataValidator.validateDate(data.visitDate, "visitDate");

    // Validate primary photo index if photos are provided
    if (data.photos && data.photos.length > 0) {
      if (
        data.primaryPhotoIndex < 0 ||
        data.primaryPhotoIndex >= data.photos.length
      ) {
        throw new ValidationError(
          "Primary photo index must be within the range of uploaded photos",
          "primaryPhotoIndex",
        );
      }
    }
  }

  /**
   * Validate update request data
   */
  private validateUpdateRequest(data: UpdateCoffeeDateRequest): void {
    // At least one field must be provided
    if (
      !data.cafeInfo &&
      !data.ratings &&
      !data.visitDate &&
      !data.primaryPhotoId
    ) {
      throw new ValidationError(
        "At least one field must be provided for update",
      );
    }

    // Validate cafe info if provided
    if (data.cafeInfo) {
      if (!data.cafeInfo.name || data.cafeInfo.name.trim() === "") {
        throw new ValidationError("Cafe name is required", "cafeInfo.name");
      }
      DataValidator.validateStringLength(
        data.cafeInfo.name,
        "cafeInfo.name",
        1,
        200,
      );
    }

    // Validate ratings if provided
    if (data.ratings) {
      DataValidator.validateRating(data.ratings.coffee, "ratings.coffee");
      if (data.ratings.dessert !== undefined) {
        DataValidator.validateRating(data.ratings.dessert, "ratings.dessert");
      }
    }

    // Validate visit date if provided
    if (data.visitDate) {
      DataValidator.validateDate(data.visitDate, "visitDate");
    }

    // Validate primary photo ID if provided
    if (data.primaryPhotoId && typeof data.primaryPhotoId !== "string") {
      throw new ValidationError(
        "Primary photo ID must be a string",
        "primaryPhotoId",
      );
    }
  }
}

// Export singleton instance
export const coffeeDateService = new CoffeeDateService();
