import type {
  CoffeeDate,
  CreateCoffeeDateRequest,
  UpdateCoffeeDateRequest,
} from "@/shared/types";

/**
 * Client-side service for coffee dates that calls the API routes
 * This should be used in client components instead of the server-side service
 */
class CoffeeDateClientService {
  private readonly baseUrl = "/api/coffee-dates";

  /**
   * Convert date strings back to Date objects
   */
  private convertDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertDates(item));
    }

    if (data && typeof data === "object") {
      const converted = { ...data };
      if (converted.visitDate && typeof converted.visitDate === "string") {
        converted.visitDate = new Date(converted.visitDate);
      }
      if (converted.createdAt && typeof converted.createdAt === "string") {
        converted.createdAt = new Date(converted.createdAt);
      }
      if (converted.updatedAt && typeof converted.updatedAt === "string") {
        converted.updatedAt = new Date(converted.updatedAt);
      }
      return converted;
    }

    return data;
  }

  /**
   * Get all coffee dates
   */
  async getAll(): Promise<CoffeeDate[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch coffee dates: ${response.statusText}`);
    }

    const data = await response.json();
    return this.convertDates(data);
  }

  /**
   * Get a coffee date by ID
   */
  async getById(id: string): Promise<CoffeeDate | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch coffee date: ${response.statusText}`);
    }

    const data = await response.json();
    return this.convertDates(data);
  }

  /**
   * Create a new coffee date
   */
  async create(data: CreateCoffeeDateRequest): Promise<CoffeeDate> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        visitDate: data.visitDate.toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to create coffee date: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return this.convertDates(result);
  }

  /**
   * Update a coffee date
   */
  async update(id: string, data: UpdateCoffeeDateRequest): Promise<CoffeeDate> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to update coffee date: ${response.statusText}`,
      );
    }

    const result = await response.json();
    return this.convertDates(result);
  }

  /**
   * Delete a coffee date
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to delete coffee date: ${response.statusText}`,
      );
    }
  }
}

export const coffeeDateClientService = new CoffeeDateClientService();
