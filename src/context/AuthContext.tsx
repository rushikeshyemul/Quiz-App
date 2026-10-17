import React, { useEffect, useState, ReactNode } from "react";
import { AuthState } from "../types";
import { API_URL } from "../config";
import { AuthContext } from "./auth-context";

function readStoredAuth(): AuthState {
  const token = localStorage.getItem("auth_token");
  const userData = localStorage.getItem("user_data");

  if (!token || !userData) {
    return { user: null, isAuthenticated: false, loading: false };
  }

  try {
    return {
      user: JSON.parse(userData),
      isAuthenticated: true,
      loading: true,
    };
  } catch {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    return { user: null, isAuthenticated: false, loading: false };
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(readStoredAuth);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    let active = true;
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          throw new Error("Session expired");
        }
        if (!res.ok) {
          if (active) {
            setAuthState((current) => ({ ...current, loading: false }));
          }
          return;
        }
        const data = (await res.json()) as { user: AuthState["user"] };
        if (!active || !data.user) return;
        localStorage.setItem("user_data", JSON.stringify(data.user));
        setAuthState({ user: data.user, isAuthenticated: true, loading: false });
      } catch (error) {
        if (!active) return;
        if (error instanceof Error && error.message === "Session expired") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          setAuthState({ user: null, isAuthenticated: false, loading: false });
          return;
        }
        setAuthState((current) => ({ ...current, loading: false }));
      }
    };

    void verifySession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }
      const { user, token } = await res.json();
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials.";
      throw new Error(message, { cause: error });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }
      const { user, token } = await res.json();
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      throw new Error(message, { cause: error });
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
