import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table } from '../components/Table';
import { Plus, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';

export function PedidosColeta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await apiFetch('/pedidos-coleta/');

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      toast.error('Não foi possível carregar seus pedidos de coleta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos(true);
    const intervalId = window.setInterval(() => carregarPedidos(), 5000);
    return () => window.clearInterval(intervalId);
  }, [user?.id]);

  const filteredPedidos = pedidos.filter(p =>
    selectedStatus === 'all' || p.status === selectedStatus
  );

  const statusCount = {
    solicitada: pedidos.filter(p => p.status === 'solicitada').length,
    agendada: pedidos.filter(p => p.status === 'agendada').length,
    finalizada: pedidos.filter(p => p.status === 'finalizada').length,
    cancelada: pedidos.filter(p => p.status === 'cancelada').length
  };

  const columns = [
    {
      key: 'data_solicitacao',
      header: 'Data',
      render: (item: any) => new Date(item.data_solicitacao).toLocaleDateString('pt-BR')
    },
    {
      key: 'materiais',
      header: 'Materiais',
      render: (item: any) => item.materiais.join(', ')
    },
    { key: 'quantidade_estimada', header: 'Quantidade' },
    { key: 'endereco', header: 'Endereço' },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => {
        const colors = {
          solicitada: 'bg-yellow-100 text-yellow-800',
          agendada: 'bg-blue-100 text-blue-800',
          finalizada: 'bg-green-100 text-green-800',
          cancelada: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colors[item.status as keyof typeof colors]}`}>
            {item.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Pedidos de Coleta</h1>
          <p className="mt-2 text-muted-foreground">
            Solicite e acompanhe suas coletas
          </p>
        </div>
        <button
          onClick={() => navigate('/app/pedidos-coleta/novo')}
          className="flex items-center gap-2 rounded-lg bg-[#4caf50] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#45a049]"
        >
          <Plus className="h-5 w-5" />
          Novo Pedido
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Solicitadas', count: statusCount.solicitada, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Agendadas', count: statusCount.agendada, color: 'bg-blue-100 text-blue-800' },
          { label: 'Finalizadas', count: statusCount.finalizada, color: 'bg-green-100 text-green-800' },
          { label: 'Canceladas', count: statusCount.cancelada, color: 'bg-red-100 text-red-800' }
        ].map((item, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.color}`}>
              {item.label}
            </div>
            <p className="mt-2 text-2xl font-bold">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="rounded-xl border bg-card p-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 rounded-lg border bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Todos os status</option>
          <option value="solicitada">Solicitada</option>
          <option value="agendada">Agendada</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando pedidos de coleta...</div>
        ) : (
          <Table
            data={filteredPedidos}
            columns={columns}
            emptyMessage="Nenhum pedido de coleta encontrado"
          />
        )}
      </div>
    </div>
  );
}
