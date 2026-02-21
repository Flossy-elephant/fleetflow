import { createContext, useContext, useState } from "react";
import { auth as authApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("ff_user");
    return u ? JSON.parse(u) : null;
  });

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("ff_token", res.data.token);
    localStorage.setItem("ff_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("ff_token");
    localStorage.removeItem("ff_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
