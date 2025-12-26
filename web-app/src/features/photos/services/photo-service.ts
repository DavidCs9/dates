import { v4 as uuidv4 } from 'uuid';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import {
  s3Client,
  DataAccessLayer,
  DataValidator,
  ValidationError,
  ItemNotFoundError,
  AWS_CONFIG,
} from '@/shared/lib';
import type { Photo, PhotoRecord } from '@/shared/types';
import type { PhotoService as IPhotoService } from '../types';

/**
 * Service for managing photo storage and operations
 */
export class PhotoService implements IPhotoService {
  private readonly photosTable = AWS_CONFIG.PHOTOS_TABLE;
  private readonly bucketName = AWS_CONFIG.S3_BUCKET_NAME;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly thumbnailSize = { width: 400, height: 400 };

  /**
   * Upload multiple photos and associate them with a coffee date
   */
  async uploadMultiple(files: File[], coffeeDateId?: string): Promise<Photo[]> {
    try {
      this.validateFiles(files);

      const uploadPromises = files.map(file => this.uploadSingle(file, coffeeDateId));
      const photos = await Promise.all(uploadPromises);

      return photos;
    } catch (error) {
      console.error('Failed to upload multiple photos:', error);
      throw error;
    }
  }

  /**
   * Upload a single photo
   */
  private async uploadSingle(file: File, coffeeDateId?: string): Promise<Photo> {
    try {
      this.validateFile(file);

      const photoId = uuidv4();
      const now = new Date();
      const dateFolder = this.getDateFolder(now);
      
      // Generate S3 keys
      const originalKey = `originals/${dateFolder}/${photoId}-${file.name}`;
      const thumbnailKey = `thumbnails/${dateFolder}/${photoId}-thumb.jpg`;

      // Process image and create thumbnail
      const fileBuffer = await this.fileToBuffer(file);
      const thumbnailBuffer = await this.generateThumbnailBuffer(fileBuffer);

      // Upload original image
      await this.uploadToS3(originalKey, fileBuffer, file.type);

      // Upload thumbnail
      await this.uploadToS3(thumbnailKey, thumbnailBuffer, 'image/jpeg');

      // Create photo record
      const photoRecord: PhotoRecord = {
        PK: `PHOTO#${photoId}`,
        SK: 'METADATA',
        GSI1PK: coffeeDateId ? `COFFEE_DATE#${coffeeDateId}` : 'UNASSIGNED',
        GSI1SK: `PHOTO#${photoId}`,
        id: photoId,
        coffeeDateId: coffeeDateId || '',
        s3Key: originalKey,
        s3Bucket: this.bucketName,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        thumbnailS3Key: thumbnailKey,
        uploadedAt: now.toISOString(),
      };

      await DataAccessLayer.putItem(this.photosTable, photoRecord);

      // Convert to Photo domain object
      return this.recordToPhoto(photoRecord);
    } catch (error) {
      console.error(`Failed to upload photo ${file.name}:`, error);
      throw error;
    }
  }

  /**
   * Delete a photo and its associated S3 objects
   */
  async delete(photoId: string): Promise<void> {
    try {
      this.validatePhotoId(photoId);

      // Get photo record
      const photoRecord = await DataAccessLayer.getItem<PhotoRecord>(
        this.photosTable,
        `PHOTO#${photoId}`,
        'METADATA'
      );

      if (!photoRecord) {
        throw new ItemNotFoundError('Photo', photoId);
      }

      // Delete S3 objects
      await Promise.all([
        this.deleteFromS3(photoRecord.s3Key),
        photoRecord.thumbnailS3Key ? this.deleteFromS3(photoRecord.thumbnailS3Key) : Promise.resolve(),
      ]);

      // Delete photo record
      await DataAccessLayer.deleteItem(
        this.photosTable,
        `PHOTO#${photoId}`,
        'METADATA'
      );
    } catch (error) {
      console.error(`Failed to delete photo ${photoId}:`, error);
      throw error;
    }
  }

  /**
   * Generate thumbnail for an existing S3 object
   */
  async generateThumbnail(s3Key: string): Promise<string> {
    try {
      if (!s3Key) {
        throw new ValidationError('S3 key is required', 's3Key');
      }

      // Get original image from S3
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await s3Client.send(getCommand);
      if (!response.Body) {
        throw new Error('Failed to retrieve image from S3');
      }

      // Convert stream to buffer
      const imageBuffer = await this.streamToBuffer(response.Body as any);

      // Generate thumbnail
      const thumbnailBuffer = await this.generateThumbnailBuffer(imageBuffer);

      // Generate thumbnail key
      const pathParts = s3Key.split('/');
      const filename = pathParts[pathParts.length - 1];
      const dateFolder = pathParts[1]; // Assuming structure: originals/YYYY/MM/DD/filename
      const thumbnailKey = `thumbnails/${dateFolder}/thumb-${filename}`;

      // Upload thumbnail
      await this.uploadToS3(thumbnailKey, thumbnailBuffer, 'image/jpeg');

      return thumbnailKey;
    } catch (error) {
      console.error(`Failed to generate thumbnail for ${s3Key}:`, error);
      throw error;
    }
  }

  /**
   * Get signed URL for private S3 object access
   */
  async getSignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!s3Key) {
        throw new ValidationError('S3 key is required', 's3Key');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error(`Failed to generate signed URL for ${s3Key}:`, error);
      throw error;
    }
  }

  /**
   * Get photos by coffee date ID
   */
  async getPhotosByCoffeeDateId(coffeeDateId: string): Promise<Photo[]> {
    try {
      this.validatePhotoId(coffeeDateId);

      const photoRecords = await DataAccessLayer.queryGSI<PhotoRecord>(
        this.photosTable,
        'GSI1',
        `COFFEE_DATE#${coffeeDateId}`
      );

      return photoRecords.map(record => this.recordToPhoto(record));
    } catch (error) {
      console.error(`Failed to get photos for coffee date ${coffeeDateId}:`, error);
      throw error;
    }
  }

  /**
   * Associate photos with a coffee date
   */
  async associateWithCoffeeDate(photoIds: string[], coffeeDateId: string): Promise<void> {
    try {
      this.validatePhotoId(coffeeDateId);

      const updatePromises = photoIds.map(photoId =>
        DataAccessLayer.updateItem(
          this.photosTable,
          `PHOTO#${photoId}`,
          'METADATA',
          'SET #coffeeDateId = :coffeeDateId, #GSI1PK = :GSI1PK',
          {
            '#coffeeDateId': 'coffeeDateId',
            '#GSI1PK': 'GSI1PK',
          },
          {
            ':coffeeDateId': coffeeDateId,
            ':GSI1PK': `COFFEE_DATE#${coffeeDateId}`,
          }
        )
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error(`Failed to associate photos with coffee date ${coffeeDateId}:`, error);
      throw error;
    }
  }

  /**
   * Convert PhotoRecord to Photo domain object
   */
  private recordToPhoto(record: PhotoRecord): Photo {
    return {
      id: record.id,
      s3Key: record.s3Key,
      s3Url: `https://${record.s3Bucket}.s3.amazonaws.com/${record.s3Key}`,
      thumbnailUrl: record.thumbnailS3Key
        ? `https://${record.s3Bucket}.s3.amazonaws.com/${record.thumbnailS3Key}`
        : `https://${record.s3Bucket}.s3.amazonaws.com/${record.s3Key}`,
      filename: record.filename,
      contentType: record.contentType,
      size: record.size,
      uploadedAt: new Date(record.uploadedAt),
    };
  }

  /**
   * Upload buffer to S3
   */
  private async uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
  }

  /**
   * Delete object from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Generate thumbnail buffer from image buffer
   */
  private async generateThumbnailBuffer(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(this.thumbnailSize.width, this.thumbnailSize.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * Convert File to Buffer
   */
  private async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Get date folder path for S3 organization
   */
  private getDateFolder(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /**
   * Validate multiple files
   */
  private validateFiles(files: File[]): void {
    if (!files || files.length === 0) {
      throw new ValidationError('At least one file is required', 'files');
    }

    files.forEach((file, index) => {
      try {
        this.validateFile(file);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(`File ${index + 1}: ${error.message}`, `files[${index}]`);
        }
        throw error;
      }
    });
  }

  /**
   * Validate single file
   */
  private validateFile(file: File): void {
    if (!file) {
      throw new ValidationError('File is required', 'file');
    }

    if (file.size > this.maxFileSize) {
      throw new ValidationError(
        `File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`,
        'file.size'
      );
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new ValidationError(
        `File type must be one of: ${this.allowedMimeTypes.join(', ')}`,
        'file.type'
      );
    }
  }

  /**
   * Validate photo ID
   */
  private validatePhotoId(photoId: string): void {
    if (!photoId || typeof photoId !== 'string' || photoId.trim() === '') {
      throw new ValidationError('Photo ID is required', 'photoId');
    }
  }
}

// Export singleton instance
export const photoService = new PhotoService();