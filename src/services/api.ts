import axios from 'axios';

// Instância do Axios
export const api = axios.create({
  // Garanta que no seu arquivo .env a VITE_API_BASE_URL seja http://localhost:3000
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * INTERCEPTOR DE REQUISIÇÃO
 * Isso resolve o erro 401. Ele verifica se existe um token no LocalStorage
 * antes de enviar qualquer requisição para o seu servidor.
 */
api.interceptors.request.use((config) => {
    // Busca o token que salvamos no Login
    const token = localStorage.getItem('@OtakuSphere:token');
    
    // Se o token existir, ele "cola" no cabeçalho (Header) da requisição
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper para imagens
export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return 'https://via.placeholder.com/300x400?text=Sem+Imagem';
  
  if (path.startsWith('http')) return path;
  
  return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
};