import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../lib/mockData';
import { API_BASE_URL } from '../lib/api';

type ApiUser = Partial<Usuario> & {
  id: string | number;
  status?: boolean | string;
  token?: string;
};

export const AuthContext = createContext<{
  user: Usuario | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Omit<Usuario, 'id' | 'created_at' | 'status'>) => Promise<boolean>;
  updateUser: (userData: Partial<Usuario>) => void;
  isLoading: boolean;
} | undefined>(undefined);

function normalizeUser(userData: ApiUser): Usuario {
  return {
    id: String(userData.id),
    nome: userData.nome || '',
    email: userData.email || '',
    senha: userData.senha || '',
    telefone: userData.telefone || '',
    endereco: userData.endereco || '',
    perfil: userData.perfil || 'UC',
    status:
      userData.status === true ||
      userData.status === 'ativo' ||
      String(userData.status).toLowerCase() === 'true'
        ? 'ativo'
        : 'inativo',
    avatar: userData.avatar,
    created_at: userData.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ecosmart_user');
    const storedToken = localStorage.getItem('ecosmart_token');

    if (storedUser && storedToken) {
      setUser(normalizeUser(JSON.parse(storedUser)));
    } else {
      localStorage.removeItem('ecosmart_user');
      localStorage.removeItem('ecosmart_token');
    }

    setIsLoading(false);
  }, []);

  const persistSession = (userData: ApiUser) => {
    const normalizedUser = normalizeUser(userData);

    if (userData.token) {
      localStorage.setItem('ecosmart_token', userData.token);
    }

    setUser(normalizedUser);
    localStorage.setItem('ecosmart_user', JSON.stringify(normalizedUser));
  };

  // LOGIN REAL CONECTADO AO DJANGO
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (response.ok) {
        const userData = await response.json();
        persistSession(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecosmart_user');
    localStorage.removeItem('ecosmart_token');
  };

  const updateUser = (userData: Partial<Usuario>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const updatedUser = normalizeUser({
        ...currentUser,
        ...userData,
        id: userData.id || currentUser.id,
      });

      localStorage.setItem('ecosmart_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // SIGNUP REAL CONECTADO AO DJANGO -> SUPABASE
  const signup = async (userData: Omit<Usuario, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        persistSession(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
