import { useState, useEffect, useRef } from 'react';
import { Search, User, LogOut, Heart, ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    busca: string;
    setBusca: (value: string) => void;
    onResetFilters: () => void;
}

export function Header({ busca, setBusca, onResetFilters }: HeaderProps) {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const handleLogoClick = () => {
        onResetFilters();
        navigate('/');
    };

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-40 bg-[#0B0C10]/90 backdrop-blur-xl border-b border-gray-800/60 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                    
                    {/* Logo */}
                    <h1 
                        onClick={handleLogoClick}
                        className="text-2xl font-black bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent cursor-pointer tracking-tight"
                    >
                        OtakuSphere
                    </h1>

                    {/* Campo de Busca - Desktop */}
                    <div className="hidden md:relative md:flex items-center w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar animes por título..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full bg-gray-900/60 text-sm text-white rounded-xl py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border border-gray-800 focus:border-purple-500"
                        />
                        <Search className="absolute left-3.5 text-gray-500" size={16} />
                    </div>

                    {/* Menu Direita (Desktop & Mobile) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        
                        {/* Botão de Busca Mobile */}
                        <button 
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/80 rounded-xl md:hidden transition-all"
                        >
                            <Search size={20} />
                        </button>

                        {/* Estado: DESLOGADO */}
                        {!isLoggedIn ? (
                            <div className="hidden md:flex items-center gap-3">
                                <button 
                                    onClick={() => navigate('/login')} 
                                    className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
                                >
                                    Entrar
                                </button>
                                <button 
                                    onClick={() => navigate('/register')} 
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
                                >
                                    Cadastrar
                                </button>
                            </div>
                        ) : (
                            /* Estado: LOGADO (Desktop) */
                            <div className="relative hidden md:block" ref={menuRef}>
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2.5 p-1.5 pr-3 bg-gray-900/60 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer group"
                                >
                                    {user?.foto ? (
                                        <img 
                                            src={user.foto} 
                                            alt={user.nome || 'Avatar'} 
                                            className="w-7 h-7 rounded-lg object-cover border border-purple-500/30 group-hover:border-purple-500 transition-colors" 
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                                            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    
                                    <span className="text-xs font-bold max-w-[100px] truncate text-gray-200 group-hover:text-purple-400 transition-colors">
                                        {user?.nome ? user.nome.split(' ')[0] : 'Perfil'}
                                    </span>
                                    
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180 text-purple-400' : ''}`} />
                                </button>

                                {/* Dropdown Menu Desktop */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#0F1115] border border-gray-800 rounded-xl shadow-2xl py-1.5 overflow-hidden z-50">
                                        <button 
                                            onClick={() => {
                                                navigate('/perfil');
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-purple-600/10 hover:text-purple-400 transition-all cursor-pointer"
                                        >
                                            <User size={15} /> Perfil
                                        </button>

                                        <button 
                                            onClick={() => {
                                                navigate('/favoritos');
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-purple-600/10 hover:text-purple-400 transition-all cursor-pointer"
                                        >
                                            <Heart size={15} /> Meus Favoritos
                                        </button>

                                        <div className="border-t border-gray-800/80 my-1"></div>

                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                        >
                                            <LogOut size={15} /> Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Botão Hamburger (Mobile) */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/80 rounded-xl md:hidden transition-all"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>

                {/* Input de Busca Expandido (Mobile) */}
                {isMobileSearchOpen && (
                    <div className="md:hidden border-t border-gray-800/60 px-4 py-3 bg-[#0B0C10]">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Buscar animes..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full bg-gray-900/80 text-sm text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none border border-gray-800 focus:border-purple-500"
                            />
                            <Search className="absolute left-3 text-gray-500" size={16} />
                        </div>
                    </div>
                )}
            </header>

            {/* Menu Lateral (Drawer Mobile) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                    />
                    
                    <div className="relative w-72 max-w-sm bg-[#0F1115] h-full p-5 flex flex-col justify-between border-l border-gray-800 z-10">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            {isLoggedIn && (
                                <div 
                                    onClick={() => {
                                        navigate('/perfil');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 p-3 bg-gray-900/60 border border-gray-800 rounded-xl mb-6 cursor-pointer hover:border-purple-500/40 transition-all"
                                >
                                    {user?.foto ? (
                                        <img src={user.foto} alt={user.nome} className="w-10 h-10 rounded-lg object-cover border border-purple-500/40" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                            {user?.nome?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="truncate">
                                        <h4 className="text-sm font-bold text-white truncate">{user?.nome || 'Usuário'}</h4>
                                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            )}

                            <nav className="space-y-1">
                                {isLoggedIn ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                navigate('/perfil');
                                                setIsMobileMenuOpen(false);
                                            }} 
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:bg-gray-900 hover:text-purple-400 transition-all text-left"
                                        >
                                            <User size={18} /> Perfil
                                        </button>
                                        
                                        <button 
                                            onClick={() => {
                                                navigate('/favoritos');
                                                setIsMobileMenuOpen(false);
                                            }} 
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:bg-gray-900 hover:text-purple-400 transition-all text-left"
                                        >
                                            <Heart size={18} /> Favoritos
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} 
                                            className="py-2.5 text-center text-xs font-bold bg-gray-900 text-gray-300 rounded-xl border border-gray-800"
                                        >
                                            Entrar
                                        </button>
                                        <button 
                                            onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} 
                                            className="py-2.5 text-center text-xs font-bold bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20"
                                        >
                                            Cadastrar
                                        </button>
                                    </div>
                                )}
                            </nav>
                        </div>

                        {isLoggedIn && (
                            <button 
                                onClick={handleLogout} 
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            >
                                <LogOut size={16} /> Sair da Conta
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}