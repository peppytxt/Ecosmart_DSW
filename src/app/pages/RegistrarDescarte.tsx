import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

export function RegistrarDescarte() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tipo_residuo: '',
    quantidade: '',
    unidade: 'kg',
    data_descarte: new Date().toISOString().split('T')[0],
    local: '',
    observacao: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Você precisa estar logado para registrar um descarte.");
      return;
    }

    try {
      const response = await apiFetch('/descartes/', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          usuario_id: user.id
        }),
      });

      if (response.ok) {
        toast.success('Descarte salvo com sucesso!');
        setTimeout(() => navigate('/app/historico'), 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao registrar informações.');
      }
    } catch (err) {
      toast.error('Não foi possível conectar ao servidor backend.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const tiposResiduos = ['Papel', 'Plástico', 'Vidro', 'Metal', 'Eletrônicos', 'Óleo de Cozinha', 'Lâmpadas', 'Pilhas', 'Baterias'];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div>
        <h1 className="text-3xl font-bold text-[#1a4d2e]">Registrar Descarte</h1>
        <p className="mt-2 text-muted-foreground">
          Informe os detalhes do material descartado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Tipo de Resíduo *</label>
            <select
              name="tipo_residuo"
              value={formData.tipo_residuo}
              onChange={handleChange}
              required
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecione...</option>
              {tiposResiduos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Quantidade *</label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="h-12 flex-1 rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                name="unidade"
                value={formData.unidade}
                onChange={handleChange}
                className="h-12 w-32 rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="kg">kg</option>
                <option value="litros">litros</option>
                <option value="unidades">unidades</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Data do Descarte *</label>
            <input
              type="date"
              name="data_descarte"
              value={formData.data_descarte}
              onChange={handleChange}
              required
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Local *</label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              required
              placeholder="Ex: Residência, Ponto de Coleta..."
              className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Observações</label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows={3}
              placeholder="Informações adicionais sobre o descarte..."
              className="mt-2 w-full rounded-lg border bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Foto (opcional)</label>
            <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 transition-colors hover:border-primary">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Clique para fazer upload ou arraste uma imagem
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/app/dashboard')}
            className="h-12 flex-1 rounded-lg border transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#4caf50] font-semibold text-white transition-colors hover:bg-[#45a049]"
          >
            <Plus className="h-5 w-5" />
            Registrar Descarte
          </button>
        </div>
      </form>
    </div>
  );
}
