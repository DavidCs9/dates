"use client";

import { type ReactNode, useState } from "react";
import { useAuth } from "./auth-context";
import { LoginForm } from "./login-form";

interface ProtectedActionProps {
  children: ReactNode;
  fallback?: ReactNode;
  onAuthRequired?: () => void;
}

/**
 * Component that wraps actions requiring authentication
 * Shows login form when authentication is needed
 */
export function ProtectedAction({
  children,
  fallback,
  onAuthRequired,
}: ProtectedActionProps) {
  const { isAuthenticated, login } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleAuthRequired = () => {
    setShowLoginForm(true);
    onAuthRequired?.();
  };

  const handleLoginSuccess = () => {
    login();
    setShowLoginForm(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <button
            type="button"
            onClick={handleAuthRequired}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleAuthRequired();
              }
            }}
            className="cursor-pointer bg-transparent border-none p-0 m-0 text-inherit font-inherit"
          >
            {children}
          </button>
        )}

        <LoginForm
          isOpen={showLoginForm}
          onClose={() => setShowLoginForm(false)}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return <>{children}</>;
}

/**
 * Hook for components that need to trigger authentication
 */
export function useProtectedAction() {
  const { isAuthenticated, login } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const executeProtected = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setShowLoginForm(true);
    }
  };

  const handleLoginSuccess = () => {
    login();
    setShowLoginForm(false);
  };

  const LoginFormComponent = () => (
    <LoginForm
      isOpen={showLoginForm}
      onClose={() => setShowLoginForm(false)}
      onSuccess={handleLoginSuccess}
    />
  );

  return {
    executeProtected,
    isAuthenticated,
    LoginFormComponent,
  };
}
