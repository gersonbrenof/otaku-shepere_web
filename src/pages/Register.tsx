import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function Register() {
    const [nome, setNome] = useState(''); // Alterado para bater com o campo da API
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Enviando o objeto com 'nome', 'email' e 'password' para http://[::1]:3000/auth/register
            await api.post('/auth/register', { 
                nome, 
                email, 
                password 
            });

            alert("Conta criada com sucesso! Agora faça seu login.");
            navigate('/login'); // Redireciona para a tela de login após sucesso
        } catch (error: any) {
            console.error("Erro ao cadastrar:", error);
            const errorMsg = error.response?.data?.message || "Erro ao criar conta. Tente outro e-mail.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
            {/* Botão Voltar */}
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Voltar para Home
            </Link>

            <div className="w-full max-w-md bg-[#161B22] border border-gray-800 p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent inline-block">
                        Cadastro
                    </h1>
                    <p className="text-gray-400 mt-2">Crie sua conta otaku agora</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Campo Nome */}
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            required
                            value={nome}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>

                    {/* Campo E-mail */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                        <input
                            type="email"
                            placeholder="E-mail"
                            required
                            value={email}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Campo Senha */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            placeholder="Senha (mín. 6 caracteres)"
                            required
                            value={password}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Botão de Cadastro com Loading */}
                    <button 
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Minha Conta'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-8">
                    Já tem conta? <Link to="/login" className="text-purple-500 font-bold hover:underline">Fazer Login</Link>
                </p>
            </div>
        </div>
    );
}