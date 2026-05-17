import { NavLink } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Plus,
  History,
  TrendingUp,
  BookOpen,
  MapPin,
  Truck,
  Bell,
  User,
  Users,
  Shield,
  FileText,
  Network,
  Building2
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: user?.perfil === 'UP' ? '/app/dashboard-premium' :
            user?.perfil === 'UE' ? '/app/dashboard-empresarial' :
            user?.perfil === 'UA' ? '/app/dashboard-admin' : '/app/dashboard',
      icon: LayoutDashboard,
      profiles: ['UC', 'UP', 'UE', 'UA']
    },
    {
      label: 'Registrar Descarte',
      path: '/app/registrar-descarte',
      icon: Plus,
      profiles: ['UC', 'UP', 'UE']
    },
    {
      label: 'Histórico',
      path: '/app/historico',
      icon: History,
      profiles: ['UC', 'UP', 'UE']
    },
    {
      label: 'Impacto Ambiental',
      path: '/app/impacto',
      icon: TrendingUp,
      profiles: ['UC', 'UP', 'UE']
    },
    {
      label: 'Conteúdo Educativo',
      path: '/app/educacao',
      icon: BookOpen,
      profiles: ['UC', 'UP', 'UE', 'UA']
    },
    {
      label: 'Pontos de Coleta',
      path: '/app/pontos-coleta',
      icon: MapPin,
      profiles: ['UC', 'UP', 'UE', 'UA']
    },
    {
      label: 'Pedidos de Coleta',
      path: '/app/pedidos-coleta',
      icon: Truck,
      profiles: ['UC', 'UP', 'UE']
    },
    {
      label: 'Notificações',
      path: '/app/notificacoes',
      icon: Bell,
      profiles: ['UC', 'UP', 'UE', 'UA']
    },
    {
      label: 'Perfil',
      path: '/app/perfil',
      icon: User,
      profiles: ['UC', 'UP', 'UE', 'UA']
    }
  ];

  const empresarialItems = [
    {
      label: 'Gestão de Workspace',
      path: '/app/empresarial/workspace',
      icon: Building2
    }
  ];

  const adminItems = [
    {
      label: 'Gestão de Usuários',
      path: '/app/admin/usuarios',
      icon: Users
    },
    {
      label: 'Gestão de Permissões',
      path: '/app/admin/permissoes',
      icon: Shield
    },
    {
      label: 'Gestão de Conteúdos',
      path: '/app/admin/conteudos',
      icon: FileText
    },
    {
      label: 'Arquitetura do Sistema',
      path: '/app/arquitetura',
      icon: Network
    }
  ];

  const visibleItems = navItems.filter(item =>
    item.profiles.includes(user?.perfil || 'UC')
  );

  return (
    <aside className="flex h-full w-64 flex-col bg-[#1a4d2e] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4caf50]">
          <span className="font-bold">ES</span>
        </div>
        <div>
          <h1 className="font-semibold">EcoSmart</h1>
          <p className="text-xs text-white/70">Gestão Sustentável</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-[#4caf50] text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {user?.perfil === 'UE' && (
          <>
            <div className="my-4 border-t border-white/10 pt-4">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                Empresarial
              </p>
            </div>
            {empresarialItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-[#4caf50] text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}

        {user?.perfil === 'UA' && (
          <>
            <div className="my-4 border-t border-white/10 pt-4">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                Administração
              </p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-[#4caf50] text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs font-semibold text-white/70">Perfil</p>
          <p className="text-sm font-semibold">
            {user?.perfil === 'UC' && 'Usuário Comum'}
            {user?.perfil === 'UP' && 'Usuário Premium'}
            {user?.perfil === 'UE' && 'Usuário Empresarial'}
            {user?.perfil === 'UA' && 'Administrador'}
          </p>
        </div>
      </div>
    </aside>
  );
}
