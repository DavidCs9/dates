import type {
  CoffeeDate,
  CreateCoffeeDateRequest,
  UpdateCoffeeDateRequest,
} from "@/shared/types";

export interface CoffeeDateService {
  getAll(): Promise<CoffeeDate[]>;
  getById(id: string): Promise<CoffeeDate | null>;
  create(data: CreateCoffeeDateRequest): Promise<CoffeeDate>;
  update(id: string, data: UpdateCoffeeDateRequest): Promise<CoffeeDate>;
  delete(id: string): Promise<void>;
}

export interface MemoryCardProps {
  coffeeDate: CoffeeDate;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAuthenticated?: boolean;
  /** Whether this card should have priority image loading (for above-the-fold content) */
  isPriority?: boolean;
}

export * from "@/shared/types";
