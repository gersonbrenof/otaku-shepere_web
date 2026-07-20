import { useState, useEffect, useRef } from 'react';
import { Filter, PlayCircle, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';
import { Layout } from '../components/Layout';

interface Anime {
    id: number;
    title: string;
    main_picture: { medium: string; large: string; };
    synopsis: string;
    mean?: number;
    genres?: { id: number; name: string }[]; 
}

export function Home() {
    const [animes, setAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [generoSelecionado, setGeneroSelecionado] = useState('Todos');
    
    const [pagina, setPagina] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [temporadaSelecionada, setTemporadaSelecionada] = useState({
        ano: new Date().getFullYear(),
        season: ''
    });

    const carouselRef = useRef<HTMLDivElement>(null);
    const generos = ['Todos', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Suspense', 'Horror', 'Mystery', 'Slice of Life'];
    const navigate = useNavigate();

    const handleResetFilters = () => {
        setBusca('');
        setGeneroSelecionado('Todos');
        setTemporadaSelecionada(prev => ({ ...prev, season: '' }));
        setPagina(1);
    };

    const scrollCarrossel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 200;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const fetchAnimes = async () => {
        setLoading(true);
        try {
            let response;
            const params: any = { page: pagina, limit: 15 };

            if (busca) {
                response = await api.get('/anime/search', { params: { titulo: busca, ...params } });
            } else if (temporadaSelecionada.season) {
                response = await api.get(
                    `/anime/temporada/${temporadaSelecionada.ano}/${temporadaSelecionada.season}`, 
                    { params }
                );
            } else if (generoSelecionado !== 'Todos') {
                response = await api.get('/anime/categoria', { params: { genre: generoSelecionado, ...params } });
            } else {
                response = await api.get('/anime/ranking', { params: { type: 'bypopularity', ...params } });
            }

            if (response.data && response.data.data) {
                setAnimes(response.data.data);
                setHasNextPage(response.data.pagination.hasNextPage);
            } else {
                setAnimes(Array.isArray(response.data) ? response.data : []);
                setHasNextPage(false);
            }
        } catch (error) {
            console.error("Erro ao buscar animes:", error);
            setAnimes([]);
            setHasNextPage(false);
        } finally {
            setLoading(false);
        }
    };

    // Reseta a paginação quando os filtros mudam
    useEffect(() => {
        setPagina(1);
    }, [busca, generoSelecionado, temporadaSelecionada.season, temporadaSelecionada.ano]);

    // Busca os animes sempre que as dependências mudarem
    useEffect(() => {
        const timeoutId = setTimeout(() => fetchAnimes(), 300);
        return () => clearTimeout(timeoutId);
    }, [busca, generoSelecionado, temporadaSelecionada.season, temporadaSelecionada.ano, pagina]);

    return (
        <Layout busca={busca} setBusca={setBusca} onResetFilters={handleResetFilters}>
            
            {/* Seção de Filtros (Gêneros e Temporada) */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-center mb-10 bg-gray-900/30 p-4 rounded-2xl border border-gray-800/40 backdrop-blur-sm">
                
                <div className="xl:col-span-3 relative flex items-center group w-full overflow-hidden">
                    <button 
                        onClick={() => scrollCarrossel('left')}
                        className="hidden md:flex absolute left-0 z-10 items-center justify-center w-8 h-8 bg-black/70 hover:bg-purple-600 border border-gray-800 rounded-full text-white cursor-pointer transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-md"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#060709]/80 to-transparent pointer-events-none z-10 hidden md:block"></div>
                    
                    <div 
                        ref={carouselRef}
                        className="flex items-center gap-2 overflow-x-auto w-full py-1.5 px-2 md:px-8 scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                        <div className="flex items-center text-purple-400 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 mr-1 flex-shrink-0">
                            <Filter size={14} />
                        </div>

                        {generos.map((gen) => (
                            <button
                                key={gen}
                                onClick={() => { 
                                    setGeneroSelecionado(gen); 
                                    setBusca(''); 
                                    setTemporadaSelecionada(prev => ({ ...prev, season: '' }));
                                    setPagina(1);
                                }}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer active:scale-95 ${
                                    generoSelecionado === gen && !temporadaSelecionada.season
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 scale-105'
                                    : 'bg-gray-900/60 border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700'
                                }`}
                            >
                                {gen}
                            </button>
                        ))}
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#060709]/80 to-transparent pointer-events-none z-10 hidden md:block"></div>

                    <button 
                        onClick={() => scrollCarrossel('right')}
                        className="hidden md:flex absolute right-0 z-10 items-center justify-center w-8 h-8 bg-black/70 hover:bg-purple-600 border border-gray-800 rounded-full text-white cursor-pointer transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-md"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 w-full">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-purple-400" size={14} />
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Temporada</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={temporadaSelecionada.season}
                            onChange={(e) => {
                                setTemporadaSelecionada(prev => ({ ...prev, season: e.target.value }));
                                setGeneroSelecionado('Todos');
                                setBusca('');
                            }}
                            className="bg-transparent text-purple-400 font-bold focus:outline-none cursor-pointer border-none text-right"
                        >
                            <option value="" className="bg-[#0F1115] text-gray-500">Nenhuma</option>
                            <option value="inverno" className="bg-[#0F1115] text-white">❄️ Inverno</option>
                            <option value="primavera" className="bg-[#0F1115] text-white">🌸 Primavera</option>
                            <option value="verao" className="bg-[#0F1115] text-white">☀️ Verão</option>
                            <option value="outono" className="bg-[#0F1115] text-white">🍂 Outono</option>
                        </select>

                        {temporadaSelecionada.season && (
                            <input
                                type="number"
                                min="1970"
                                max={new Date().getFullYear() + 1}
                                value={temporadaSelecionada.ano}
                                onChange={(e) => {
                                    const a = parseInt(e.target.value, 10) || new Date().getFullYear();
                                    setTemporadaSelecionada(prev => ({ ...prev, ano: a }));
                                }}
                                className="bg-gray-950 text-purple-400 font-black focus:outline-none w-16 text-center border border-gray-800 rounded-lg py-0.5"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal (Loading ou Grid de Animes) */}
            {loading ? (
                <div className="flex flex-col justify-center items-center h-72 gap-3">
                    <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Carregando Acervo...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                        {animes.map((anime) => (
                            <div
                                key={anime.id}
                                onClick={() => navigate(`/anime/${anime.id}`)}
                                className="group cursor-pointer flex flex-col hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden mb-2.5 border border-gray-900 bg-gray-900 group-hover:border-purple-500/40 transition-all duration-300 shadow-md">
                                    <img
                                        src={anime.main_picture.large || anime.main_picture.medium}
                                        alt={anime.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <PlayCircle size={38} className="text-white scale-90 group-hover:scale-100 transition-transform duration-300" />
                                    </div>
                                    {anime.mean && (
                                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1 border border-gray-800/60">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] font-black">{anime.mean}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-xs md:text-sm line-clamp-1 group-hover:text-purple-400 transition-colors px-0.5 text-gray-200">
                                    {anime.title}
                                </h3>
                            </div>
                        ))}
                    </div>

                    {/* Paginação */}
                    {animes.length > 0 && (
                        <div className="flex items-center justify-center gap-3 mt-12 pb-8">
                            <button
                                disabled={pagina === 1}
                                onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                                className="px-4 py-2 rounded-xl bg-gray-900/60 border border-gray-800/80 text-xs font-bold text-gray-400 hover:text-white hover:border-purple-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                Anterior
                            </button>
                            <div className="bg-gray-900/40 px-4 py-2 border border-gray-800/60 rounded-xl text-xs font-bold text-gray-400">
                                Pág. <span className="text-purple-400">{pagina}</span>
                            </div>
                            <button
                                disabled={!hasNextPage}
                                onClick={() => setPagina(prev => prev + 1)}
                                className="px-4 py-2 rounded-xl bg-gray-900/60 border border-gray-800/80 text-xs font-bold text-gray-400 hover:text-white hover:border-purple-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
}