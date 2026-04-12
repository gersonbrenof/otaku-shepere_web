import { useState, useEffect, useRef } from 'react';
import { Search, Filter, PlayCircle, Star, User, LogOut, Heart, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';

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
    
    // VERIFICAÇÃO DE LOGIN REAL: Checa se o token existe no navegador
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('@OtakuSphere:token'));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const generos = ['Todos', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Suspense'];
    const navigate = useNavigate();

    // Função para Sair (Logout)
    const handleLogout = () => {
        localStorage.removeItem('@OtakuSphere:token'); // Remove o token
        setIsLoggedIn(false);
        setIsMenuOpen(false);
        navigate('/'); // Volta para a home limpa
    };

    // Fechar menu ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchAnimes = async () => {
        setLoading(true);
        try {
            let response;
            if (busca) {
                response = await api.get('/anime/search', { params: { titulo: busca } });
            } else if (generoSelecionado !== 'Todos') {
                response = await api.get('/anime/categoria', { params: { genre: generoSelecionado, limit: 20 } });
            } else {
                response = await api.get('/anime/ranking', { params: { type: 'bypopularity' } });
            }
            setAnimes(response.data);
        } catch (error) {
            console.error("Erro ao buscar animes:", error);
            setAnimes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => fetchAnimes(), 500);
        return () => clearTimeout(timeoutId);
    }, [busca, generoSelecionado]);

    return (
        <div className="min-h-screen bg-[#0B0C10] text-white font-sans">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-[#0B0C10]/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    
                    {/* LOGO */}
                    <h1 
                        onClick={() => {setBusca(''); setGeneroSelecionado('Todos'); navigate('/')}}
                        className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        OtakuSphere
                    </h1>

                    {/* BUSCA CENTRALIZADA */}
                    <div className="hidden md:relative md:flex items-center w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar animes..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full bg-gray-900/50 text-sm text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all border border-gray-700"
                        />
                        <Search className="absolute left-3.5 text-gray-500" size={18} />
                    </div>

                    {/* ÁREA DE USUÁRIO */}
                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => navigate('/login')} // Redireciona para Login
                                    className="hidden sm:block text-sm font-semibold hover:text-purple-400 transition-colors px-4"
                                >
                                    Entrar
                                </button>
                                <button 
                                    onClick={() => navigate('/register')} // Redireciona para Cadastro
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-purple-500/20"
                                >
                                    Cadastrar
                                </button>
                            </div>
                        ) : (
                            <div className="relative" ref={menuRef}>
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 p-1 pr-3 bg-gray-900 rounded-full border border-gray-700 hover:border-purple-500 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs uppercase">
                                        U
                                    </div>
                                    <span className="text-sm font-medium hidden sm:block">Meu Perfil</span>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-[#161B22] border border-gray-700 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-purple-600/10 hover:text-purple-400 transition-colors">
                                            <User size={18} /> Perfil
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-purple-600/10 hover:text-purple-400 transition-colors">
                                            <Heart size={18} /> Favoritos
                                        </button>
                                        <div className="border-t border-gray-800 mt-2">
                                            <button 
                                                onClick={handleLogout} // Chama a função de sair
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                            >
                                                <LogOut size={18} /> Sair
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* CONTEÚDO */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                
                {/* FILTROS */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="text-purple-500 mr-2" size={20} />
                    {generos.map((gen) => (
                        <button
                            key={gen}
                            onClick={() => { setGeneroSelecionado(gen); setBusca(''); }}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                generoSelecionado === gen
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                            }`}
                        >
                            {gen}
                        </button>
                    ))}
                </div>

                {/* GRID */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="h-10 w-10 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {animes.map((anime) => (
                            <div
                                key={anime.id}
                                onClick={() => navigate(`/anime/${anime.id}`)}
                                className="group cursor-pointer flex flex-col"
                            >
                                <div className="relative aspect-[3/4.5] rounded-xl overflow-hidden mb-3">
                                    <img
                                        src={anime.main_picture.large || anime.main_picture.medium}
                                        alt={anime.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <PlayCircle size={40} className="text-white" />
                                    </div>
                                    {anime.mean && (
                                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[11px] font-bold">{anime.mean}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-sm md:text-[15px] line-clamp-1 group-hover:text-purple-400 transition-colors">
                                    {anime.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
