import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Mail, RefreshCw, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import { StatCard } from '../../components/Card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';

type Workspace = {
  id: number;
  nome_workspace: string;
  tipo?: string;
};

type MembroWorkspace = {
  id: number;
  usuario_id: number;
  usuario_nome: string;
  usuario_email: string;
  perfil_usuario: 'UC' | 'UP' | 'UE' | 'UA';
  status_vinculo: 'ativo' | 'inativo';
  setor?: string | null;
  unidade?: string | null;
  data_vinculo: string;
};

type UsuarioDisponivel = {
  id: number;
  nome: string;
  email: string;
  perfil: 'UC' | 'UP' | 'UE' | 'UA';
};

const perfilLabels: Record<string, string> = {
  UC: 'Comum',
  UP: 'Premium',
  UE: 'Empresa',
  UA: 'Admin',
};

export function GestaoWorkspace() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isVincularModalOpen, setIsVincularModalOpen] = useState(false);
  const [isConviteModalOpen, setIsConviteModalOpen] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [membros, setMembros] = useState<MembroWorkspace[]>([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<UsuarioDisponivel[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [emailConvite, setEmailConvite] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const carregarWorkspace = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await apiFetch('/workspace/');

      if (!response.ok) {
        throw new Error('Falha ao carregar workspace.');
      }

      const data = await response.json();
      setWorkspace(data.workspace);
      setMembros(data.membros || []);
      setUsuariosDisponiveis(data.usuarios_disponiveis || []);
    } catch (error) {
      toast.error('Não foi possível carregar os vínculos da empresa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarWorkspace(true);
    const intervalId = window.setInterval(() => carregarWorkspace(), 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const membrosAtivos = membros.filter(membro => membro.status_vinculo === 'ativo');
  const totalMembros = membrosAtivos.length;
  const usuariosComuns = membrosAtivos.filter(membro => membro.perfil_usuario === 'UC').length;
  const usuariosPremium = membrosAtivos.filter(membro => membro.perfil_usuario === 'UP').length;
  const vinculosInativos = membros.filter(membro => membro.status_vinculo === 'inativo').length;

  const filteredMembros = useMemo(() => {
    const termo = searchTerm.toLowerCase();

    return membros.filter(membro => {
      const matchSearch =
        membro.usuario_nome.toLowerCase().includes(termo) ||
        membro.usuario_email.toLowerCase().includes(termo);
      const matchPerfil = perfilFilter === 'todos' || membro.perfil_usuario === perfilFilter;
      const matchStatus = statusFilter === 'todos' || membro.status_vinculo === statusFilter;
      return matchSearch && matchPerfil && matchStatus;
    });
  }, [membros, perfilFilter, searchTerm, statusFilter]);

  const handleVincularUsuario = async () => {
    if (!usuarioSelecionado) {
      toast.error('Selecione um usuário para vincular.');
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch('/workspace/vinculos/', {
        method: 'POST',
        body: JSON.stringify({ usuario_id: Number(usuarioSelecionado) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao vincular usuário.');
      }

      toast.success('Usuário vinculado com sucesso.');
      setUsuarioSelecionado('');
      setIsVincularModalOpen(false);
      carregarWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao vincular usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarConvite = async () => {
    if (!emailConvite.trim()) {
      toast.error('Informe o e-mail do usuário.');
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch('/workspace/vinculos/', {
        method: 'POST',
        body: JSON.stringify({ email: emailConvite.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Usuário não encontrado.');
      }

      toast.success('Usuário vinculado com sucesso.');
      setEmailConvite('');
      setIsConviteModalOpen(false);
      carregarWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'O usuário precisa estar cadastrado para ser vinculado.');
    } finally {
      setSaving(false);
    }
  };

  const handleAtualizarVinculo = async (membroId: number, status_vinculo: 'ativo' | 'inativo') => {
    setSaving(true);

    try {
      const response = await apiFetch(`/workspace/vinculos/${membroId}/`, {
        method: 'PUT',
        body: JSON.stringify({ status_vinculo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar vínculo.');
      }

      toast.success(status_vinculo === 'ativo' ? 'Vínculo reativado.' : 'Vínculo removido.');
      carregarWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar vínculo.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverVinculo = (membro: MembroWorkspace) => {
    if (confirm(`Deseja realmente remover ${membro.usuario_nome} do workspace?`)) {
      handleAtualizarVinculo(membro.id, 'inativo');
    }
  };

  const handleVerDetalhes = (membroId: number) => {
    navigate(`/app/empresarial/membro/${membroId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Gestão do Workspace</h1>
          <p className="mt-2 text-muted-foreground">
            {workspace?.nome_workspace || 'Workspace empresarial'}
          </p>
        </div>
        <Button variant="outline" onClick={() => carregarWorkspace(true)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Membros" value={totalMembros} icon={Users} color="primary" />
        <StatCard title="Usuários Comuns" value={usuariosComuns} icon={Users} color="secondary" />
        <StatCard title="Usuários Premium" value={usuariosPremium} icon={Users} color="accent" />
        <StatCard title="Vínculos Inativos" value={vinculosInativos} icon={Mail} color="primary" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setIsVincularModalOpen(true)} className="bg-[#1a4d2e] hover:bg-[#143d24]">
          <UserPlus className="mr-2 h-4 w-4" />
          Vincular Usuário Existente
        </Button>
        <Button variant="outline" onClick={() => setIsConviteModalOpen(true)}>
          <Mail className="mr-2 h-4 w-4" />
          Vincular por E-mail
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-semibold">Membros Vinculados</h3>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10 md:w-80"
              />
            </div>
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os perfis</SelectItem>
                <SelectItem value="UC">Usuário Comum</SelectItem>
                <SelectItem value="UP">Usuário Premium</SelectItem>
                <SelectItem value="UE">Empresa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left font-medium">Nome</th>
                <th className="pb-3 text-left font-medium">E-mail</th>
                <th className="pb-3 text-left font-medium">Perfil</th>
                <th className="pb-3 text-left font-medium">Setor</th>
                <th className="pb-3 text-left font-medium">Unidade</th>
                <th className="pb-3 text-left font-medium">Status</th>
                <th className="pb-3 text-left font-medium">Data Vínculo</th>
                <th className="pb-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Carregando membros do workspace...
                  </td>
                </tr>
              ) : filteredMembros.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              ) : filteredMembros.map((membro) => (
                <tr key={membro.id} className="border-b last:border-0">
                  <td className="py-4">{membro.usuario_nome}</td>
                  <td className="py-4 text-muted-foreground">{membro.usuario_email}</td>
                  <td className="py-4">
                    <Badge variant={membro.perfil_usuario === 'UP' ? 'default' : 'secondary'}>
                      {perfilLabels[membro.perfil_usuario] || membro.perfil_usuario}
                    </Badge>
                  </td>
                  <td className="py-4">{membro.setor || '-'}</td>
                  <td className="py-4">{membro.unidade || '-'}</td>
                  <td className="py-4">
                    <Badge variant={membro.status_vinculo === 'ativo' ? 'default' : 'destructive'}>
                      {membro.status_vinculo === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {new Date(membro.data_vinculo).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleVerDetalhes(membro.id)}>
                        Ver Detalhes
                      </Button>
                      {membro.status_vinculo === 'ativo' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={saving}
                          onClick={() => handleRemoverVinculo(membro)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={saving}
                          onClick={() => handleAtualizarVinculo(membro.id, 'ativo')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isVincularModalOpen} onOpenChange={setIsVincularModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vincular Usuário Existente</DialogTitle>
            <DialogDescription>
              Selecione um usuário cadastrado para associar ao workspace da empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Usuário</Label>
              <Select value={usuarioSelecionado} onValueChange={setUsuarioSelecionado}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuariosDisponiveis.length === 0 ? (
                    <SelectItem value="sem-usuarios" disabled>Nenhum usuário disponível</SelectItem>
                  ) : usuariosDisponiveis.map((usuario) => (
                    <SelectItem key={usuario.id} value={String(usuario.id)}>
                      {usuario.nome} - {usuario.email} ({perfilLabels[usuario.perfil] || usuario.perfil})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVincularModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1a4d2e] hover:bg-[#143d24]"
              disabled={saving || !usuarioSelecionado || usuarioSelecionado === 'sem-usuarios'}
              onClick={handleVincularUsuario}
            >
              Vincular Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConviteModalOpen} onOpenChange={setIsConviteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vincular por E-mail</DialogTitle>
            <DialogDescription>
              O usuário precisa já ter cadastro no EcoSmart para ser vinculado ao workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email-convite">E-mail do Usuário</Label>
              <Input
                id="email-convite"
                type="email"
                value={emailConvite}
                onChange={(event) => setEmailConvite(event.target.value)}
                placeholder="usuario@email.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConviteModalOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button className="bg-[#1a4d2e] hover:bg-[#143d24]" disabled={saving} onClick={handleEnviarConvite}>
              <Mail className="mr-2 h-4 w-4" />
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
