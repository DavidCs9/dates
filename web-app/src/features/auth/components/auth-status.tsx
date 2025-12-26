"use client";

import { LogIn, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-context";
import { LoginForm } from "./login-form";

interface AuthStatusProps {
  showLoginButton?: boolean;
  variant?: "badge" | "button" | "full";
}

export function AuthStatus({
  showLoginButton = true,
  variant = "full",
}: AuthStatusProps) {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLoginSuccess = () => {
    login();
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-muted-foreground">Checking...</span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <Badge variant={isAuthenticated ? "default" : "secondary"}>
        <Shield className="h-3 w-3 mr-1" />
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </Badge>
    );
  }

  if (variant === "button") {
    if (isAuthenticated) {
      return (
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      );
    }

    return showLoginButton ? (
      <Button
        variant="default"
        size="sm"
        onClick={() => setShowLoginForm(true)}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Login
      </Button>
    ) : null;
  }

  // Full variant
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Shield
          className={`h-4 w-4 ${isAuthenticated ? "text-green-600" : "text-gray-400"}`}
        />
        <span className="text-sm">
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </span>
      </div>

      {isAuthenticated ? (
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      ) : showLoginButton ? (
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowLoginForm(true)}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      ) : null}

      <LoginForm
        isOpen={showLoginForm}
        onClose={() => setShowLoginForm(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
