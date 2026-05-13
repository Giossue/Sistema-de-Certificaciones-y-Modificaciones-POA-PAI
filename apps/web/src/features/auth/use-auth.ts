import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api-client";

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("poa_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<{ id: string; email: string; nombre: string; rol: string }>(
        "/auth/me",
      )
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("poa_token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api.post<{ token: string; usuario: AuthUser }>(
          "/auth/login",
          {
            email,
            password,
          },
        );
        localStorage.setItem("poa_token", res.token);
        setUser(res.usuario);
        navigate("/");
        return res;
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      }
    },
    [navigate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("poa_token");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return { user, loading, login, logout };
}
