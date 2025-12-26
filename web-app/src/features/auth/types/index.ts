import type { AuthResult } from "@/shared/types";

export interface AuthService {
  authenticate(password: string): Promise<AuthResult>;
  verifySession(token?: string): Promise<boolean>;
  logout(token?: string): Promise<void>;
}

export interface RatingProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  max?: number;
}

export * from "@/shared/types";
