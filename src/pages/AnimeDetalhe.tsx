import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Play, Plus, MessageCircle, Send, Clock, Tv, CheckCircle } from "lucide-react";
import { api } from "../services/api";

// Interfaces baseadas no seu novo retorno
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
    user?: { name: string }; // Ajuste conforme seu backend retornar
}

export function AnimeDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [anime, setAnime] = useState<Anime | null>(null);
    const [evaluations, setEvaluations] = useState<EvaluationData | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para interação
    const [userComment, setUserComment] = useState("");
    const [userRating, setUserRating] = useState(0);
    const [isLoggedIn] = useState(true); // Simulando usuário logado

    const fetchData = async () => {
        setLoading(true);
        try {
            // Buscando tudo em paralelo para performance
            const [animeRes, evalRes, commentsRes] = await Promise.all([
                api.get(`/anime/${id}`),
                api.get(`/evaluations/anime/${id}`),
                api.get(`/comments/anime/${id}`)
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
        fetchData();
    }, [id]);

    const handleSendComment = async () => {
        if (!userComment.trim()) return;
        try {
            await api.post('/comments', {
                animeId: Number(id),
                content: userComment
            });
            setUserComment("");
            // Recarregar comentários
            const res = await api.get(`/comments/anime/${id}`);
            setComments(res.data);
        } catch (error) {
            alert("Erro ao enviar comentário");
        }
    };

    const handleRate = async (nota: number) => {
        try {
            await api.post('/evaluations', {
                nota: nota,
                animeId: Number(id)
            });
            setUserRating(nota);
            // Atualiza a média na tela
            const res = await api.get(`/evaluations/anime/${id}`);
            setEvaluations(res.data);
        } catch (error) {
            alert("Erro ao avaliar");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (!anime) return <div className="text-white text-center mt-20">Anime não encontrado.</div>;

    return (
        <div className="min-h-screen bg-[#0B0C10] text-white pb-20">
            {/* HERO BANNER */}
            <div className="relative h-[60vh] w-full">
                <div className="absolute inset-0">
                    <img 
                        src={anime.main_picture.large} 
                        className="w-full h-full object-cover opacity-30" 
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/60 to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
                    <button 
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        ← Voltar para Galeria
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-end">
                        <img 
                            src={anime.main_picture.large} 
                            className="w-48 md:w-64 rounded-2xl shadow-2xl border border-gray-800 hidden md:block"
                            alt={anime.title}
                        />
                        
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {anime.genres?.map(g => (
                                    <span key={g.id} className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{anime.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-300">
                                <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                    <Star size={18} className="fill-yellow-500" />
                                    <span className="text-lg font-bold">{evaluations?.media || "0.0"}</span>
                                    <span className="text-xs opacity-60">({evaluations?.total_avaliacoes} avaliações)</span>
                                </div>
                                <div className="flex items-center gap-2"><Tv size={18} /> {anime.num_episodes} Episódios</div>
                                <div className="flex items-center gap-2"><CheckCircle size={18} /> {anime.status?.replace('_', ' ')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12 mt-12">
                
                {/* COLUNA ESQUERDA: Sinopse e Info */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            Sinopse <div className="h-1 w-12 bg-primary rounded-full" />
                        </h2>
                        <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-line">
                            {anime.synopsis}
                        </p>
                    </section>

                    {/* SEÇÃO DE COMENTÁRIOS */}
                    <section className="bg-darkCard rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MessageCircle className="text-primary" /> 
                            Comentários ({comments.length})
                        </h2>

                        {isLoggedIn ? (
                            <div className="mb-8 relative">
                                <textarea 
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    placeholder="O que você achou desse anime?"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] transition-all"
                                />
                                <button 
                                    onClick={handleSendComment}
                                    className="absolute bottom-4 right-4 bg-primary p-2 rounded-lg hover:scale-110 transition-transform"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-900/50 p-4 rounded-xl text-center mb-8 border border-dashed border-gray-700">
                                <p className="text-gray-500 text-sm">Faça login para comentar e avaliar.</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {comments.length > 0 ? comments.map((c) => (
                                <div key={c.id} className="flex gap-4 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex-shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm">Usuário Anônimo</span>
                                            <span className="text-[10px] text-gray-500 font-medium tracking-wider"><Clock size={10} className="inline mr-1" />{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-600 py-4">Nenhum comentário ainda. Seja o primeiro!</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* COLUNA DIREITA: Ações e Avaliação */}
                <div className="space-y-6">
                    <div className="bg-darkCard border border-gray-800 rounded-2xl p-6 sticky top-24">
                        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all mb-4 shadow-lg shadow-primary/20">
                            <Play fill="currentColor" size={20} /> Assistir Agora
                        </button>
                        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all mb-8">
                            <Plus size={20} /> Adicionar à Lista
                        </button>

                        <div className="border-t border-gray-800 pt-6">
                            <h3 className="text-center font-bold mb-4">Sua avaliação</h3>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star * 2)} // Multiplicando por 2 para escala 0-10
                                        className="transition-transform hover:scale-125"
                                    >
                                        <Star 
                                            size={28} 
                                            className={star * 2 <= (userRating || 0) ? "fill-yellow-500 text-yellow-500" : "text-gray-600"} 
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">Escala de 0 a 10</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}