import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Faz a chamada para sua API local
            const response = await api.post('/auth/login', { 
                email: email, 
                password: password 
            });

            // 2. Extrai o token (tenta pegar 'token' ou 'access_token' caso o nome varie)
            const token = response.data.token || response.data.access_token || response.data.accessToken;

            if (token) {
                // 3. Salva o token no LocalStorage para o navegador lembrar de você
                localStorage.setItem('@OtakuSphere:token', token);
                
                // 4. Feedback visual de sucesso
                alert("Login realizado com sucesso! Redirecionando...");
                
                // 5. Redirecionamento forçado para a Home (limpa o cache e atualiza o estado logado)
                window.location.href = "/";
            } else {
                console.error("Resposta sem token:", response.data);
                alert("Erro: O servidor não retornou o token de acesso.");
            }
        } catch (error: any) {
            console.error("Erro no login:", error);
            
            // Pega a mensagem de erro vinda do seu servidor (se houver)
            const errorMsg = error.response?.data?.message || "E-mail ou senha incorretos. Verifique suas credenciais.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
            
            {/* BOTÃO VOLTAR PARA HOME */}
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Voltar para Home
            </Link>

            <div className="w-full max-w-md bg-[#161B22] border border-gray-800 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
                
                {/* TÍTULO */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent inline-block">
                        Login
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Entre no OtakuSphere para continuar</p>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={handleLogin} className="space-y-4">
                    
                    {/* INPUT EMAIL */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                        <input
                            type="email"
                            placeholder="E-mail"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all placeholder-gray-600"
                        />
                    </div>

                    {/* INPUT SENHA */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            placeholder="Senha"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all placeholder-gray-600"
                        />
                    </div>

                    {/* BOTÃO ENTRAR COM LOADING */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 active:scale-95 mt-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Autenticando...
                            </>
                        ) : (
                            'Entrar no Sistema'
                        )}
                    </button>
                </form>

                {/* RODAPÉ DO CARD */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-gray-400 text-sm">
                        Ainda não faz parte? 
                        <Link to="/register" className="ml-2 text-purple-500 font-bold hover:underline transition-all">
                            Crie sua conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}