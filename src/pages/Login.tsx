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
            const response = await api.post('/auth/login', { 
                email: email, 
                password: password 
            });

            const token = response.data.token || response.data.access_token || response.data.accessToken;

            if (token) {
                localStorage.setItem('@OtakuSphere:token', token);
                alert("Login realizado com sucesso! Redirecionando...");
                window.location.href = "/";
            } else {
                console.error("Resposta sem token:", response.data);
                alert("Erro: O servidor não retornou o token de acesso.");
            }
        } catch (error: any) {
            console.error("Erro no login:", error);
            const errorMsg = error.response?.data?.message || "E-mail ou senha incorretos. Verifique suas credenciais.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Função que redireciona diretamente para o fluxo de autenticação do Google no seu Back-end
    const handleGoogleLogin = () => {
        // Redireciona o navegador para a rota de autenticação configurada no seu NestJS/Node (Imagem 4 do Swagger)
        window.location.href = 'http://localhost:3000/auth/google';
    };

    return (
        <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4 relative">
            
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

                {/* BOTÃO LOGIN COM GOOGLE */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 active:scale-95 text-sm mb-6"
                >
                    {/* SVG Oficial da Logo do Google */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.72 1.486 6.64l3.78 3.125z"
                        />
                        <path
                            fill="#4285F4"
                            d="M23.49 12.275c0-.796-.073-1.564-.205-2.304H12v4.51h6.464a5.534 5.534 0 0 1-2.4 3.632l3.718 2.88c2.173-2.004 3.427-4.954 3.427-8.513z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.266 14.235L1.486 17.36A11.952 11.952 0 0 0 12 24c3.055 0 5.782-1.018 7.782-2.755l-3.718-2.88a7.12 7.12 0 0 1-4.064 1.144 7.077 7.077 0 0 1-6.734-4.854z"
                        />
                        <path
                            fill="#34A853"
                            d="M1.486 6.64a11.93 11.93 0 0 0 0 10.72l3.78-3.125A7.037 7.037 0 0 1 4.91 12c0-2.005.564-3.873 1.545-5.46L1.486 6.64z"
                        />
                    </svg>
                    Entrar com o Google
                </button>

                {/* DIVISOR VISUAL */}
                <div className="flex items-center my-6 text-xs text-gray-500 uppercase tracking-wider before:flex-1 before:border-t before:border-gray-800 before:mr-3 after:flex-1 after:border-t after:border-gray-800 after:ml-3">
                    ou use seu e-mail
                </div>

                {/* FORMULÁRIO TRADICIONAL */}
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