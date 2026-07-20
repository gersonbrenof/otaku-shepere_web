import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { User, Mail, Shield, Camera, Save, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/Layout';

interface UserProfile {
  id: number;
  nome: string;
  email: string;
  role: string;
  foto: string;
}

export function Perfil() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const navigate = useNavigate();

  // Buscar perfil ao carregar a página
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get<UserProfile>('/user/profile');
      setUser(response.data);
      setNome(response.data.nome);
      setEmail(response.data.email);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      // Se não estiver autenticado (401), redireciona para o login
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setFeedback({
          tipo: 'erro',
          texto: 'Erro ao carregar os dados do perfil. Verifique sua conexão.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Atualização dos dados textuais (PATCH /user/profile)
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await api.patch<UserProfile>('/user/profile', {
        nome,
        email,
      });

      setUser(response.data);
      setFeedback({
        tipo: 'sucesso',
        texto: 'Informações do perfil atualizadas com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      setFeedback({
        tipo: 'erro',
        texto: error.response?.data?.message || 'Falha ao atualizar dados do perfil.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload da foto de perfil (PATCH /user/profile/avatar)
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    setFeedback(null);

    try {
      const response = await api.patch<UserProfile>('/user/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setFeedback({
        tipo: 'sucesso',
        texto: 'Foto de perfil atualizada no Cloudflare R2!',
      });
    } catch (error: any) {
      console.error('Erro ao enviar avatar:', error);
      setFeedback({
        tipo: 'erro',
        texto: error.response?.data?.message || 'Erro ao fazer upload da imagem.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Layout busca="" setBusca={() => {}} onResetFilters={() => navigate('/')}>
      <div className="max-w-2xl mx-auto py-6 px-2 sm:px-4">
        
        {/* Container Principal com Estilo Otaku dark / Glassmorphism */}
        <div className="bg-gray-900/30 p-6 md:p-8 rounded-2xl border border-gray-800/40 backdrop-blur-sm shadow-2xl">
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-wide">Meu Perfil</h1>
                <p className="text-xs text-gray-400 font-medium">Gerencie suas credenciais e avatar</p>
              </div>
            </div>

            {user?.role && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-sm shadow-purple-500/10">
                <Shield size={12} />
                {user.role}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Carregando Perfil...
              </span>
            </div>
          ) : (
            <>
              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`mb-6 p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                    feedback.tipo === 'sucesso'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {feedback.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedback.texto}</span>
                </div>
              )}

              {/* Seção do Avatar com Cloudflare R2 */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative group">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-purple-500/40 group-hover:border-purple-500 transition-all duration-300 shadow-xl shadow-purple-950/40 bg-gray-900">
                    <img
                      src={user?.foto || 'https://via.placeholder.com/150'}
                      alt={user?.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Overlay de Upload */}
                  <label className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs">
                    {uploadingAvatar ? (
                      <Loader2 size={24} className="text-purple-400 animate-spin" />
                    ) : (
                      <>
                        <Camera size={22} className="text-purple-400 mb-1" />
                        <span className="text-[10px] font-black uppercase text-gray-200 tracking-wider">
                          Alterar
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <span className="text-[11px] text-gray-500 font-semibold mt-3">
                  Clique na foto para alterar o avatar
                </span>
              </div>

              {/* Formulário de Edição */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    <User size={14} className="text-purple-400" />
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Seu nome ou apelido otaku"
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-xs md:text-sm text-gray-200 font-medium focus:outline-none focus:border-purple-500/80 transition-all placeholder-gray-600 shadow-inner"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    <Mail size={14} className="text-purple-400" />
                    Endereço de E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-xs md:text-sm text-gray-200 font-medium focus:outline-none focus:border-purple-500/80 transition-all placeholder-gray-600 shadow-inner"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving || uploadingAvatar}
                    className="w-full bg-purple-600 hover:bg-purple-500 border border-purple-500 text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}