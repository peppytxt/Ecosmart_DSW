import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table } from '../components/Table';
import { Drawer } from '../components/Modal';
import { Search, Download, Filter, Calendar, Package, ArrowLeft, Star, TrendingUp, BarChart3, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';

export function HistoricoDescartes() {
  const { user } = useAuth();
  const [userDescartes, setUserDescartes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDescarte, setSelectedDescarte] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriodo, setFilterPeriodo] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const isPremium = user?.perfil === 'UP';
  const isEmpresarial = user?.perfil === 'UE';
  const statusLabels: Record<string, string> = {
    registrado: 'Pendente',
    coletado: 'Coletado',
    em_transito: 'Em Trânsito',
    processado: 'Finalizado'
  };

  const carregarHistorico = async (showLoading = false) => {
    if (!user?.id) return;

    if (showLoading) {
      setLoading(true);
    }

    try {
      if (isEmpresarial) {
        const response = await apiFetch('/empresa/descartes/');

        if (!response.ok) throw new Error();

        const data = await response.json();
        setUserDescartes(data);
        return;
      }

      if (isPremium) {
        const [historicoResponse, coletasResponse] = await Promise.all([
          apiFetch(`/descartes/historico/?usuario_id=${user.id}`),
          apiFetch('/descartes/minhas-coletas/'),
        ]);

        if (!historicoResponse.ok || !coletasResponse.ok) throw new Error();

        const historicoData = await historicoResponse.json();
        const coletasData = await coletasResponse.json();
        const mergedById = new Map<number, any>();

        [...historicoData, ...coletasData].forEach((item) => {
          mergedById.set(Number(item.id), item);
        });

        setUserDescartes(Array.from(mergedById.values()));
        return;
      }

      const response = await apiFetch(`/descartes/historico/?usuario_id=${user.id}`);

      if (!response.ok) throw new Error();

      const data = await response.json();
      setUserDescartes(data);
    } catch {
      toast.error('Erro ao carregar seu histórico.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    carregarHistorico(true);
    const intervalId = window.setInterval(() => carregarHistorico(), 5000);
    return () => window.clearInterval(intervalId);
  }, [user?.id, isPremium, isEmpresarial]);

  const filteredDescartes = userDescartes.filter(d => {
    const matchesSearch = d.tipo_residuo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.local || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.usuario_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.nome_coletor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || d.status === filterStatus;
    const matchesCategoria = filterCategoria === 'all' || d.tipo_residuo === filterCategoria;

    let matchesPeriodo = true;
    if (filterPeriodo !== 'all') {
      const descartDate = new Date(d.data_descarte);
      const now = new Date();
      if (filterPeriodo === '7dias') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriodo = descartDate >= weekAgo;
      } else if (filterPeriodo === '30dias') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesPeriodo = descartDate >= monthAgo;
      } else if (filterPeriodo === '90dias') {
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        matchesPeriodo = descartDate >= threeMonthsAgo;
      }
    }

    return matchesSearch && matchesFilter && matchesCategoria && matchesPeriodo;
  });

  const handleExportar = () => {
    toast.success('Relatório exportado com sucesso!');
    setIsExportModalOpen(false);
  };

  // Cálculos dinâmicos com dados reais
  const totalKgMesAtual = userDescartes
    .filter(d => new Date(d.data_descarte).getMonth() === new Date().getMonth())
    .reduce((acc, d) => acc + d.quantidade, 0);

  const totalKgMesAnterior = userDescartes
    .filter(d => {
      const descartDate = new Date(d.data_descarte);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return descartDate.getMonth() === lastMonth.getMonth();
    })
    .reduce((acc, d) => acc + d.quantidade, 0);

  const percentualVariacao = totalKgMesAnterior > 0
    ? ((totalKgMesAtual - totalKgMesAnterior) / totalKgMesAnterior * 100).toFixed(0)
    : 0;

  const columns = [
    {
      key: 'data_descarte',
      header: 'Data',
      render: (item: any) => new Date(item.data_descarte).toLocaleDateString('pt-BR')
    },
    { key: 'tipo_residuo', header: 'Tipo de Resíduo' },
    {
      key: 'quantidade',
      header: 'Quantidade',
      render: (item: any) => `${item.quantidade} ${item.unidade}`
    },
    { key: 'local', header: 'Local' },
    {
      key: 'coletor',
      header: 'Coletor',
      render: (item: any) => (
        <span className="text-sm font-medium text-muted-foreground">
          {item.nome_coletor || 'Pendente'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => {
        const statusConfig = {
          registrado: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
          em_transito: { label: 'Em Trânsito', class: 'bg-blue-100 text-blue-800' },
          coletado: { label: 'Na Unidade', class: 'bg-purple-100 text-purple-800' },
          processado: { label: 'Finalizado', class: 'bg-green-100 text-green-800' }
        };
        const config = statusConfig[item.status as keyof typeof statusConfig] || { label: item.status, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.class}`}>
            {config.label}
          </span>
        );
      }
    }
  ];

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground animate-pulse">Sincronizando seu histórico ecológico...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botão Voltar*/}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#1a4d2e]">Histórico de Descartes</h1>
            {isPremium && (
              <Badge className="bg-yellow-400 text-[#1a4d2e]">
                <Star className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">
            {isEmpresarial
              ? 'Coletas vinculadas à empresa, atualizadas automaticamente'
              : isPremium
                ? 'Seus descartes e coletas, atualizados automaticamente'
                : 'Todos os seus registros de descarte armazenados na nuvem'}
          </p>
        </div>
        <Button onClick={() => setIsExportModalOpen(true)} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Cards de Métricas Reais baseados no Array userDescartes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4caf50]/10">
              <Package className="h-5 w-5 text-[#4caf50]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{userDescartes.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Este Mês</p>
              <p className="text-xl font-bold">
                {userDescartes.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processados</p>
              <p className="text-xl font-bold">
                {userDescartes.filter(d => d.status === 'processado').length}
              </p>
            </div>
          </div>
        </div>
        {isPremium && (
          <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Variação Mensal</p>
                <p className={`text-xl font-bold ${Number(percentualVariacao) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(percentualVariacao) >= 0 ? '+' : ''}{percentualVariacao}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs de Filtros */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por tipo ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-lg border bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Todos os status</option>
              <option value="registrado">Registrado</option>
              <option value="coletado">Coletado</option>
              <option value="processado">Processado</option>
            </select>
          </div>

          {/* Filtros Avançados Premium */}
          {isPremium && (
            <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Filtros Premium</span>
              </div>
              <select
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                className="h-10 rounded-lg border bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todos os períodos</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="90dias">Últimos 90 dias</option>
              </select>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="h-10 rounded-lg border bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todas as categorias</option>
                <option value="Papel">Papel</option>
                <option value="Plástico">Plástico</option>
                <option value="Vidro">Vidro</option>
                <option value="Metal">Metal</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Óleo de Cozinha">Óleo de Cozinha</option>
                <option value="Lâmpadas">Lâmpadas</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Dados Reais */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Table
          data={filteredDescartes}
          columns={columns}
          onRowClick={setSelectedDescarte}
          emptyMessage="Nenhum descarte encontrado"
        />
      </div>ent 

      {/* Drawer */}
      <Drawer
        isOpen={!!selectedDescarte}
        onClose={() => setSelectedDescarte(null)}
        title="Detalhes do Descarte"
      >
        {selectedDescarte && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Resíduo</p>
              <p className="mt-1 font-medium">{selectedDescarte.tipo_residuo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantidade</p>
              <p className="mt-1 font-medium">{selectedDescarte.quantidade} {selectedDescarte.unidade}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data do Descarte</p>
              <p className="mt-1 font-medium">
                {new Date(selectedDescarte.data_descarte).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Local</p>
              <p className="mt-1 font-medium">{selectedDescarte.local}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="mt-1">{selectedDescarte.observacao || 'Nenhuma observação'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <p className="text-sm text-muted-foreground">Informação da Coleta</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#1a4d2e]/10 flex items-center justify-center">
                   <Package className="h-4 w-4 text-[#1a4d2e]" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedDescarte.nome_coletor 
                      ? `Coletado por: ${selectedDescarte.nome_coletor}` 
                      : 'Aguardando Coletor'}
                  </p>
                  {selectedDescarte.instituicao_coletora_nome && (
                    <p className="text-xs text-muted-foreground">
                      Vinculado a: {selectedDescarte.instituicao_coletora_nome}
                    </p>
                  )}
                </div>
              </div>
              {selectedDescarte.status !== 'registrado' && (
              <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase">Rastreamento</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coletado por: {selectedDescarte.nome_coletor}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDescarte.status === 'em_transito' 
                        ? 'O coletor está transportando seu resíduo.' 
                        : 'Entregue na unidade de processamento.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                selectedDescarte.status === 'coletado' ? 'bg-green-100 text-green-800' :
                selectedDescarte.status === 'processado' ? 'bg-blue-100 text-blue-800' :
                selectedDescarte.status === 'em_transito' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {statusLabels[selectedDescarte.status] || selectedDescarte.status}
              </span>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal de Exportação */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Histórico de Descartes</DialogTitle>
            <DialogDescription>
              {isPremium
                ? 'Exporte seus dados em diversos formatos com filtros personalizados'
                : 'Exporte seus dados de descarte em formato PDF'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Formato</label>
              <select className="mt-2 h-10 w-full rounded-lg border bg-background px-3">
                <option>PDF - Relatório Resumido</option>
                {isPremium && (
                  <>
                    <option>PDF - Relatório Completo</option>
                    <option>Excel - Planilha Detalhada</option>
                    <option>CSV - Dados Brutos</option>
                  </>
                )}
              </select>
            </div>
            {isPremium && (
              <>
                <div>
                  <label className="text-sm font-medium">Período</label>
                  <select className="mt-2 h-10 w-full rounded-lg border bg-background px-3">
                    <option>Todos os registros</option>
                    <option>Últimos 7 dias</option>
                    <option>Últimos 30 dias</option>
                    <option>Últimos 90 dias</option>
                    <option>Último ano</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Incluir</label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Gráficos e estatísticas</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Comparativos mensais</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Fotos dos descartes</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#1a4d2e] hover:bg-[#143d24]" onClick={handleExportar}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
