// Exemplo no React (AuthCallback.tsx)
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (processed.current) return;
    processed.current = true;

    // Salva o JWT no storage e redireciona
    localStorage.setItem('token', token);
    navigate('/entrar-turma');
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen items-center justify-center font-bold">
      Conectando sua conta... ⏳
    </div>
  );
}