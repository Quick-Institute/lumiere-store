import { createContext, useContext, useState } from "react";
import { api, setToken } from "../api";

const AuthContext = createContext(null);

const read = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read("lumiere_user", null));

  const startSession = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("lumiere_user", JSON.stringify(data.user));
    return { ok: true, user: data.user };
  };

  const login = async (email, password) => {
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      return startSession(data);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      return startSession(data);
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("lumiere_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}