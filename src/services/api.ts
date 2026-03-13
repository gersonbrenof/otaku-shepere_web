import axios from 'axios';

// Aqui o Vite pega a URL da API que está no seu arquivo .env
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Como a sua API retorna o caminho da foto como "uploads/imagem.jpg",
// precisamos dessa função para juntar a URL da API com o caminho da imagem.
export const getImageUrl = (path: string | null | undefined) => {
  // Se não tiver imagem, retorna um placeholder
  if (!path) return 'https://via.placeholder.com/300x400?text=Sem+Imagem';
  
  // Se a imagem já vier como link completo (http...), retorna ela mesma
  if (path.startsWith('http')) return path;
  
  // Junta a URL do backend com o caminho do upload
  return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
};