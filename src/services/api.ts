import axios from 'axios';

// Garante uma URL base padrão caso a variável de ambiente não esteja configurada
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 👈 ESSENCIAL: Permite o envio/recebimento de cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR DE RESPOSTA
 * Trata erros globais de autenticação (ex: sessão/cookie expirado)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend retornar 401 (Não autorizado/Sessão expirada)
    if (error.response && error.response.status === 401) {
      // Evita redirecionar em loop se ele já estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Sessão expirada. Redirecionando para o login...');
        // Opcional: Descomente a linha abaixo se quiser forçar o redirecionamento ao expirar o cookie
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * HELPER PARA FORMATAÇÃO DE IMAGENS
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return 'https://via.placeholder.com/300x400?text=Sem+Imagem';
  }

  // Se já for uma URL completa (ex: foto do Google ou S3)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Limpa barras duplicadas ao juntar a baseURL com o caminho da imagem
  const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
};