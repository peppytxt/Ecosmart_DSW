import { useNavigate } from 'react-router';
import { StatCard } from '../../components/Card';
import { Users, Recycle, Bell, Shield, FileText, Activity, CreditCard, DollarSign } from 'lucide-react';
// Removemos os mocks de usuários e conteúdos, mantendo apenas os outros por enquanto
import { mockDescartes, mockPedidosColeta, mockLogsAdmin } from '../../../lib/mockData';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';

const PRECO_ASSINATURA_UP = 29.9;
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export function DashboardUA() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [conteudos, setConteudos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca usuários e conteúdos ao mesmo tempo da API do Django
        const [resUsers, resContent] = await Promise.all([
          apiFetch('/usuarios/'),
          apiFetch('/conteudos/')
        ]);

        if (resUsers.ok && resContent.ok) {
          const dataUsers = await resUsers.json();
          const dataContent = await resContent.json();
          setUsuarios(dataUsers);
          setConteudos(dataContent);
        } else {
          toast.error("Falha ao carregar alguns dados do servidor.");
        }
      } catch (err) {
        toast.error("Erro ao sincronizar dados do painel.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalUsuarios = usuarios.length;

  const usuariosAtivos = usuarios.filter(u => 
    u.status === 'ativo' || u.status === true || String(u.status).toLowerCase() === 'true'
  ).length;

  const contagemPorPerfil = (perfil: string) => 
    usuarios.filter(u => u.perfil === perfil).length;

  const usuariosPremium = usuarios.filter(u => u.perfil === 'UP');
  const assinantesPremiumAtivos = usuariosPremium.filter(u =>
    u.status === 'ativo' || u.status === true || String(u.status).toLowerCase() === 'true'
  ).length;
  const assinantesPremiumInativos = usuariosPremium.length - assinantesPremiumAtivos;
  const receitaMensalUP = assinantesPremiumAtivos * PRECO_ASSINATURA_UP;
  const receitaAnualProjetadaUP = receitaMensalUP * 12;
  const receitaPotencialPerdidaUP = assinantesPremiumInativos * PRECO_ASSINATURA_UP;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-pulse text-[#4caf50]" />
          <span>Carregando painel real...</span>
        </div>
      </div>
    );
  }

  const pedidosAtivos = mockPedidosColeta.filter(p => 
    p.status === 'solicitada' || p.status === 'agendada' || p.status === 'coletando'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a4d2e]">Painel Administrativo</h1>
        <p className="mt-2 text-muted-foreground">
          Visão geral em tempo real do sistema EcoSmart
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total de Usuários"
          value={totalUsuarios}
          icon={Users}
          color="primary"
          trend={{ value: 'Sincronizado em tempo real', isPositive: true }}
        />
        <StatCard
          title="Total de Descartes"
          value={mockDescartes.length}
          icon={Recycle}
          color="secondary"
          trend={{ value: '+12%', isPositive: true }}
        />
        <StatCard
          title="Pedidos Ativos"
          value={pedidosAtivos}
          icon={Bell}
          color="accent"
          trend={{ value: `${mockPedidosColeta.length} total`, isPositive: true }}
        />
        <StatCard
          title="Usuários Ativos"
          value={usuariosAtivos}
          icon={Shield}
          color="primary"
        />
        <StatCard
          title="Receita Mensal UP"
          value={formatCurrency(receitaMensalUP)}
          icon={DollarSign}
          color="secondary"
          trend={{ value: `${assinantesPremiumAtivos} assinatura(s) ativa(s)`, isPositive: true }}
        />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1a4d2e]">Receita de Assinaturas UP</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estimativa baseada em usuários Premium ativos e plano mensal de {formatCurrency(PRECO_ASSINATURA_UP)}.
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-[#4caf50]" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Assinantes UP ativos</p>
            <p className="mt-2 text-2xl font-bold text-[#1a4d2e]">{assinantesPremiumAtivos}</p>
          </div>
          <div className="rounded-lg bg-[#4caf50]/10 p-4">
            <p className="text-sm text-muted-foreground">MRR estimado</p>
            <p className="mt-2 text-2xl font-bold text-[#1a4d2e]">{formatCurrency(receitaMensalUP)}</p>
          </div>
          <div className="rounded-lg bg-[#81c784]/10 p-4">
            <p className="text-sm text-muted-foreground">Receita anual projetada</p>
            <p className="mt-2 text-2xl font-bold text-[#1a4d2e]">{formatCurrency(receitaAnualProjetadaUP)}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-muted-foreground">Potencial inativo/mês</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{formatCurrency(receitaPotencialPerdidaUP)}</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/app/admin/usuarios')}
            className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-[#4caf50]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Gestão de Usuários</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerenciar usuários do sistema
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/app/admin/permissoes')}
            className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-[#4caf50]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Gestão de Permissões</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configurar permissões por perfil
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/app/admin/conteudos')}
            className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-[#4caf50]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Gestão de Conteúdos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Criar e gerenciar conteúdos educativos
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Stats Dinâmicos (Supabase) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Usuários por Perfil</h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Comum', count: contagemPorPerfil('UC') },
              { label: 'Premium', count: contagemPorPerfil('UP') },
              { label: 'Empresarial', count: contagemPorPerfil('UE') },
              { label: 'Admin', count: contagemPorPerfil('UA') }
            ].map((item, index) => (
              <div key={index} className="rounded-lg bg-muted p-4 text-center">
                <div className="text-2xl font-bold text-[#1a4d2e]">{item.count}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Stats Dinâmicos */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Estatísticas da Plataforma</h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm text-muted-foreground">Guias Educativos na Nuvem</p>
                <p className="mt-1 text-2xl font-bold text-[#1a4d2e]">{conteudos.length}</p>
              </div>
              <FileText className="h-8 w-8 text-[#4caf50]" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos de Coleta (Simulado)</p>
                <p className="mt-1 text-2xl font-bold text-[#1a4d2e]">{mockPedidosColeta.length}</p>
              </div>
              <Bell className="h-8 w-8 text-[#4caf50]" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-[#4caf50]" />
          <h3 className="font-semibold">Atividades Recentes</h3>
        </div>
        <div className="space-y-3">
          {mockLogsAdmin.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3 text-sm"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#4caf50]/10">
                <Activity className="h-4 w-4 text-[#4caf50]" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{log.acao}</p>
                <p className="text-muted-foreground">{log.descricao}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
