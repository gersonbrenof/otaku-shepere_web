import { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { api, getImageUrl } from '../services/api';
import type { Anime } from '../types/anime';
export function Home() {
    const [animes, setAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para filtro e busca
    const [busca, setBusca] = useState('');
    const [generoSelecionado, setGeneroSelecionado] = useState('');

    // Gêneros mockados para o filtro (você pode puxar da API se tiver uma rota para isso)
    const generos = ['Todos', 'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Romance'];
    const navigate = useNavigate();
    // Função para buscar animes na API
    const fetchAnimes = async () => {
        setLoading(true);
        try {
            // Monta os parâmetros de query baseados no estado
            const params: any = {};
            if (busca) params.titulo = busca;
            if (generoSelecionado && generoSelecionado !== 'Todos') params.genero = generoSelecionado;

            const response = await api.get('/anime', { params });
            setAnimes(response.data);
        } catch (error) {
            console.error("Erro ao buscar animes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Dispara a busca toda vez que o filtro de gênero ou a busca textual mudar
    // O debounce (delay) idealmente seria adicionado na busca de texto, mas para simplificar faremos direto.
    useEffect(() => {
        // Um pequeno delay para não fazer requisição a cada tecla digitada
        const timeoutId = setTimeout(() => {
            fetchAnimes();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [busca, generoSelecionado]);

    return (
        <div className="min-h-screen font-sans">
            {/* HEADER / NAVBAR */}
            <header className="sticky top-0 z-50 bg-dark/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer">
                        OtakuSphere
                    </h1>

                    {/* BARRA DE BUSCA */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Buscar anime pelo título..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full bg-darkCard text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder-gray-400 border border-gray-700"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-dark to-transparent z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-[2px]" />

                <div className="relative z-20 text-center px-4">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
                        Seu portal de <span className="text-primary">Animes</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-md">
                        Descubra, filtre e encontre seus animes favoritos na maior biblioteca otaku.
                    </p>
                </div>
            </section>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 py-12">

                {/* FILTROS DE CATEGORIA */}
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                    <Filter className="text-primary min-w-[24px]" size={24} />
                    {generos.map((gen) => (
                        <button
                            key={gen}
                            onClick={() => setGeneroSelecionado(gen)}
                            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 border ${generoSelecionado === gen || (generoSelecionado === '' && gen === 'Todos')
                                ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                                : 'bg-darkCard border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                                }`}
                        >
                            {gen}
                        </button>
                    ))}
                </div>

                {/* GRID DE ANIMES */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                    </div>
                ) : animes.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-2xl mb-2">Nenhum anime encontrado 😢</p>
                        <p>Tente buscar por outro título ou gênero.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {animes.map((anime) => (
                            <div
                                key={anime.id}
                                className="group relative bg-darkCard rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-800"
                            >
                                {/* Imagem do Anime */}
                                <div className="relative h-72 md:h-80 w-full overflow-hidden">
                                    <img
                                        src={getImageUrl(anime.foto)}
                                        alt={anime.titulo}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Sem+Imagem'; }}
                                    />
                                    {/* Overlay Escuro ao passar o mouse */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <PlayCircle size={60} className="text-primary hover:text-white transition-colors cursor-pointer" />
                                    </div>
                                    {/* Badge de Gênero */}
                                    <span className="absolute top-3 right-3 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
                                        {anime.genero}
                                    </span>
                                </div>

                                {/* Info do Anime */}
                                <div className="p-5 relative">
                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors line-clamp-1">
                                        {anime.titulo}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                                        {anime.descricao}
                                    </p>

                                    <button
                                        onClick={() => navigate(`/anime/${anime.id}`)}
                                        className="w-full py-2 bg-gray-800 hover:bg-primary/20 hover:text-primary text-gray-300 font-semibold rounded-lg transition-colors border border-gray-700 hover:border-primary/50"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}