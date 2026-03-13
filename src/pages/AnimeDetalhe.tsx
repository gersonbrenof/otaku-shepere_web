import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, getImageUrl } from "../services/api";
import type { Anime } from "../types/anime";

export function AnimeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnime = async () => {
    try {
      const response = await api.get(`/anime/${id}`);
      setAnime(response.data);
    } catch (error) {
      console.error("Erro ao buscar anime:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Anime não encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-dark">

      {/* BANNER */}
      <div className="relative h-[50vh] w-full overflow-hidden">

        <img
          src={getImageUrl(anime.foto)}
          alt={anime.titulo}
          className="w-full h-full object-cover opacity-40 blur-sm"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent" />

        {/* BOTÃO VOLTAR */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-black/60 px-4 py-2 rounded-lg hover:bg-primary transition"
        >
          ← Voltar
        </button>

        {/* TÍTULO NO BANNER */}
        <div className="absolute bottom-10 left-10">
          <h1 className="text-4xl md:text-5xl font-black">
            {anime.titulo}
          </h1>

          <span className="bg-primary px-4 py-1 rounded-full text-sm mt-3 inline-block">
            {anime.genero}
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

        {/* POSTER */}
        <div className="md:col-span-1">
          <img
            src={getImageUrl(anime.foto)}
            alt={anime.titulo}
            className="rounded-xl shadow-2xl w-full"
          />
        </div>

        {/* DESCRIÇÃO */}
        <div className="md:col-span-2">

          <h2 className="text-2xl font-bold mb-4 text-primary">
            Sinopse
          </h2>

          <p className="text-gray-300 leading-relaxed text-lg">
            {anime.descricao}
          </p>

          <div className="mt-8 flex gap-4">

            <button className="bg-primary px-6 py-3 rounded-lg font-bold hover:scale-105 transition">
              ▶ Assistir
            </button>

            <button className="border border-gray-600 px-6 py-3 rounded-lg hover:border-primary hover:text-primary transition">
              + Favoritar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}