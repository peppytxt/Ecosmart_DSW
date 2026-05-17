import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Redireciona para o dashboard apropriado baseado no seu perfil de usuário
    if (user && location.pathname === '/app/dashboard') {
      switch (user.perfil) {
        case 'UP':
          navigate('/app/dashboard-premium', { replace: true });
          break;
        case 'UE':
          navigate('/app/dashboard-empresarial', { replace: true });
          break;
        case 'UA':
          navigate('/app/dashboard-admin', { replace: true });
          break;
        default:
          // Usuário Comum fica em /app/dashboard
          break;
      }
    }
  }, [user, location.pathname, navigate]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
