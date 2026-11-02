import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const demoUsers = [
  { name: "Admin", email: "admin@lumiere.lk", password: "admin123", role: "admin" },
  { name: "Madheeha", email: "customer@lumiere.lk", password: "customer123", role: "customer" },
];

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

  const startSession = (found) => {
    const safe = { name: found.name, email: found.email, role: found.role };
    setUser(safe);
    localStorage.setItem("lumiere_user", JSON.stringify(safe));
    return { ok: true, user: safe };
  };

  const login = (email, password) => {
    const all = [...demoUsers, ...read("lumiere_users", [])];
    const found = all.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: "Wrong email or password." };
    return startSession(found);
  };

  const register = (name, email, password) => {
    const saved = read("lumiere_users", []);
    const all = [...demoUsers, ...saved];
    if (all.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "This email is already registered." };
    }
    const newUser = { name, email, password, role: "customer" };
    localStorage.setItem("lumiere_users", JSON.stringify([...saved, newUser]));
    return startSession(newUser);
  };

  const logout = () => {
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