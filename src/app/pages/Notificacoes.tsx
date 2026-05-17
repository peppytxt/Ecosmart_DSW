import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockNotificacoes } from '../../lib/mockData';
import { Bell, BellOff, Check, Archive, ArrowLeft } from 'lucide-react';

export function Notificacoes() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notificacoes, setNotificacoes] = useState(
    mockNotificacoes.filter(n => n.usuario_id === user?.id)
  );
  const [toast, setToast] = useState<string | null>(null);

  const filteredNotificacoes = filter === 'all'
    ? notificacoes
    : notificacoes.filter(n => !n.lida);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsRead = (id: string) => {
    setNotificacoes(prev =>
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
    showToast('Notificação marcada como lida');
  };

  const handleMarkAllAsRead = () => {
    setNotificacoes(prev =>
      prev.map(n => ({ ...n, lida: true }))
    );
    showToast('Todas as notificações marcadas como lidas');
  };

  const handleArchive = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
    showToast('Notificação arquivada');
  };

  const typeIcons: Record<string, string> = {
    sistema: '⚙️',
    coleta: '🚛',
    campanha: '📣',
    educativo: '📚'
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 animate-in slide-in-from-top-2 rounded-lg border bg-[#4caf50] px-6 py-3 text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Notificações</h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe suas atualizações e alertas
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 text-sm text-[#4caf50] transition-colors hover:text-[#45a049]"
        >
          <Check className="h-4 w-4" />
          Marcar todas como lidas
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-[#4caf50]" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{notificacoes.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <BellOff className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Não Lidas</p>
              <p className="text-2xl font-bold">
                {notificacoes.filter(n => !n.lida).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 transition-colors ${
            filter === 'all'
              ? 'bg-[#4caf50] text-white'
              : 'border bg-card hover:bg-muted'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-lg px-4 py-2 transition-colors ${
            filter === 'unread'
              ? 'bg-[#4caf50] text-white'
              : 'border bg-card hover:bg-muted'
          }`}
        >
          Não Lidas
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotificacoes.map((notificacao) => (
          <div
            key={notificacao.id}
            className={`rounded-xl border p-4 transition-colors ${
              !notificacao.lida
                ? 'border-[#4caf50]/30 bg-[#4caf50]/5'
                : 'bg-card hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
                {typeIcons[notificacao.tipo]}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{notificacao.titulo}</h4>
                      {!notificacao.lida && (
                        <div className="h-2 w-2 rounded-full bg-[#4caf50]" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notificacao.mensagem}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(notificacao.created_at).toLocaleString('pt-BR')}
                      </p>
                      {!notificacao.lida && (
                        <button
                          onClick={() => handleMarkAsRead(notificacao.id)}
                          className="text-xs text-[#4caf50] transition-colors hover:text-[#45a049]"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleArchive(notificacao.id)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
                title="Arquivar notificação"
              >
                <Archive className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}

        {filteredNotificacoes.length === 0 && (
          <div className="py-12 text-center">
            <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Nenhuma notificação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
