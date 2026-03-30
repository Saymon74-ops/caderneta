import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCheckPlano } from '../hooks/useCheckPlano';

export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { plano, loading: planoLoading } = useCheckPlano();

  if (authLoading || planoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1a9e5c] border-t-transparent 
                        rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (plano !== 'pro') return <Navigate to="/subscription" replace />;

  return <>{children}</>;
}
