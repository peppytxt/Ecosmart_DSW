import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';

export function NovoPedidoColeta() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    materiais: [] as string[],
    quantidade_estimada: '',
    endereco: '',
    observacao: '',
    data_preferencial: new Date().toISOString().split('T')[0],
    foto: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materiaisDisponiveis = ['Papel', 'Plástico', 'Vidro', 'Metal', 'Eletrônicos', 'Móveis', 'Entulho'];

  const handleSubmit = async () => {
    if (!formData.materiais.length) {
      toast.error('Selecione ao menos um material.');
      return;
    }

    if (!formData.quantidade_estimada || !formData.endereco) {
      toast.error('Informe quantidade estimada e endereço.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch('/pedidos-coleta/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar pedido.');
      }

      toast.success('Pedido de coleta enviado com sucesso!');
      setTimeout(() => navigate('/app/pedidos-coleta'), 800);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.includes(material)
        ? prev.materiais.filter(m => m !== material)
        : [...prev.materiais, material]
    }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Novo Pedido de Coleta</h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados para solicitar uma coleta
          </p>
        </div>
        <button
          onClick={() => navigate('/app/pedidos-coleta')}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Fechar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
              s <= step ? 'bg-[#4caf50] text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div className={`mx-2 h-1 w-12 ${s < step ? 'bg-[#4caf50]' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-8">
        {/* Step 1: Upload Foto */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">1. Foto do Material (Opcional)</h3>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 transition-colors hover:border-primary">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Clique para fazer upload ou arraste uma imagem
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Select Materials */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">2. Selecione os Materiais</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {materiaisDisponiveis.map((material) => (
                <button
                  key={material}
                  onClick={() => toggleMaterial(material)}
                  className={`rounded-lg border-2 p-4 text-center transition-colors ${
                    formData.materiais.includes(material)
                      ? 'border-[#4caf50] bg-[#4caf50]/10'
                      : 'border-muted hover:border-primary'
                  }`}
                >
                  <div className="text-3xl">♻️</div>
                  <p className="mt-2 font-medium">{material}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Quantity and Address */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">3. Quantidade e Endereço</h3>
            <div>
              <label className="block text-sm font-medium">Quantidade Estimada</label>
              <input
                type="text"
                value={formData.quantidade_estimada}
                onChange={(e) => setFormData({ ...formData, quantidade_estimada: e.target.value })}
                placeholder="Ex: 50 kg, 10 unidades..."
                className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Endereço para Coleta</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua, número, bairro - Cidade, Estado"
                className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Data Preferencial</label>
              <input
                type="date"
                value={formData.data_preferencial}
                onChange={(e) => setFormData({ ...formData, data_preferencial: e.target.value })}
                className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Observações</label>
              <textarea
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                rows={3}
                placeholder="Informações adicionais..."
                className="mt-2 w-full rounded-lg border bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">4. Revisar Pedido</h3>
            <div className="space-y-4 rounded-lg bg-muted/50 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Materiais</p>
                <p className="font-medium">{formData.materiais.join(', ') || 'Nenhum selecionado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantidade Estimada</p>
                <p className="font-medium">{formData.quantidade_estimada || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{formData.endereco || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Preferencial</p>
                <p className="font-medium">{new Date(formData.data_preferencial).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="font-medium">{formData.observacao || 'Nenhuma'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#4caf50] font-semibold text-white transition-colors hover:bg-[#45a049]"
            >
              Avançar
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#4caf50] font-semibold text-white transition-colors hover:bg-[#45a049]"
            >
              <Check className="h-5 w-5" />
              {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
