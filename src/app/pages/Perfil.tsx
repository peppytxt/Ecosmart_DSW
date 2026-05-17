import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserIcon, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';

export function Perfil() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || ''
  });

  useEffect(() => {
    if (user) {
    setFormData({
      nome: user.nome || '',
      email: user.email || '',
      telefone: user.telefone || '',
      endereco: user.endereco || ''
    });
  }
}, [user]);

  const handleSave = async () => {
    try {
      const response = await apiFetch(`/usuarios/${user?.id}/`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        toast.success('Perfil atualizado no Supabase!');
        setIsEditing(false);
      } else {
        toast.error('Não foi possível salvar as alterações.');
      }
    } catch (err) {
      toast.error('Erro ao salvar no banco');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a4d2e]">Meu Perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#4caf50] text-3xl font-bold text-white">
            {user?.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.nome}</h2>
            <p className="mt-1 text-muted-foreground">
              {user?.perfil === 'UC' && 'Usuário Comum'}
              {user?.perfil === 'UP' && 'Usuário Premium'}
              {user?.perfil === 'UE' && 'Usuário Empresarial'}
              {user?.perfil === 'UA' && 'Administrador'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-[#4caf50] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#45a049]"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Salvar
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Editar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <h3 className="font-semibold">Informações Pessoais</h3>
        <div className="mt-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              disabled={!isEditing}
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Phone className="h-4 w-4" />
              Telefone
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              disabled={!isEditing}
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Endereço
            </label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              disabled={!isEditing}
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <h3 className="font-semibold">Preferências</h3>
        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between">
            <span>Receber notificações por e-mail</span>
            <input type="checkbox" className="h-5 w-5 rounded text-primary" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span>Receber novidades e promoções</span>
            <input type="checkbox" className="h-5 w-5 rounded text-primary" />
          </label>
          <label className="flex items-center justify-between">
            <span>Compartilhar dados para relatórios públicos</span>
            <input type="checkbox" className="h-5 w-5 rounded text-primary" defaultChecked />
          </label>
        </div>
      </div>
    </div>
  );
}
