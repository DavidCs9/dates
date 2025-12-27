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
   * Get all coffee dates
   */
  async getAll(): Promise<CoffeeDate[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch coffee dates: ${response.statusText}`);
    }

    return response.json();
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

    return response.json();
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

    return response.json();
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

    return response.json();
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
