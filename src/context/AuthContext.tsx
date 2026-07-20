import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id?: number | string;
  nome?: string;
  email?: string;
  foto?: string;
  [key: string]: any;
}

interface AuthContextData {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Função auxiliar para extrair os dados de dentro do Token JWT sem bibliotecas extras
function decodeJwtPayload(token: string): User | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    
    // Normaliza os campos caso o JWT use 'sub', 'username', etc.
    return {
      id: parsed.id || parsed.sub,
      nome: parsed.nome || parsed.name || parsed.username || parsed.email?.split('@')[0] || 'Usuário',
      email: parsed.email || '',
      foto: parsed.foto || parsed.avatar || parsed.picture || null,
    };
  } catch (error) {
    console.error("Erro ao decodificar token JWT:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem('@OtakuSphere:token');
      const storedUser = localStorage.getItem('@OtakuSphere:user');

      if (storedToken) {
        // 1. Injeta o Bearer Token no Axios para todas as futuras requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        // 2. Primeiro tenta ler o usuário do LocalStorage
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(decodeJwtPayload(storedToken));
          }
        } else {
          // 3. Se não houver user no LocalStorage, extrai do próprio TOKEN JWT!
          const userFromToken = decodeJwtPayload(storedToken);
          if (userFromToken) {
            setUser(userFromToken);
          }
        }

        // 4. (Opcional) Tenta atualizar com o perfil completo do backend
        try {
          const response = await api.get('/user/profile'); // Ou '/auth/me'
          if (response.data) {
            setUser(response.data);
            localStorage.setItem('@OtakuSphere:user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.warn("Não foi possível buscar o perfil atualizado do backend, mantendo dados do token.");
        }
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  const login = (token: string, userData?: User) => {
    localStorage.setItem('@OtakuSphere:token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Se a API mandou o usuário no login, usamos ele. Se não, decodificamos do Token.
    const userToSave = userData || decodeJwtPayload(token);

    if (userToSave) {
      setUser(userToSave);
      localStorage.setItem('@OtakuSphere:user', JSON.stringify(userToSave));
    }
  };

  const logout = () => {
    localStorage.removeItem('@OtakuSphere:token');
    localStorage.removeItem('@OtakuSphere:user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('@OtakuSphere:user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        // Mágica aqui: está logado se houver token no localStorage E se o user estiver carregado
        isLoggedIn: !!user,
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}