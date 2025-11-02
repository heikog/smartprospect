import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Bitte warten …
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ redirectTo: location.pathname }} />;
  }

  return <>{children}</>;
}
