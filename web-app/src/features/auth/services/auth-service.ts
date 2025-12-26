import { ENV } from "@/shared/lib/env";
import type { AuthResult, AuthService } from "../types";

// Simple session storage using in-memory store
// In production, this would use Redis or database
const activeSessions = new Map<string, { expiresAt: Date }>();

export class SimpleAuthService implements AuthService {
  private readonly password: string;

  constructor() {
    this.password = ENV.AUTH_PASSWORD || "dev-password";

    if (!ENV.AUTH_PASSWORD) {
      console.warn("AUTH_PASSWORD should be configured for production");
    }
  }

  async authenticate(password: string): Promise<AuthResult> {
    if (password !== this.password) {
      return { success: false };
    }

    // Generate session token
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    activeSessions.set(token, { expiresAt });

    return {
      success: true,
      token,
      expiresAt,
    };
  }

  async verifySession(token?: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const session = activeSessions.get(token);
    if (!session) {
      return false;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      activeSessions.delete(token);
      return false;
    }

    return true;
  }

  async logout(token?: string): Promise<void> {
    if (token) {
      activeSessions.delete(token);
    }
  }

  private generateSessionToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  // Clean up expired sessions periodically
  static cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of activeSessions.entries()) {
      if (session.expiresAt < now) {
        activeSessions.delete(token);
      }
    }
  }
}

// Export singleton instance
export const authService = new SimpleAuthService();

// Cleanup expired sessions every hour
setInterval(
  () => {
    SimpleAuthService.cleanupExpiredSessions();
  },
  60 * 60 * 1000,
);
