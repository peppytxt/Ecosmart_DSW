import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { StatCard } from '../../components/Card';
import { Recycle, History, TrendingUp, Award, Plus, BookOpen, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';

type Descarte = {
  id: number;
  tipo_residuo: string;
  quantidade: number;
  unidade: string;
  data_descarte: string;
  status: 'registrado' | 'coletado' | 'em_transito' | 'processado';
  local?: string;
  nome_coletor?: string | null;
};

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function DashboardUC() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userDescartes, setUserDescartes] = useState<Descarte[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDescartes = async (showLoading = false) => {
    if (!user?.id) {
      setUserDescartes([]);
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await apiFetch(`/descartes/historico/?usuario_id=${user.id}`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setUserDescartes(data);
    } catch (error) {
      toast.error('Não foi possível carregar seus descartes.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    carregarDescartes(true);
    const intervalId = window.setInterval(() => carregarDescartes(), 5000);
    return () => window.clearInterval(intervalId);
  }, [user?.id]);

  const descartesPendentes = userDescartes.filter(d => d.status === 'registrado');
  const descartesProcessados = userDescartes.filter(d => d.status === 'processado');
  const recicladoKg = Number(
    descartesProcessados.reduce((acc, descarte) => acc + Number(descarte.quantidade || 0), 0).toFixed(1)
  );
  const pontos = Math.round(recicladoKg * 10);
  const emissaoEvitada = Number((recicladoKg * 1.7).toFixed(1));

  const chartData = useMemo(() => {
    const grouped = userDescartes.reduce((acc: Record<string, number>, descarte) => {
      const date = new Date(descarte.data_descarte);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      acc[key] = (acc[key] || 0) + Number(descarte.quantidade || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const [aYear, aMonth] = a.split('-').map(Number);
        const [bYear, bMonth] = b.split('-').map(Number);
        return new Date(aYear, aMonth).getTime() - new Date(bYear, bMonth).getTime();
      })
      .map(([key, kg]) => {
        const [, month] = key.split('-').map(Number);
        return { mes: monthLabels[month], kg };
      })
      .slice(-6);
  }, [userDescartes]);

  const registrosRecentes = [...userDescartes]
    .sort((a, b) => new Date(b.data_descarte).getTime() - new Date(a.data_descarte).getTime())
    .slice(0, 3);
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1a4d2e]">
          Olá, {user?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo ao seu painel de sustentabilidade
        </p>
      </div>

      {/* Alerta de Itens Pendentes */}
      {descartesPendentes.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800">Coletas Pendentes</h3>
              <p className="text-sm text-yellow-700">
                Você tem {descartesPendentes.length} descarte(s) aguardando coleta.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              onClick={() => navigate('/app/historico')}
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Descartes"
          value={userDescartes.length}
          icon={Recycle}
          color="secondary"
        />
        <StatCard
          title="Material Reciclado"
          value={`${recicladoKg} kg`}
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Pontos Acumulados"
          value={pontos}
          icon={Award}
          color="primary"
        />
        <StatCard
          title="CO₂ Evitado"
          value={`${emissaoEvitada} kg`}
          icon={TrendingUp}
          color="secondary"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <button
          onClick={() => navigate('/app/registrar-descarte')}
          className="flex flex-col items-start gap-4 rounded-xl border-2 border-dashed border-[#4caf50] bg-[#4caf50]/5 p-6 text-left transition-colors hover:bg-[#4caf50]/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Registrar Descarte</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione um novo registro de descarte
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/app/historico')}
          className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <History className="h-6 w-6 text-[#1a4d2e]" />
          </div>
          <div>
            <h3 className="font-semibold">Ver Histórico</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulte seus registros anteriores
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/app/educacao')}
          className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <BookOpen className="h-6 w-6 text-[#1a4d2e]" />
          </div>
          <div>
            <h3 className="font-semibold">Aprender a Reciclar</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Conteúdo educativo sobre reciclagem
            </p>
          </div>
        </button>
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold">Descartes por Mês</h3>
          <div className="mt-6 h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Carregando descartes reais...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="kg" fill="#4caf50" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum descarte registrado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Últimos Registros</h3>
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                Carregando registros...
              </div>
            ) : registrosRecentes.length === 0 ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                Nenhum registro encontrado.
              </div>
            ) : registrosRecentes.map((descarte) => (
              <div key={descarte.id} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4caf50]/10">
                  <Recycle className="h-5 w-5 text-[#4caf50]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{descarte.tipo_residuo}</p>
                  <p className="text-sm text-muted-foreground">
                    {descarte.quantidade} {descarte.unidade}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {descarte.status === 'registrado' ? 'Aguardando coleta' :
                     descarte.status === 'coletado' ? `Coletado por ${descarte.nome_coletor || 'UP'}` :
                     descarte.status === 'em_transito' ? 'Em trânsito' :
                     'Finalizado'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(descarte.data_descarte).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-xl border bg-gradient-to-r from-[#4caf50]/10 to-[#81c784]/10 p-6">
        <h3 className="font-semibold text-[#1a4d2e]">💡 Dica de Sustentabilidade</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Você sabia que reciclar 1 tonelada de papel economiza cerca de 22 árvores? Continue
          registrando seus descartes e acompanhe seu impacto positivo!
        </p>
      </div>
    </div>
  );
}
