import { useAuth } from '../../contexts/AuthContext';
import { mockImpactos } from '../../lib/mockData';
import { TrendingUp, Leaf, Award, DollarSign, ArrowLeft, Star, Target, Trophy, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Badge } from '../components/ui/badge';

export function ImpactoAmbiental() {
  const { user } = useAuth();
  const isPremium = user?.perfil === 'UP';

  const impacto = mockImpactos[user?.id || ''] || {
    pontos: 0,
    reciclado_kg: 0,
    emissao_evitada: 0,
    economia_gerada: 0
  };

  const monthlyData = [
    { mes: 'Out', kg: 5, co2: 10, pontos: 50 },
    { mes: 'Nov', kg: 8, co2: 16, pontos: 85 },
    { mes: 'Dez', kg: 10, co2: 20, pontos: 120 },
    { mes: 'Jan', kg: 12, co2: 24, pontos: 150 },
    { mes: 'Fev', kg: 15, co2: 30, pontos: 180 },
    { mes: 'Mar', kg: impacto.reciclado_kg, co2: impacto.emissao_evitada, pontos: impacto.pontos }
  ];

  // Dados de comparativo (Premium)
  const mesAtual = impacto.reciclado_kg;
  const mesAnterior = 15;
  const variacaoMensal = ((mesAtual - mesAnterior) / mesAnterior * 100).toFixed(1);

  // Dados de radar para categorias (Premium)
  const radarData = [
    { categoria: 'Papel', valor: 85 },
    { categoria: 'Plástico', valor: 70 },
    { categoria: 'Vidro', valor: 60 },
    { categoria: 'Metal', valor: 50 },
    { categoria: 'Eletrônicos', valor: 40 }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Impacto Ambiental</h1>
          {isPremium && (
            <Badge className="bg-yellow-400 text-[#1a4d2e]">
              <Star className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        <p className="mt-2 text-muted-foreground">
          {isPremium
            ? 'Análise completa com comparativos e sugestões personalizadas'
            : 'Acompanhe suas métricas de sustentabilidade'}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-gradient-to-br from-[#4caf50] to-[#45a049] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Material Reciclado</p>
              <h3 className="mt-2 text-3xl font-bold">{impacto.reciclado_kg} kg</h3>
            </div>
            <Leaf className="h-12 w-12 text-white/40" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CO₂ Evitado</p>
              <h3 className="mt-2 text-3xl font-bold text-[#1a4d2e]">{impacto.emissao_evitada} kg</h3>
            </div>
            <TrendingUp className="h-12 w-12 text-[#81c784]" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pontos Acumulados</p>
              <h3 className="mt-2 text-3xl font-bold text-[#1a4d2e]">{impacto.pontos}</h3>
            </div>
            <Award className="h-12 w-12 text-[#ffc107]" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Economia Gerada</p>
              <h3 className="mt-2 text-3xl font-bold text-[#1a4d2e]">R$ {impacto.economia_gerada}</h3>
            </div>
            <DollarSign className="h-12 w-12 text-[#4caf50]" />
          </div>
        </div>
      </div>

      {/* Comparativo Mensal Premium */}
      {isPremium && (
        <div className="rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Comparativo Mensal</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-yellow-700">Mês Atual</p>
              <p className="mt-1 text-3xl font-bold text-yellow-900">{mesAtual} kg</p>
              <p className="mt-1 text-xs text-yellow-600">Material reciclado em Março</p>
            </div>
            <div>
              <p className="text-sm text-yellow-700">Mês Anterior</p>
              <p className="mt-1 text-3xl font-bold text-yellow-900">{mesAnterior} kg</p>
              <p className="mt-1 text-xs text-yellow-600">Material reciclado em Fevereiro</p>
            </div>
            <div>
              <p className="text-sm text-yellow-700">Variação</p>
              <p className={`mt-1 text-3xl font-bold ${Number(variacaoMensal) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(variacaoMensal) >= 0 ? '+' : ''}{variacaoMensal}%
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                {Number(variacaoMensal) >= 0 ? 'Aumento em relação ao mês anterior' : 'Redução em relação ao mês anterior'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Premium */}
      {isPremium && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Posição no Ranking</p>
                <p className="text-2xl font-bold text-amber-900">#12</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-amber-600">Entre usuários Premium da região</p>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Meta do Mês</p>
                <p className="text-2xl font-bold text-green-900">83%</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-green-600">Faltam 2.5 kg para atingir</p>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Sequência</p>
                <p className="text-2xl font-bold text-blue-900">15 dias</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-600">Registros consecutivos</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Evolução de Reciclagem</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="#4caf50"
                  fillOpacity={1}
                  fill="url(#colorKg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Emissões de CO₂ Evitadas</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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
                <Line
                  type="monotone"
                  dataKey="co2"
                  stroke="#4caf50"
                  strokeWidth={3}
                  dot={{ fill: '#4caf50', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Radar Premium */}
        {isPremium && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Desempenho por Categoria</h3>
            <p className="mt-1 text-sm text-muted-foreground">Análise detalhada por tipo de material</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="categoria" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar
                    name="Desempenho"
                    dataKey="valor"
                    stroke="#4caf50"
                    fill="#4caf50"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h4 className="font-semibold text-[#1a4d2e]">🌳 Árvores Equivalentes</h4>
          <p className="mt-2 text-3xl font-bold">{Math.round(impacto.reciclado_kg / 10)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Árvores que deixaram de ser cortadas
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h4 className="font-semibold text-[#1a4d2e]">💧 Água Economizada</h4>
          <p className="mt-2 text-3xl font-bold">{impacto.reciclado_kg * 20} L</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Litros de água economizados
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h4 className="font-semibold text-[#1a4d2e]">⚡ Energia Poupada</h4>
          <p className="mt-2 text-3xl font-bold">{impacto.reciclado_kg * 5} kWh</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quilowatts-hora economizados
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div className={`rounded-xl border p-6 ${
        isPremium
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
          : 'bg-gradient-to-r from-[#4caf50]/10 to-[#81c784]/10'
      }`}>
        <h3 className={`font-semibold ${isPremium ? 'text-yellow-900' : 'text-[#1a4d2e]'}`}>
          {isPremium ? '🎯 Sugestões Personalizadas Premium' : '📈 Sugestões para Melhorar seu Impacto'}
        </h3>
        {isPremium ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-white/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Mantenha o Ritmo!</p>
                  <p className="mt-1 text-sm text-green-700">
                    Você está {variacaoMensal}% acima do mês anterior. Continue registrando seus descartes regularmente para manter essa evolução positiva.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Foco em Eletrônicos</p>
                  <p className="mt-1 text-sm text-blue-700">
                    Seus registros de eletrônicos estão 40% abaixo da média. Considere descartar baterias e aparelhos antigos em pontos especializados.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/60 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">Oportunidade de Benefícios</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Você está a apenas 30 pontos de desbloquear um novo benefício Premium. Continue registrando para conquistar!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#4caf50]">✓</span>
              <span>Separe materiais recicláveis diariamente para aumentar seu volume mensal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4caf50]">✓</span>
              <span>Participe de campanhas de coleta para ganhar pontos extras</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4caf50]">✓</span>
              <span>Compartilhe conhecimento com amigos e familiares sobre reciclagem</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
