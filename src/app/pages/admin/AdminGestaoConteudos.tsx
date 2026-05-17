import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { toast } from 'sonner';
import { apiFetch } from '../../../lib/api';

export function AdminGestaoConteudos() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [conteudos, setConteudos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Eletrônicos',
    descricao: '',
    comoDescartar: '',
    cuidados: ''
  });

  // Função para buscar dados do Django
  const fetchConteudos = async () => {
    try {
      const res = await apiFetch('/conteudos/');
      if (res.ok) {
        const data = await res.json();
        setConteudos(data);
      }
    } catch (err) {
      toast.error("Erro ao carregar dados do servidor.");
    }
  };

  useEffect(() => {
    fetchConteudos();
  }, []);

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: 'Eletrônicos',
      descricao: '',
      comoDescartar: '',
      cuidados: ''
    });
  };

  const handlePublish = async () => {
    if (!formData.nome || !formData.descricao || !formData.comoDescartar) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const response = await apiFetch('/conteudos/', {
        method: 'POST',
        body: JSON.stringify(formData) 
      });

      if (response.ok) {
        toast.success('Conteúdo publicado no banco de dados!');
        fetchConteudos(); 
        setShowNewModal(false);
        resetForm();
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
      try {
        const response = await apiFetch(`/conteudos/?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast.success('Conteúdo removido!');
          fetchConteudos(); 
        }
      } catch (error) {
        toast.error('Erro ao excluir conteúdo.');
      }
    }
  };

  const openViewModal = (content: any) => {
    setSelectedContent(content);
    setShowViewModal(true);
  };

  const openEditModal = (content: any) => {
    setSelectedContent(content);
    setFormData({
      nome: content.nome,
      categoria: content.categoria,
      descricao: content.descricao,
      comoDescartar: Array.isArray(content.como_descartar) ? content.como_descartar.join('\n') : content.como_descartar,
      cuidados: Array.isArray(content.cuidados) ? content.cuidados.join('\n') : content.cuidados
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Implementação futura do PUT/PATCH
    toast.info('Funcionalidade de edição em desenvolvimento');
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Gestão de Conteúdos</h1>
          <p className="mt-2 text-muted-foreground">Criar e gerenciar conteúdos educativos</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowNewModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#4caf50] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#45a049]"
        >
          <Plus className="h-5 w-5" /> Novo Conteúdo
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total de Conteúdos</p>
          <p className="mt-1 text-2xl font-bold">{conteudos.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Publicados</p>
          <p className="mt-1 text-2xl font-bold">{conteudos.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rascunhos</p>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="space-y-3">
        {conteudos.map((material) => (
          <div key={material.id} className="flex items-center justify-between rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]/10">♻️</div>
              <div>
                <h4 className="font-semibold">{material.nome}</h4>
                <p className="text-sm text-muted-foreground">{material.categoria}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openViewModal(material)} className="p-2 hover:bg-muted rounded-lg"><Eye className="h-4 w-4" /></button>
              <button onClick={() => openEditModal(material)} className="p-2 hover:bg-muted rounded-lg"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(material.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Visualizar Conteúdo" size="lg">
        {selectedContent && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedContent.nome}</h3>
              <p className="text-sm text-muted-foreground">{selectedContent.categoria}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-sm">{selectedContent.descricao}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Como Descartar</h4>
              <ul className="list-disc list-inside space-y-1">
                {selectedContent.como_descartar?.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm">{item}</li>
                ))}
              </ul>
            </div>
             {selectedContent.cuidados.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Cuidados</h4>
                  <ul className="list-disc list-inside space-y-1">
                      {selectedContent.cuidados.map((item: string, idx: number) => (
                      < li key={idx} className="text-sm">{item}</li>
                      ))}
                  </ul>
                </div>
                  )} 
                              <div className="flex justify-end pt-4">
              <button onClick={() => setShowViewModal(false)} className="rounded-lg border px-4 py-2 hover:bg-muted">Fechar</button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Content Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Novo Conteúdo" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Título *</label>
            <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="mt-2 h-10 w-full rounded-lg border px-4 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="mt-2 h-10 w-full rounded-lg border px-4 text-sm">
              <option>Eletrônicos</option><option>Químicos</option><option>Orgânicos</option><option>Recicláveis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Descrição *</label>
            <textarea rows={3} value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="mt-2 w-full rounded-lg border px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Como Descartar * (um por linha)</label>
            <textarea rows={4} value={formData.comoDescartar} onChange={(e) => setFormData({ ...formData, comoDescartar: e.target.value })} className="mt-2 w-full rounded-lg border px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Cuidados Importantes:</label>
            <textarea rows={4} value={formData.cuidados} onChange={(e) => setFormData({ ...formData, cuidados: e.target.value })} className="mt-2 w-full rounded-lg border px-4 py-2 text-sm" />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowNewModal(false)} className="flex-1 rounded-lg border py-2">Cancelar</button>
            <button onClick={handlePublish} className="flex-1 rounded-lg bg-[#4caf50] py-2 font-semibold text-white">Publicar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
