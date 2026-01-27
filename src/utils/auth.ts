import { AuthUser } from "@/types/auth";

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authUtils = {
  // Guardar token
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Obtener token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Eliminar token
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Guardar usuario
  setUser: (user: AuthUser): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Obtener usuario
  getUser: (): AuthUser | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  },

  // Eliminar usuario
  removeUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },

  // Limpiar todo (logout)
  clearAuth: (): void => {
    authUtils.removeToken();
    authUtils.removeUser();
  },

  // Obtener headers con token para peticiones
  getAuthHeaders: (): HeadersInit => {
    const token = authUtils.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
};