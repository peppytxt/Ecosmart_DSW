import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { mockNotificacoes } from '../../lib/mockData';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = mockNotificacoes.filter(
    n => n.usuario_id === user?.id && !n.lida
  ).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="h-10 w-full rounded-lg border bg-muted/50 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Lado Direito */}
      <div className="flex items-center gap-4">
        {/* Notficações */}
        <button
          onClick={() => navigate('/app/notificacoes')}
          className="relative rounded-lg p-2 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Menu do Usuário */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{user?.nome}</p>
              <p className="text-xs text-muted-foreground">
                {user?.perfil === 'UC' && 'Usuário Comum'}
                {user?.perfil === 'UP' && 'Premium'}
                {user?.perfil === 'UE' && 'Empresarial'}
                {user?.perfil === 'UA' && 'Administrador'}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-white shadow-lg">
              <div className="p-2">
                <button
                  onClick={() => {
                    navigate('/app/perfil');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </button>
                <button
                  onClick={() => {
                    navigate('/app/perfil');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </button>
                <div className="my-1 border-t"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
