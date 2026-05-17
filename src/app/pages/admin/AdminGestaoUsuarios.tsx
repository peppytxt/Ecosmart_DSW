import { useEffect, useState } from 'react';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';

function normalizeStatus(status: unknown): 'ativo' | 'inativo' {
  return status === true || status === 'ativo' || String(status).toLowerCase() === 'true'
    ? 'ativo'
    : 'inativo';
}

export function AdminGestaoUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    perfil: 'UC' as 'UC' | 'UP' | 'UE' | 'UA',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  // Busca dados do Django
  useEffect(() => {
    apiFetch('/usuarios/')
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map((u: any) => ({
          ...u,
          status: normalizeStatus(u.status)
        }));
        setUsuarios(formattedData);
      })
      .catch(err => console.error("Erro ao buscar usuários:", err));
  }, []);

  const filteredUsers = usuarios.filter(u => {
    const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerfil = filterPerfil === 'all' || u.perfil === filterPerfil;
    return matchesSearch && matchesPerfil;
  });

  // Função para criar usuário no Banco (API)
  const handleNewUser = async () => {
  if (!formData.nome || !formData.email) {
    toast.error('Preencha todos os campos obrigatórios!');
    return;
  }

  try {
    const response = await apiFetch('/usuarios/', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        // Injeta uma senha padrão que o Django vai criptografar
        senha: 'EcoSmart123' 
      })
    });

    if (response.ok) {
      const savedUser = await response.json();
      const formattedUser = { ...savedUser, status: normalizeStatus(savedUser.status) };
      
      setUsuarios([...usuarios, formattedUser]); 
      toast.success('Usuário criado com a senha padrão: EcoSmart123');
      setShowNewModal(false);
      setFormData({ nome: '', email: '', telefone: '', endereco: '', perfil: 'UC', status: 'ativo' });
    }
  } catch (error) {
    toast.error('Erro ao conectar com o servidor.');
  }
};

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const statusBooleano = formData.status === 'ativo';

      const response = await apiFetch(`/usuarios/${selectedUser.id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          status: statusBooleano
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Formata a resposta para o padrão do front ('ativo' / 'inativo')
        const formattedUser = {
          ...updatedUser,
          status: normalizeStatus(updatedUser.status)
        };

        const updatedUsuarios = usuarios.map(u => 
          u.id === selectedUser.id ? formattedUser : u
        );

        setUsuarios(updatedUsuarios);
        toast.success('Usuário atualizado no Supabase!');
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        toast.error('Erro ao salvar alterações no banco.');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor.');
    }
  };
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${selectedUser.nome}?`)) {
      return;
    }

    try {
      const response = await apiFetch(`/usuarios/${selectedUser.id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsuarios(usuarios.filter(u => u.id !== selectedUser.id));
        toast.success('Usuário removido do Supabase!');
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        toast.error('Não foi possível deletar o usuário.');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor.');
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      nome: user.nome || '',
      email: user.email || '',
      telefone: user.telefone || '',
      endereco: user.endereco || '',
      perfil: user.perfil,
      status: normalizeStatus(user.status)
    });
    setShowEditModal(true);
  };

  const openNewModal = () => {
    setFormData({ nome: '', email: '', telefone: '', endereco: '', perfil: 'UC', status: 'ativo' });
    setShowNewModal(true);
  };
  
  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'perfil',
      header: 'Perfil',
      render: (item: any) => {
        const labels = { UC: 'Comum', UP: 'Premium', UE: 'Empresarial', UA: 'Admin' };
        return labels[item.perfil as keyof typeof labels] || item.perfil;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          item.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Data de Cadastro',
      render: (item: any) => item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '---'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Gestão de Usuários</h1>
          <p className="mt-2 text-muted-foreground">Gerenciar usuários do sistema</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-lg bg-[#4caf50] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#45a049]"
        >
          <UserPlus className="h-5 w-5" />
          Novo Usuário
        </button>
      </div>

      {/* Stats - Agora lendo os dados do Banco! */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Comum', count: usuarios.filter(u => u.perfil === 'UC').length },
          { label: 'Premium', count: usuarios.filter(u => u.perfil === 'UP').length },
          { label: 'Empresarial', count: usuarios.filter(u => u.perfil === 'UE').length },
          { label: 'Admin', count: usuarios.filter(u => u.perfil === 'UA').length }
        ].map((item, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-bold">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterPerfil}
          onChange={(e) => setFilterPerfil(e.target.value)}
          className="h-10 rounded-lg border bg-background px-4 text-sm"
        >
          <option value="all">Todos os perfis</option>
          <option value="UC">Comum</option>
          <option value="UP">Premium</option>
          <option value="UE">Empresarial</option>
          <option value="UA">Admin</option>
        </select>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Table data={filteredUsers} columns={columns} onRowClick={openEditModal} />
      </div>

      {/* Modal Novo Usuário */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Novo Usuário">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium">Nome Completo *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">E-mail *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="joao@email.com"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="(11) 98765-4321"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Perfil</label>
              <select
                value={formData.perfil}
                onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
                className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="UC">Usuário Comum</option>
                <option value="UP">Usuário Premium</option>
                <option value="UE">Usuário Empresarial</option>
                <option value="UA">Administrador</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Endereço Residencial/Comercial</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Rua, Número, Bairro - Cidade, Estado"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button onClick={() => setShowNewModal(false)} className="flex-1 rounded-lg border py-2 text-sm font-medium">Cancelar</button>
            <button onClick={handleNewUser} className="flex-1 rounded-lg bg-[#4caf50] py-2 text-white text-sm font-medium">Criar Usuário</button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Usuário */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Ficha do Usuário">
        {selectedUser && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium">Nome Completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* NOVOS CAMPOS NA EDIÇÃO */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Perfil de Acesso</label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
                  className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="UC">Usuário Comum</option>
                  <option value="UP">Usuário Premium</option>
                  <option value="UE">Usuário Empresarial</option>
                  <option value="UA">Administrador</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Endereço Cadastrado</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Status do Sistema</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-2 h-10 w-full rounded-lg border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2 pt-4 border-t">
              <div className="flex gap-3">
                <button onClick={() => setShowEditModal(false)} className="flex-1 rounded-lg border py-2 text-sm font-medium">
                  Cancelar
                </button>
                <button onClick={handleSaveEdit} className="flex-1 rounded-lg bg-[#4caf50] py-2 text-white text-sm font-medium">
                  Salvar Alterações
                </button>
              </div>
              <button 
                onClick={handleDeleteUser} 
                className="w-full rounded-lg bg-red-50 py-2 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium mt-2"
              >
                Excluir Usuário permanentemente
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
