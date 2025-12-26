import type { AuthResult } from '@/shared/types';

export interface AuthService {
  authenticate(password: string): Promise<AuthResult>;
  verifySession(): Promise<boolean>;
  logout(): Promise<void>;
}

export interface RatingProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  max?: number;
}

export * from '@/shared/types';