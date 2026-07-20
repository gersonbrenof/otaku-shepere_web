import { useState, useEffect } from 'react';
import { Bookmark, Sparkles, PlayCircle, Star, Film, Loader2, Trash2, Bot, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/Layout';

interface Anime {
  id: number;
  title: string;
  main_picture: { medium: string; large: string };
  synopsis?: string;
  mean?: number;
  genres?: { id: number; name: string }[];
}

export function Favoritos() {
  const [favoritos, setFavoritos] = useState<Anime[]>([]);
  const [recomendacaoIaTexto, setRecomendacaoIaTexto] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchLater();
  }, []);

  // 📌 Buscar Lista de Favoritos (Assistir Mais Tarde)
  const fetchWatchLater = async () => {
    try {
      setLoading(true);
      const response = await api.get<Anime[]>('/watch-later');
      const data = Array.isArray(response.data) ? response.data : [];
      setFavoritos(data);

      // Se tiver animes na lista, busca as recomendações automaticamente
      if (data.length > 0) {
        fetchRecommendations();
      }
    } catch (error: any) {
      console.error('Erro ao buscar lista de favoritos:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 📌 Buscar Recomendações da IA (Retorna texto formatado)
  const fetchRecommendations = async () => {
    try {
      setLoadingAi(true);
      const response = await api.get('/watch-later/recommendations');
      
      // O backend retorna: { recommendations: "**Análise...**" }
      const textResult = response.data?.recommendations || response.data?.data || response.data || '';
      setRecomendacaoIaTexto(typeof textResult === 'string' ? textResult : '');
    } catch (error) {
      console.error('Erro ao buscar recomendações da IA:', error);
      setRecomendacaoIaTexto('');
    } finally {
      setLoadingAi(false);
    }
  };

  // 🗑️ Remover Anime da Lista
  const handleRemoveFromWatchLater = async (e: React.MouseEvent, animeId: number) => {
    e.stopPropagation(); // Evita navegar para a página do anime ao clicar na lixeira
    setDeletingId(animeId);

    try {
      // Tenta remover via DELETE
      await api.delete(`/watch-later/${animeId}`);
      setFavoritos((prev) => prev.filter((item) => item.id !== animeId));
    } catch (error: any) {
      console.error('Erro ao remover via DELETE, tentando rota alternada...', error);
      try {
        // Fallback caso sua API use POST para toggle/remover
        await api.post(`/watch-later/${animeId}`);
        setFavoritos((prev) => prev.filter((item) => item.id !== animeId));
      } catch (err) {
        console.error('Erro ao remover anime:', err);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Helper para formatar o texto em Markdown retornado pela IA em elementos HTML limpos
  const renderFormattedAiText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-2" />;

      // Títulos principais (ex: **Análise da Lista**)
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <h3 key={index} className="text-purple-300 font-extrabold text-base mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-500 rounded-full inline-block" />
            {trimmed.replace(/\*\*/g, '')}
          </h3>
        );
      }

      // Tópicos com marcadores (ex: * Comédia)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2);
        return (
          <li key={index} className="ml-4 text-xs md:text-sm text-gray-300 list-disc marker:text-purple-400 my-1 leading-relaxed">
            {formatBoldText(content)}
          </li>
        );
      }

      // Itens numerados (ex: 1. **Tora Dora**)
      if (/^\d+\./.test(trimmed)) {
        return (
          <div key={index} className="mt-3 text-sm text-white font-bold bg-purple-950/20 p-3 rounded-xl border border-purple-500/20">
            {formatBoldText(trimmed)}
          </div>
        );
      }

      return (
        <p key={index} className="text-xs md:text-sm text-gray-300 my-1 leading-relaxed">
          {formatBoldText(trimmed)}
        </p>
      );
    });
  };

  // Helper para substituir **texto** por <strong>texto</strong>
  const formatBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-purple-300 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <Layout busca="" setBusca={() => {}} onResetFilters={() => navigate('/')}>
      <div className="space-y-12 pb-12">
        
        {/* Cabeçalho Principal */}
        <div className="bg-gray-900/40 p-6 md:p-8 rounded-3xl border border-gray-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-600/10 border border-purple-500/20 rounded-2xl text-purple-400">
              <Bookmark size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
                Minha Lista
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Animes salvos para assistir mais tarde
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRecommendations}
              disabled={loadingAi || favoritos.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-900/30 cursor-pointer active:scale-95"
            >
              {loadingAi ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              <span>{loadingAi ? 'Analisando...' : 'Recomendar com IA'}</span>
            </button>

            <div className="bg-gray-900/90 border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400">
              Total: <span className="text-purple-400 font-black">{favoritos.length}</span>
            </div>
          </div>
        </div>

        {/* ---------------- SEÇÃO 1: WATCH LATER ---------------- */}
        <section>
          {loading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-3">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Carregando sua lista...
              </span>
            </div>
          ) : favoritos.length === 0 ? (
            <div className="bg-gray-900/20 border border-gray-800/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <Film size={44} className="text-gray-600 mb-1" />
              <h3 className="text-base font-bold text-gray-300">Sua lista está vazia</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Explore o acervo da Home e adicione animes que você pretende assistir mais tarde.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95"
              >
                Explorar Animes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {favoritos.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => navigate(`/anime/${anime.id}`)}
                  className="group cursor-pointer flex flex-col hover:-translate-y-1.5 transition-all duration-300 relative"
                >
                  <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden mb-2.5 border border-gray-800 bg-gray-900 group-hover:border-purple-500/50 transition-all duration-300 shadow-xl">
                    <img
                      src={anime.main_picture?.large || anime.main_picture?.medium}
                      alt={anime.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay com Botão Play */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle size={40} className="text-white scale-90 group-hover:scale-100 transition-transform duration-300" />
                    </div>

                    {/* Nota do Anime */}
                    {anime.mean && (
                      <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-gray-800">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-black text-white">{anime.mean}</span>
                      </div>
                    )}

                    {/* 🗑️ BOTÃO REMOVER DA LISTA */}
                    <button
                      onClick={(e) => handleRemoveFromWatchLater(e, anime.id)}
                      disabled={deletingId === anime.id}
                      title="Remover da Lista"
                      className="absolute top-2.5 left-2.5 p-2 bg-red-950/80 hover:bg-red-600 text-red-200 hover:text-white rounded-xl backdrop-blur-md border border-red-500/30 transition-all opacity-90 hover:opacity-100 cursor-pointer active:scale-90"
                    >
                      {deletingId === anime.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-xs md:text-sm line-clamp-1 group-hover:text-purple-400 transition-colors px-0.5 text-gray-200">
                    {anime.title}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------- SEÇÃO 2: RECOMENDAÇÕES DA IA ---------------- */}
        <section className="space-y-6 pt-8 border-t border-gray-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                  Análise & Recomendações da IA
                </h2>
                <p className="text-xs text-gray-400">
                  Sugestões personalizadas geradas com base nos seus animes salvos
                </p>
              </div>
            </div>

            {recomendacaoIaTexto && (
              <button
                onClick={fetchRecommendations}
                disabled={loadingAi}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={loadingAi ? 'animate-spin' : ''} />
                <span>Atualizar</span>
              </button>
            )}
          </div>

          {loadingAi ? (
            <div className="flex items-center gap-3 bg-[#161B22] p-8 rounded-3xl border border-purple-500/20 text-xs font-semibold text-gray-300 animate-pulse">
              <Loader2 size={20} className="animate-spin text-purple-400 shrink-0" />
              <span>A Inteligência Artificial está cruzando seus gêneros favoritos para montar a lista ideal...</span>
            </div>
          ) : recomendacaoIaTexto ? (
            /* Painel de Recomendações da IA */
            <div className="bg-[#161B22] border border-purple-500/30 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                {renderFormattedAiText(recomendacaoIaTexto)}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/30 border border-gray-800/60 rounded-2xl p-6 text-center text-xs text-gray-500">
              Clique no botão <strong className="text-purple-400">"Recomendar com IA"</strong> acima para gerar análises e sugestões customizadas com base no seu gosto!
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}