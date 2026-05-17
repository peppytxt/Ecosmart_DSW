import { useState } from 'react';
import { mockPontosColeta } from '../../lib/mockData';
import { MapPin, Phone, Clock, Search, Navigation, ArrowLeft } from 'lucide-react';

export function PontosColeta() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [selectedPonto, setSelectedPonto] = useState<any>(null);

  const tipos = ['all', ...Array.from(new Set(mockPontosColeta.map(p => p.tipo)))];

  const filteredPontos = mockPontosColeta.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = selectedTipo === 'all' || p.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

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
        <h1 className="text-3xl font-bold text-[#1a4d2e]">Pontos de Coleta</h1>
        <p className="mt-2 text-muted-foreground">
          Encontre os pontos de coleta mais próximos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Filters and List */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border bg-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="mt-3 h-10 w-full rounded-lg border bg-background px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Todos os tipos</option>
              {tipos.filter(t => t !== 'all').map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredPontos.map((ponto) => (
              <button
                key={ponto.id}
                onClick={() => setSelectedPonto(ponto)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedPonto?.id === ponto.id
                    ? 'border-[#4caf50] bg-[#4caf50]/5'
                    : 'bg-card hover:bg-muted'
                }`}
              >
                <h4 className="font-semibold">{ponto.nome}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{ponto.tipo}</p>
                <p className="mt-2 text-xs text-muted-foreground">{ponto.endereco}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Map and Details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Mock Map */}
          <div className="relative h-96 overflow-hidden rounded-xl border bg-muted">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-[#4caf50]" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Mapa com {filteredPontos.length} pontos de coleta
                </p>
              </div>
            </div>
          </div>

          {/* Selected Point Details */}
          {selectedPonto && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#1a4d2e]">{selectedPonto.nome}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedPonto.tipo}</p>
                </div>
                <button className="rounded-lg bg-[#4caf50] p-2 text-white transition-colors hover:bg-[#45a049]">
                  <Navigation className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">{selectedPonto.endereco}</p>
                  </div>
                </div>

                {selectedPonto.horario && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Horário</p>
                      <p className="text-sm text-muted-foreground">{selectedPonto.horario}</p>
                    </div>
                  </div>
                )}

                {selectedPonto.telefone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{selectedPonto.telefone}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Materiais Aceitos</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPonto.materiais_aceitos.map((material: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-[#4caf50]/10 px-3 py-1 text-xs font-medium text-[#4caf50]"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-lg border transition-colors hover:bg-muted">
                  Ver Rota
                </button>
                <button className="flex-1 rounded-lg bg-[#4caf50] font-semibold text-white transition-colors hover:bg-[#45a049]">
                  Solicitar Coleta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
