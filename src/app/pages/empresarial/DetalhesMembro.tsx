import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Building2, Calendar, Check, Mail, MapPin, Phone, Recycle, Trash2, TrendingUp, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatCard } from '../../components/Card';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';

type MembroWorkspace = {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  usuario_email: string;
  usuario_telefone?: string | null;
  usuario_endereco?: string | null;
  perfil_usuario: 'UC' | 'UP' | 'UE' | 'UA';
  status_vinculo: 'ativo' | 'inativo';
  setor?: string | null;
  unidade?: string | null;
  data_vinculo: string;
};

type Descarte = {
  id: number;
  usuario_id: number;
  coletor_id?: number | null;
  tipo_residuo: string;
  quantidade: number;
  unidade: string;
  local: string;
  status: string;
  data_descarte: string;
  nome_coletor?: string | null;
};

const perfilLabels: Record<string, string> = {
  UC: 'Usuário Comum',
  UP: 'Usuário Premium',
  UE: 'Usuário Empresarial',
  UA: 'Administrador',
};

const statusLabels: Record<string, string> = {
  registrado: 'Registrado',
  coletado: 'Coletado',
  em_transito: 'Em trânsito',
  processado: 'Finalizado',
};

export function DetalhesMembro() {
  const { membroId } = useParams();
  const navigate = useNavigate();
  const [membro, setMembro] = useState<MembroWorkspace | null>(null);
  const [descartesEmpresa, setDescartesEmpresa] = useState<Descarte[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const carregarDados = async (showLoading = false) => {
    if (!membroId) {
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const [membroResponse, descartesResponse] = await Promise.all([
        apiFetch(`/workspace/vinculos/${membroId}/`),
        apiFetch('/empresa/descartes/'),
      ]);

      if (!membroResponse.ok) {
        throw new Error('Membro não encontrado.');
      }

      const membroData = await membroResponse.json();
      const descartesData = descartesResponse.ok ? await descartesResponse.json() : [];

      setMembro(membroData);
      setDescartesEmpresa(descartesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar o membro.');
      setMembro(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados(true);
    const intervalId = window.setInterval(() => carregarDados(), 5000);
    return () => window.clearInterval(intervalId);
  }, [membroId]);

  const descartes = useMemo(() => {
    if (!membro) {
      return [];
    }

    return descartesEmpresa.filter(descarte =>
      descarte.usuario_id === membro.usuario_id || descarte.coletor_id === membro.usuario_id
    );
  }, [descartesEmpresa, membro]);

  const totalReciclado = descartes.reduce((acc, descarte) => acc + Number(descarte.quantidade || 0), 0);
  const coletasRealizadas = membro
    ? descartes.filter(descarte => descarte.coletor_id === membro.usuario_id).length
    : 0;
  const descartesSolicitados = membro
    ? descartes.filter(descarte => descarte.usuario_id === membro.usuario_id).length
    : 0;

  const handleAtualizarVinculo = async (status_vinculo: 'ativo' | 'inativo') => {
    if (!membro) {
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch(`/workspace/vinculos/${membro.id}/`, {
        method: 'PUT',
        body: JSON.stringify({ status_vinculo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar vínculo.');
      }

      const data = await response.json();
      setMembro(data);
      toast.success(status_vinculo === 'ativo' ? 'Vínculo reativado.' : 'Vínculo removido.');

      if (status_vinculo === 'inativo') {
        navigate('/app/empresarial/workspace');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar vínculo.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverVinculo = () => {
    if (membro && confirm(`Deseja realmente remover ${membro.usuario_nome} do workspace?`)) {
      handleAtualizarVinculo('inativo');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/app/empresarial/workspace')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Carregando membro...</p>
        </div>
      </div>
    );
  }

  if (!membro) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/app/empresarial/workspace')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Membro não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/app/empresarial/workspace')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e]">Detalhes do Membro</h1>
            <p className="mt-1 text-muted-foreground">
              Informações e atividades do usuário vinculado
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {membro.status_vinculo === 'inativo' ? (
            <Button disabled={saving} onClick={() => handleAtualizarVinculo('ativo')}>
              <Check className="mr-2 h-4 w-4" />
              Reativar Vínculo
            </Button>
          ) : (
            <Button variant="destructive" disabled={saving} onClick={handleRemoverVinculo}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remover do Workspace
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Informações do Usuário</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{membro.usuario_nome}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{membro.usuario_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{membro.usuario_telefone || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{membro.usuario_endereco || '-'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Perfil</p>
                <Badge variant={membro.perfil_usuario === 'UP' ? 'default' : 'secondary'}>
                  {perfilLabels[membro.perfil_usuario] || membro.perfil_usuario}
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Setor</p>
                <p className="font-medium">{membro.setor || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Unidade</p>
                <p className="font-medium">{membro.unidade || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Vínculo</p>
                <p className="font-medium">{new Date(membro.data_vinculo).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Status do Vínculo</p>
                <Badge variant={membro.status_vinculo === 'ativo' ? 'default' : 'destructive'}>
                  {membro.status_vinculo === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Registros Relacionados" value={descartes.length} icon={Recycle} color="primary" />
        <StatCard title="Como Solicitante" value={descartesSolicitados} icon={User} color="secondary" />
        <StatCard title="Como Coletor" value={coletasRealizadas} icon={TrendingUp} color="accent" />
        <StatCard title="Material Relacionado" value={`${totalReciclado} kg`} icon={TrendingUp} color="primary" />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Histórico Vinculado</h3>
        {descartes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium">Data</th>
                  <th className="pb-3 text-left font-medium">Tipo de Resíduo</th>
                  <th className="pb-3 text-left font-medium">Quantidade</th>
                  <th className="pb-3 text-left font-medium">Local</th>
                  <th className="pb-3 text-left font-medium">Coletor</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {descartes.slice(0, 10).map((descarte) => (
                  <tr key={descarte.id} className="border-b last:border-0">
                    <td className="py-4">{new Date(descarte.data_descarte).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4">{descarte.tipo_residuo}</td>
                    <td className="py-4">{descarte.quantidade} {descarte.unidade}</td>
                    <td className="py-4">{descarte.local}</td>
                    <td className="py-4">{descarte.nome_coletor || '-'}</td>
                    <td className="py-4">
                      <Badge
                        variant={
                          descarte.status === 'processado' ? 'default' :
                          descarte.status === 'coletado' ? 'secondary' :
                          'outline'
                        }
                      >
                        {statusLabels[descarte.status] || descarte.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum descarte vinculado a este membro ainda.
          </div>
        )}
      </div>
    </div>
  );
}
