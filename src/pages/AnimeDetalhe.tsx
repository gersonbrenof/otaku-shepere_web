import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    Star, Plus, MessageCircle, Send, Clock, Tv, 
    CheckCircle, ArrowLeft, Loader2, Sparkles, Check, AlertCircle 
} from "lucide-react";
import { api, getImageUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Anime {
    id: number;
    title: string;
    main_picture: { medium: string; large: string };
    synopsis: string;
    mean?: number;
    genres?: { id: number; name: string }[];
    num_episodes?: number;
    status?: string;
    start_date?: string;
}

interface EvaluationData {
    media: string;
    total_avaliacoes: number;
    avaliacoes: any[];
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user?: {
        id?: number;
        nome?: string;
        name?: string;
        foto?: string;
    };
}

export function AnimeDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();

    const [anime, setAnime] = useState<Anime | null>(null);
    const [evaluations, setEvaluations] = useState<EvaluationData | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Interação
    const [userComment, setUserComment] = useState("");
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [inWatchLater, setInWatchLater] = useState(false);
    const [watchLaterLoading, setWatchLaterLoading] = useState(false);
    const [sendingComment, setSendingComment] = useState(false);

    // NOTIFICAÇÃO CUSTOMIZADA (Substitui o alert padrão)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [animeRes, evalRes, commentsRes] = await Promise.all([
                api.get(`/anime/${id}`),
                api.get(`/evaluations/anime/${id}`).catch(() => ({ data: { media: "0.0", total_avaliacoes: 0 } })),
                api.get(`/comments/anime/${id}`).catch(() => ({ data: [] }))
            ]);

            setAnime(animeRes.data);
            setEvaluations(evalRes.data);
            setComments(commentsRes.data);
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    // 📌 SALVAR NA LISTA (ASSISTIR MAIS TARDE)
    const handleToggleWatchLater = async () => {
        if (!isLoggedIn) {
            showToast("Faça login para adicionar animes à sua lista", "error");
            return;
        }

        setWatchLaterLoading(true);
        try {
            const response = await api.post(`/watch-later/${id}`);
            setInWatchLater(true);
            showToast(response.data?.message || "Anime adicionado à sua lista com sucesso!");
        } catch (error: any) {
            console.error("Erro ao salvar anime:", error);
            const msg = error.response?.data?.message || "Erro ao adicionar à sua lista.";
            showToast(msg, "error");
        } finally {
            setWatchLaterLoading(false);
        }
    };

    // 💬 COMENTAR
    const handleSendComment = async () => {
        if (!userComment.trim()) return;

        if (!isLoggedIn) {
            showToast("Faça login para comentar", "error");
            return;
        }

        setSendingComment(true);
        try {
            await api.post('/comments', {
                animeId: Number(id),
                content: userComment
            });
            setUserComment("");
            showToast("Comentário publicado com sucesso!");

            const res = await api.get(`/comments/anime/${id}`);
            setComments(res.data);
        } catch (error: any) {
            console.error("Erro ao comentar:", error);
            showToast(error.response?.data?.message || "Erro ao enviar comentário", "error");
        } finally {
            setSendingComment(false);
        }
    };

    // ⭐ AVALIAR ANIME
    const handleRate = async (nota: number) => {
        if (!isLoggedIn) {
            showToast("Faça login para avaliar este anime", "error");
            return;
        }

        try {
            await api.post('/evaluations', {
                nota: nota,
                animeId: Number(id)
            });
            setUserRating(nota);
            showToast(`Nota ${nota}/10 salva com sucesso!`);

            const res = await api.get(`/evaluations/anime/${id}`);
            setEvaluations(res.data);
        } catch (error: any) {
            console.error("Erro ao avaliar:", error);
            showToast("Erro ao registrar avaliação", "error");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <p className="text-gray-400 text-sm font-medium animate-pulse">Carregando detalhes do anime...</p>
        </div>
    );

    if (!anime) return (
        <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center text-white gap-4">
            <p className="text-xl font-bold">Anime não encontrado 😕</p>
            <button onClick={() => navigate('/')} className="text-purple-400 hover:underline">Voltar para a Home</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B0C10] text-white pb-24 relative selection:bg-purple-500 selection:text-white">
            
            {/* NOTIFICAÇÃO TOAST CUSTOMIZADA */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-xl animate-in slide-in-from-top-5 duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-purple-950/90 border-purple-500/50 text-purple-100 shadow-purple-900/20' 
                        : 'bg-red-950/90 border-red-500/50 text-red-100 shadow-red-900/20'
                }`}>
                    {toast.type === 'success' ? (
                        <Sparkles size={20} className="text-purple-400 shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="text-red-400 shrink-0" />
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* HEADER DA PÁGINA */}
            <header className="bg-[#161B22]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
                    <Link to="/" className="text-2xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
                        OtakuSphere
                    </Link>

                    {/* Botão de Voltar Integrado no Header */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-xl border border-gray-700/60 transition-all text-sm font-semibold cursor-pointer active:scale-95"
                    >
                        <ArrowLeft size={16} /> Voltar para Galeria
                    </button>

                    {/* Área do Usuário (PERFIL CLICÁVEL) */}
                    <div className="flex items-center gap-4">
                        {isLoggedIn && user ? (
                            <Link 
                                to="/perfil" 
                                className="flex items-center gap-3 hover:opacity-80 group cursor-pointer transition-all"
                                title="Ir para o seu Perfil"
                            >
                                {user.foto ? (
                                    <img 
                                        src={getImageUrl(user.foto)} 
                                        alt={user.nome} 
                                        className="w-9 h-9 rounded-full object-cover border border-purple-500 group-hover:border-purple-400 transition-colors" 
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm group-hover:bg-purple-500 transition-colors">
                                        {(user.nome || user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden sm:inline font-bold text-sm text-gray-200 group-hover:text-purple-400 transition-colors">
                                    {user.nome || 'Perfil'}
                                </span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                                    Entrar
                                </Link>
                                <Link to="/register" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-900/30">
                                    Cadastrar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* HERO BANNER DO ANIME */}
            <div className="relative pt-8 pb-12 overflow-hidden border-b border-gray-800/60">
                
                {/* Background desfocado com imagem do anime */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img 
                        src={anime.main_picture?.large || anime.main_picture?.medium} 
                        className="w-full h-full object-cover opacity-15 blur-2xl scale-110" 
                        alt="Background blur"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/60 via-[#0B0C10]/90 to-[#0B0C10]" />
                </div>

                {/* Conteúdo do Hero (Pôster + Título) */}
                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        
                        {/* Pôster com moldura limpa */}
                        <div className="relative shrink-0 group">
                            <img 
                                src={anime.main_picture?.large || anime.main_picture?.medium} 
                                className="w-52 md:w-64 rounded-3xl shadow-2xl border border-gray-700/60 object-cover aspect-[2/3] transform group-hover:scale-102 transition-transform duration-300"
                                alt={anime.title}
                            />
                        </div>

                        {/* Informações Principais */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {anime.genres?.map(g => (
                                    <span key={g.id} className="bg-purple-500/10 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-500/20 backdrop-blur-md">
                                        {g.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black leading-tight text-white tracking-tight">
                                {anime.title}
                            </h1>
                            
                            {/* Stats do Anime */}
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm font-medium text-gray-300 pt-2">
                                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3.5 py-2 rounded-xl border border-amber-500/20">
                                    <Star size={18} className="fill-amber-400" />
                                    <span className="text-base font-bold">{evaluations?.media || "0.0"}</span>
                                    <span className="text-xs text-amber-400/70">({evaluations?.total_avaliacoes || 0} avaliações)</span>
                                </div>
                                {anime.num_episodes && (
                                    <div className="flex items-center gap-2 bg-gray-900/80 px-3.5 py-2 rounded-xl border border-gray-800">
                                        <Tv size={16} className="text-purple-400" /> {anime.num_episodes} Episódios
                                    </div>
                                )}
                                {anime.status && (
                                    <div className="flex items-center gap-2 bg-gray-900/80 px-3.5 py-2 rounded-xl border border-gray-800 capitalize">
                                        <CheckCircle size={16} className="text-emerald-400" /> {anime.status.replace(/_/g, ' ')}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* CONTEÚDO DA PÁGINA (Sinopse e Comentários) */}
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10 mt-10">
                
                {/* COLUNA ESQUERDA */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Sinopse Caprichada */}
                    <section className="bg-[#161B22] p-8 rounded-3xl border border-gray-800/80 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                            <span>Sinopse</span>
                            <div className="h-1 w-12 bg-purple-600 rounded-full" />
                        </h2>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {anime.synopsis || "Nenhuma sinopse disponível para este anime."}
                        </p>
                    </section>

                    {/* Seção de Comentários */}
                    <section className="bg-[#161B22] rounded-3xl p-8 border border-gray-800/80 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <MessageCircle className="text-purple-500" /> 
                            Comentários ({comments.length})
                        </h2>

                        {/* Form de Comentário */}
                        {isLoggedIn ? (
                            <div className="mb-8 relative">
                                <textarea 
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    placeholder="Escreva sua opinião sobre o anime..."
                                    rows={3}
                                    className="w-full bg-gray-900 border border-gray-800 focus:border-purple-500/50 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600/30 transition-all resize-none"
                                />
                                <button 
                                    onClick={handleSendComment}
                                    disabled={sendingComment || !userComment.trim()}
                                    className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
                                >
                                    {sendingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl text-center mb-8">
                                <p className="text-gray-400 text-sm">
                                    Faça <Link to="/login" className="text-purple-400 font-bold hover:underline">login</Link> para deixar seu comentário!
                                </p>
                            </div>
                        )}

                        {/* Lista de Comentários */}
                        <div className="space-y-4">
                            {comments.length > 0 ? comments.map((c) => {
                                const authorName = c.user?.nome || c.user?.name || "Otaku Anônimo";
                                const avatarUrl = c.user?.foto ? getImageUrl(c.user.foto) : null;

                                return (
                                    <div key={c.id} className="flex gap-4 p-4 rounded-2xl bg-gray-900/40 border border-gray-800/60">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full object-cover shrink-0 border border-purple-500/30" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase">
                                                {authorName.charAt(0)}
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm text-gray-200">{authorName}</span>
                                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recente'}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center text-gray-500 py-8 border border-dashed border-gray-800 rounded-2xl">
                                    <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* COLUNA DIREITA (Ações & Avaliação) */}
                <div className="space-y-6">
                    <div className="bg-[#161B22] border border-gray-800/80 rounded-3xl p-6 sticky top-28 shadow-2xl">

                        {/* Botão Salvar na Lista */}
                        <button 
                            onClick={handleToggleWatchLater}
                            disabled={watchLaterLoading}
                            className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all mb-8 border cursor-pointer active:scale-98 ${
                                inWatchLater 
                                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" 
                                    : "bg-purple-600 hover:bg-purple-500 text-white border-purple-500/30 shadow-lg shadow-purple-900/20"
                            }`}
                        >
                            {watchLaterLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : inWatchLater ? (
                                <>
                                    <Check size={20} className="text-emerald-400" /> Na Sua Lista
                                </>
                            ) : (
                                <>
                                    <Plus size={20} /> Adicionar à Lista
                                </>
                            )}
                        </button>

                        {/* Sistema de Estrelas */}
                        <div className="border-t border-gray-800/80 pt-6">
                            <h3 className="text-center font-bold text-sm text-gray-300 mb-4">Sua avaliação para este anime</h3>
                            
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const currentNota = hoverRating || userRating;
                                    const isFilled = star * 2 <= currentNota;

                                    return (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star * 2)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => handleRate(star * 2)}
                                            className="transition-transform hover:scale-125 focus:outline-none cursor-pointer p-1"
                                        >
                                            <Star 
                                                size={30} 
                                                className={`transition-colors ${
                                                    isFilled 
                                                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
                                                        : "text-gray-700"
                                                }`} 
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-center text-[11px] text-gray-500 mt-4 uppercase tracking-widest font-semibold">
                                {userRating > 0 ? `Sua Nota: ${userRating} / 10` : 'Clique para dar uma nota (0 a 10)'}
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}