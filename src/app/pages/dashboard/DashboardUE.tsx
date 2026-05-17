import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { StatCard } from '../../components/Card';
import { Users, Recycle, Building2, TrendingUp, UserPlus, Mail, Settings, ArrowRight, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { apiFetch } from '../../../lib/api';

type MembroWorkspace = {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  usuario_email: string;
  perfil_usuario: 'UC' | 'UP' | 'UE' | 'UA';
  status_vinculo: 'ativo' | 'inativo';
  setor?: string | null;
};

export function DashboardUE() {
  const navigate = useNavigate();
  const [perfilFilter, setPerfilFilter] = useState('todos');
  const [setorFilter, setSetorFilter] = useState('todos');
  const [descartesEmpresa, setDescartesEmpresa] = useState<any[]>([]);
  const [membros, setMembros] = useState<MembroWorkspace[]>([]);
  const [workspaceNome, setWorkspaceNome] = useState('sua organização');
  const [isLoadingEmpresa, setIsLoadingEmpresa] = useState(true);

  // Estatísticas
  const totalMembros = membros.filter(m => m.status_vinculo === 'ativo').length;
  const usuariosComuns = membros.filter(m => m.perfil_usuario === 'UC' && m.status_vinculo === 'ativo').length;
  const usuariosPremium = membros.filter(m => m.perfil_usuario === 'UP' && m.status_vinculo === 'ativo').length;
  const vinculosInativos = membros.filter(m => m.status_vinculo === 'inativo').length;

  useEffect(() => {
    const carregarDescartesEmpresa = async () => {
      try {
        const response = await apiFetch('/empresa/descartes/');

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        setDescartesEmpresa(data);
      } catch (error) {
        setDescartesEmpresa([]);
      } finally {
        setIsLoadingEmpresa(false);
      }
    };

    const carregarWorkspace = async () => {
      try {
        const response = await apiFetch('/workspace/');

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        setWorkspaceNome(data.workspace?.nome_workspace || 'sua organização');
        setMembros(data.membros || []);
      } catch (error) {
        setMembros([]);
      }
    };

    carregarDescartesEmpresa();
    carregarWorkspace();
    const intervalId = window.setInterval(carregarDescartesEmpresa, 5000);
    const workspaceIntervalId = window.setInterval(carregarWorkspace, 5000);
    return () => {
      window.clearInterval(intervalId);
      window.clearInterval(workspaceIntervalId);
    };
  }, []);

  // Descartes consolidados coletados por UP vinculado à empresa.
  const descartesConsolidados = descartesEmpresa;
  const totalRecyclado = descartesConsolidados.reduce((acc, d) => acc + d.quantidade, 0);

  const chartData = useMemo(() => {
    const grouped = descartesConsolidados.reduce((acc: Record<string, number>, descarte) => {
      acc[descarte.tipo_residuo] = (acc[descarte.tipo_residuo] || 0) + Number(descarte.quantidade || 0);
      return acc;
    }, {});

    return Object.entries(grouped).map(([tipo, kg]) => ({ tipo, kg }));
  }, [descartesConsolidados]);

  // Dados para o gráfico de distribuição UC x UP
  const distribuicaoData = [
    { name: 'Usuários Comuns', value: usuariosComuns, color: '#4caf50' },
    { name: 'Usuários Premium', value: usuariosPremium, color: '#1a4d2e' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a4d2e]">Dashboard Empresarial</h1>
        <p className="mt-2 text-muted-foreground">
          Visão consolidada dos dados de {workspaceNome}
        </p>
      </div>

      {/* Card Explicativo sobre Vínculo Automático */}
      <div className="rounded-xl border border-[#1a4d2e]/20 bg-gradient-to-r from-[#1a4d2e]/5 to-[#4caf50]/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a4d2e]/10">
            <Building2 className="h-6 w-6 text-[#1a4d2e]" />
          </div>
          <div>
          <h3 className="font-semibold text-[#1a4d2e]">Rastreamento Consolidado de Descartes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              As coletas feitas por usuários Premium vinculados à empresa são automaticamente
              contabilizadas nos indicadores da entidade. Cada registro mostra o usuário que gerou
              o descarte, quem coletou e a instituição vinculada à coleta.
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Coletas Registradas"
          value={descartesConsolidados.length}
          icon={Recycle}
          color="secondary"
        />
        <StatCard
          title="Material Reciclado"
          value={`${totalRecyclado} kg`}
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Membros Vinculados"
          value={totalMembros}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Economia Gerada"
          value="R$ 2.400"
          icon={Building2}
          color="secondary"
        />
      </div>

      {/* Cards de Ações Rápidas do Workspace */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => navigate('/app/empresarial/workspace')}
          className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-[#1a4d2e] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <Settings className="h-8 w-8 text-[#1a4d2e]" />
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mt-4 font-semibold">Gerenciar Workspace</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configurações e gestão completa
          </p>
        </button>

        <button
          onClick={() => navigate('/app/empresarial/workspace')}
          className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-[#1a4d2e] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <UserPlus className="h-8 w-8 text-[#4caf50]" />
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mt-4 font-semibold">Vincular Usuários</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicionar membros ao workspace
          </p>
        </button>

        <button
          onClick={() => navigate('/app/empresarial/workspace')}
          className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-[#1a4d2e] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="relative">
              <Mail className="h-8 w-8 text-[#4caf50]" />
              {vinculosInativos > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {vinculosInativos}
                </span>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mt-4 font-semibold">Vínculos Inativos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {vinculosInativos} vínculo(s) desativado(s)
          </p>
        </button>

        <button
          onClick={() => navigate('/app/empresarial/workspace')}
          className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-[#1a4d2e] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <User className="h-8 w-8 text-[#1a4d2e]" />
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mt-4 font-semibold">Membros Ativos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalMembros} usuários vinculados
          </p>
        </button>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Descartes por Material */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Descartes por Tipo de Material</h3>
          <div className="mt-6 h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="tipo" type="category" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="kg" fill="#4caf50" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma coleta vinculada à empresa ainda.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Distribuição UC x UP */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Distribuição de Perfis no Workspace</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#4caf50]/10 p-4 text-center">
              <p className="text-2xl font-bold text-[#4caf50]">{usuariosComuns}</p>
              <p className="mt-1 text-sm text-muted-foreground">Usuários Comuns</p>
            </div>
            <div className="rounded-lg bg-[#1a4d2e]/10 p-4 text-center">
              <p className="text-2xl font-bold text-[#1a4d2e]">{usuariosPremium}</p>
              <p className="mt-1 text-sm text-muted-foreground">Usuários Premium</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Registros Recentes Consolidados */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Coletas Vinculadas à Empresa</h3>
          <div className="flex gap-3">
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os perfis</SelectItem>
                <SelectItem value="UC">Usuário Comum</SelectItem>
                <SelectItem value="UP">Usuário Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={setorFilter} onValueChange={setSetorFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Operacional">Operacional</SelectItem>
                <SelectItem value="Qualidade">Qualidade</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => navigate('/app/historico')}>
              Ver Todos
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left font-medium">Data</th>
                <th className="pb-3 text-left font-medium">Usuário</th>
                <th className="pb-3 text-left font-medium">Perfil</th>
                <th className="pb-3 text-left font-medium">Setor</th>
                <th className="pb-3 text-left font-medium">Tipo de Resíduo</th>
                <th className="pb-3 text-left font-medium">Quantidade</th>
                <th className="pb-3 text-left font-medium">Coletor</th>
                <th className="pb-3 text-left font-medium">Empresa</th>
                <th className="pb-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingEmpresa ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Carregando coletas da empresa...
                  </td>
                </tr>
              ) : descartesConsolidados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nenhuma coleta foi registrada por Premium vinculado à empresa ainda.
                  </td>
                </tr>
              ) : descartesConsolidados
                .filter(descarte => {
                  const membro = membros.find(m => Number(m.usuario_id) === Number(descarte.usuario_id));
                  const perfilUsuario = membro?.perfil_usuario || descarte.usuario_perfil;
                  const matchPerfil = perfilFilter === 'todos' || perfilUsuario === perfilFilter;
                  const matchSetor = setorFilter === 'todos' || membro?.setor === setorFilter;
                  return matchPerfil && matchSetor;
                })
                .slice(0, 8)
                .map((descarte) => {
                  const membro = membros.find(m => Number(m.usuario_id) === Number(descarte.usuario_id));
                  const perfilUsuario = membro?.perfil_usuario || descarte.usuario_perfil;
                  return (
                    <tr key={descarte.id} className="border-b last:border-0">
                      <td className="py-4">
                        {new Date(descarte.data_descarte).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 font-medium">{descarte.usuario_nome || 'N/A'}</td>
                      <td className="py-4">
                        <Badge variant={perfilUsuario === 'UP' ? 'default' : 'secondary'}>
                          {perfilUsuario || '-'}
                        </Badge>
                      </td>
                      <td className="py-4 text-muted-foreground">{membro?.setor || '-'}</td>
                      <td className="py-4">{descarte.tipo_residuo}</td>
                      <td className="py-4">{descarte.quantidade} {descarte.unidade}</td>
                      <td className="py-4">{descarte.nome_coletor || '-'}</td>
                      <td className="py-4">{descarte.instituicao_coletora_nome || '-'}</td>
                      <td className="py-4">
                        <Badge
                          variant={
                            descarte.status === 'processado' ? 'default' :
                            descarte.status === 'coletado' ? 'secondary' :
                            'outline'
                          }
                        >
                          {descarte.status === 'registrado' ? 'Registrado' :
                           descarte.status === 'coletado' ? 'Coletado' :
                           descarte.status === 'em_transito' ? 'Em trânsito' :
                           descarte.status === 'processado' ? 'Finalizado' : descarte.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
