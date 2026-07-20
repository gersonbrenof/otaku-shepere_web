import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
    children: ReactNode;
    busca: string;
    setBusca: (value: string) => void;
    onResetFilters: () => void;
}

export function Layout({ children, busca, setBusca, onResetFilters }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[#060709] text-gray-100 font-sans antialiased selection:bg-purple-600 selection:text-white">
            <Header busca={busca} setBusca={setBusca} onResetFilters={onResetFilters} />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {children}
            </main>

            <footer className="border-t border-gray-800/40 mt-12 py-8 text-center text-gray-500 text-xs font-medium tracking-wider uppercase">
                OtakuSphere © {new Date().getFullYear()}
            </footer>
        </div>
    );
}