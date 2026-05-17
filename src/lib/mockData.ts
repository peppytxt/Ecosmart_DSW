// Mock Data for EcoSmart System

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: string;
  perfil: 'UC' | 'UP' | 'UE' | 'UA';
  status: 'ativo' | 'inativo';
  avatar?: string;
  created_at: string;
}

export interface Descarte {
  id: string;
  usuario_id: string;
  tipo_residuo: string;
  quantidade: number;
  unidade: string;
  data_descarte: string;
  local: string;
  observacao: string;
  nome_coletor?: string;
  foto_url?: string;
  status: 'registrado' | 'em_transito' | 'coletado' | 'processado';
  created_at: string;
}

export interface Entidade {
  id: string;
  nome_entidade: string;
  tipo_entidade: 'cooperativa' | 'empresa' | 'prefeitura' | 'universidade';
  responsavel: string;
  created_at: string;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: 'sistema' | 'coleta' | 'campanha' | 'educativo';
  created_at: string;
}

export interface PedidoColeta {
  id: string;
  usuario_id: string;
  status: 'solicitada' | 'agendada' | 'coletando' | 'finalizada' | 'cancelada';
  endereco: string;
  observacao: string;
  data_solicitacao: string;
  materiais: string[];
  quantidade_estimada: string;
  foto_url?: string;
  coletor_id?: string;
}

export interface PontoColeta {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  materiais_aceitos: string[];
  horario: string;
  telefone?: string;
}

export interface Material {
  id: string;
  nome: string;
  categoria: string;
  icone: string;
  descricao: string;
  como_descartar: string[];
  cuidados: string[];
}

export interface Impacto {
  usuario_id: string;
  pontos: number;
  reciclado_kg: number;
  emissao_evitada: number;
  economia_gerada: number;
}

export interface LogAdmin {
  id: string;
  admin_id: string;
  acao: string;
  descricao: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  entidade_id: string;
  nome_workspace: string;
  descricao: string;
  created_at: string;
}

export interface WorkspaceMembro {
  id: string;
  workspace_id: string;
  usuario_id: string;
  perfil_usuario: 'UC' | 'UP';
  setor?: string;
  unidade?: string;
  status_vinculo: 'ativo' | 'pendente' | 'inativo';
  data_vinculo: string;
}

export interface ConviteWorkspace {
  id: string;
  workspace_id: string;
  email_convidado: string;
  perfil_sugerido: 'UC' | 'UP';
  status_convite: 'pendente' | 'aceito' | 'rejeitado';
  created_at: string;
}

// Mock Users
export const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'Admin Sistema',
    email: 'admin@ecosmart.com',
    senha: 'admin123',
    telefone: '(11) 98765-4321',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    perfil: 'UA',
    status: 'ativo',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    senha: 'maria123',
    telefone: '(11) 98765-1234',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    perfil: 'UC',
    status: 'ativo',
    created_at: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    email: 'pedro@email.com',
    senha: 'pedro123',
    telefone: '(11) 98765-1294',
    endereco: 'Rua das Flores, 1234 - São Paulo, SP',
    perfil: 'UC',
    status: 'ativo',
    created_at: '2024-02-10T14:30:00Z'
  },
  {
    id: '4',
    nome: 'João Santos',
    email: 'joao@email.com',
    senha: 'joao123',
    telefone: '(11) 98765-5678',
    endereco: 'Av. Brasil, 456 - São Paulo, SP',
    perfil: 'UP',
    status: 'ativo',
    created_at: '2024-02-15T09:15:00Z'
  },
  {
    id: '5',
    nome: 'Ana Premium',
    email: 'ana@email.com',
    senha: 'ana123',
    telefone: '(11) 98765-9876',
    endereco: 'Rua Premium, 789 - São Paulo, SP',
    perfil: 'UP',
    status: 'ativo',
    created_at: '2024-01-20T16:45:00Z'
  },
  {
    id: '6',
    nome: 'Carlos Empresa',
    email: 'carlos@empresa.com',
    senha: 'carlos123',
    telefone: '(11) 98765-4567',
    endereco: 'Av. Empresarial, 999 - São Paulo, SP',
    perfil: 'UE',
    status: 'ativo',
    created_at: '2024-01-25T11:20:00Z'
  }
];

// Mock Descartes
export const mockDescartes: Descarte[] = [
  {
    id: '1',
    usuario_id: '2',
    tipo_residuo: 'Papel',
    quantidade: 5,
    unidade: 'kg',
    data_descarte: '2024-03-15',
    local: 'Residência',
    observacao: 'Papelão e jornais',
    status: 'em_transito',
    created_at: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    usuario_id: '2',
    tipo_residuo: 'Plástico',
    quantidade: 3,
    unidade: 'kg',
    data_descarte: '2024-03-18',
    local: 'Residência',
    observacao: 'Garrafas PET',
    nome_coletor: 'Ana Paula (Recicla Tudo)',
    status: 'coletado',
    created_at: '2024-03-18T14:30:00Z'
  },
  {
    id: '3',
    usuario_id: '3',
    tipo_residuo: 'Vidro',
    quantidade: 2,
    unidade: 'kg',
    data_descarte: '2024-03-20',
    local: 'Residência',
    observacao: 'Garrafas de vidro',
    status: 'processado',
    created_at: '2024-03-20T09:15:00Z'
  },
  {
    id: '4',
    usuario_id: '4',
    tipo_residuo: 'Metal',
    quantidade: 1.5,
    unidade: 'kg',
    data_descarte: '2024-03-22',
    local: 'Residência',
    observacao: 'Latas de alumínio',
    nome_coletor: 'Carlos Silva (Metal Recicla)',
    status: 'coletado',
    created_at: '2024-03-22T16:45:00Z'
  },
  {
    id: '5',
    usuario_id: '2',
    tipo_residuo: 'Eletrônicos',
    quantidade: 2,
    unidade: 'unidades',
    data_descarte: '2024-03-25',
    local: 'Ponto de Coleta Central',
    observacao: 'Celulares antigos',
    status: 'registrado',
    created_at: '2024-03-25T11:00:00Z'
  },
  {
    id: '6',
    usuario_id: '3',
    tipo_residuo: 'Óleo de Cozinha',
    quantidade: 1,
    unidade: 'litros',
    data_descarte: '2024-03-26',
    local: 'Ponto de Coleta Bairro',
    observacao: 'Óleo usado',
    nome_coletor: 'Fernanda Costa (Óleo Verde)',
    status: 'coletado',
    created_at: '2024-03-26T15:20:00Z'
  },
  {
    id: '7',
    usuario_id: '4',
    tipo_residuo: 'Lâmpadas',
    quantidade: 5,
    unidade: 'unidades',
    data_descarte: '2024-03-27',
    local: 'Residência',
    observacao: 'Lâmpadas fluorescentes',
    status: 'registrado',
    created_at: '2024-03-27T10:30:00Z'
  },
  {
    id: '8',
    usuario_id: '5',
    tipo_residuo: 'Papel',
    quantidade: 25,
    unidade: 'kg',
    data_descarte: '2024-03-28',
    local: 'Empresa',
    observacao: 'Documentos para descarte',
    nome_coletor: 'Juliete (Recicla Express)',
    status: 'coletado',
    created_at: '2024-03-28T09:00:00Z'
  },
  {
    id: '9',
    usuario_id: '5',
    tipo_residuo: 'Plástico',
    quantidade: 15,
    unidade: 'kg',
    data_descarte: '2024-03-29',
    local: 'Empresa',
    observacao: 'Embalagens',
    status: 'processado',
    created_at: '2024-03-29T14:15:00Z'
  },
  {
    id: '10',
    usuario_id: '2',
    tipo_residuo: 'Papel',
    quantidade: 3,
    unidade: 'kg',
    data_descarte: '2024-03-30',
    local: 'Residência',
    observacao: 'Revistas e folhetos',
    status: 'registrado',
    created_at: '2024-03-30T16:00:00Z'
  }
];

// Mock Entidades
export const mockEntidades: Entidade[] = [
  {
    id: '1',
    nome_entidade: 'Cooperativa Verde SP',
    tipo_entidade: 'cooperativa',
    responsavel: 'Pedro Oliveira',
    created_at: '2024-01-10T10:00:00Z'
  }
];

// Mock Notificações
export const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    usuario_id: '2',
    titulo: 'Coleta Agendada',
    mensagem: 'Sua coleta de eletrônicos está agendada para amanhã às 14h.',
    lida: false,
    tipo: 'coleta',
    created_at: '2024-03-30T10:00:00Z'
  },
  {
    id: '2',
    usuario_id: '2',
    titulo: 'Nova Campanha',
    mensagem: 'Participe da campanha "Abril Verde" e ganhe pontos extras!',
    lida: false,
    tipo: 'campanha',
    created_at: '2024-03-29T15:30:00Z'
  },
  {
    id: '3',
    usuario_id: '2',
    titulo: 'Conteúdo Educativo',
    mensagem: 'Aprenda como descartar corretamente pilhas e baterias.',
    lida: true,
    tipo: 'educativo',
    created_at: '2024-03-28T09:00:00Z'
  },
  {
    id: '4',
    usuario_id: '3',
    titulo: 'Coleta Finalizada',
    mensagem: 'Sua coleta de vidro foi finalizada com sucesso!',
    lida: true,
    tipo: 'coleta',
    created_at: '2024-03-27T16:45:00Z'
  },
  {
    id: '5',
    usuario_id: '4',
    titulo: 'Novo Ponto de Coleta',
    mensagem: 'Um novo ponto de coleta foi cadastrado próximo à sua região.',
    lida: false,
    tipo: 'sistema',
    created_at: '2024-03-26T11:20:00Z'
  },
  {
    id: '6',
    usuario_id: '4',
    titulo: 'Parabéns!',
    mensagem: 'Você atingiu 100 pontos no EcoSmart!',
    lida: true,
    tipo: 'sistema',
    created_at: '2024-03-25T14:00:00Z'
  }
];

// Mock Pedidos de Coleta
export const mockPedidosColeta: PedidoColeta[] = [
  {
    id: '1',
    usuario_id: '2',
    status: 'agendada',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    observacao: 'Eletrônicos para coleta',
    data_solicitacao: '2024-03-29T10:00:00Z',
    materiais: ['Eletrônicos'],
    quantidade_estimada: '5 unidades',
    coletor_id: '1'
  },
  {
    id: '2',
    usuario_id: '3',
    status: 'finalizada',
    endereco: 'Av. Brasil, 456 - São Paulo, SP',
    observacao: 'Móveis velhos',
    data_solicitacao: '2024-03-20T14:30:00Z',
    materiais: ['Móveis'],
    quantidade_estimada: '3 peças'
  },
  {
    id: '3',
    usuario_id: '4',
    status: 'solicitada',
    endereco: 'Rua Premium, 789 - São Paulo, SP',
    observacao: 'Grande quantidade de papelão',
    data_solicitacao: '2024-03-30T09:15:00Z',
    materiais: ['Papel', 'Papelão'],
    quantidade_estimada: '50 kg'
  },
  {
    id: '4',
    usuario_id: '5',
    status: 'cancelada',
    endereco: 'Av. Empresarial, 999 - São Paulo, SP',
    observacao: 'Cancelado por mudança de data',
    data_solicitacao: '2024-03-15T11:00:00Z',
    materiais: ['Plástico'],
    quantidade_estimada: '20 kg'
  }
];

// Mock Pontos de Coleta
export const mockPontosColeta: PontoColeta[] = [
  {
    id: '1',
    nome: 'Ponto de Coleta Central',
    tipo: 'Ecoponto Completo',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    latitude: -23.561684,
    longitude: -46.655981,
    materiais_aceitos: ['Papel', 'Plástico', 'Vidro', 'Metal', 'Eletrônicos', 'Pilhas'],
    horario: 'Seg-Sex: 8h-18h, Sáb: 8h-12h',
    telefone: '(11) 3456-7890'
  },
  {
    id: '2',
    nome: 'Ecoponto Bairro Jardins',
    tipo: 'Ecoponto',
    endereco: 'Rua Augusta, 500 - São Paulo, SP',
    latitude: -23.565277,
    longitude: -46.652999,
    materiais_aceitos: ['Papel', 'Plástico', 'Vidro', 'Metal'],
    horario: 'Seg-Sáb: 7h-19h'
  },
  {
    id: '3',
    nome: 'Coleta Eletrônicos Tech',
    tipo: 'Especializado Eletrônicos',
    endereco: 'Av. Faria Lima, 2000 - São Paulo, SP',
    latitude: -23.574729,
    longitude: -46.688537,
    materiais_aceitos: ['Eletrônicos', 'Pilhas', 'Baterias'],
    horario: 'Seg-Sex: 9h-17h',
    telefone: '(11) 3456-1234'
  },
  {
    id: '4',
    nome: 'Ponto Óleo Verde',
    tipo: 'Especializado Óleo',
    endereco: 'Rua da Consolação, 300 - São Paulo, SP',
    latitude: -23.554187,
    longitude: -46.662221,
    materiais_aceitos: ['Óleo de Cozinha'],
    horario: 'Seg-Sex: 8h-17h'
  },
  {
    id: '5',
    nome: 'Ecoponto Vila Madalena',
    tipo: 'Ecoponto',
    endereco: 'Rua Harmonia, 100 - São Paulo, SP',
    latitude: -23.546278,
    longitude: -46.691644,
    materiais_aceitos: ['Papel', 'Plástico', 'Vidro', 'Metal'],
    horario: 'Seg-Dom: 7h-20h'
  },
  {
    id: '6',
    nome: 'Coleta Lâmpadas EcoLuz',
    tipo: 'Especializado Lâmpadas',
    endereco: 'Av. Rebouças, 1500 - São Paulo, SP',
    latitude: -23.561893,
    longitude: -46.670086,
    materiais_aceitos: ['Lâmpadas'],
    horario: 'Seg-Sex: 9h-18h',
    telefone: '(11) 3456-5678'
  },
  {
    id: '7',
    nome: 'Ecoponto Pinheiros',
    tipo: 'Ecoponto',
    endereco: 'Rua dos Pinheiros, 800 - São Paulo, SP',
    latitude: -23.561464,
    longitude: -46.689693,
    materiais_aceitos: ['Papel', 'Plástico', 'Vidro', 'Metal'],
    horario: 'Seg-Sáb: 8h-18h'
  },
  {
    id: '8',
    nome: 'Centro de Reciclagem Móveis',
    tipo: 'Especializado Móveis',
    endereco: 'Av. do Estado, 3000 - São Paulo, SP',
    latitude: -23.594915,
    longitude: -46.623519,
    materiais_aceitos: ['Móveis', 'Madeira'],
    horario: 'Seg-Sex: 8h-16h',
    telefone: '(11) 3456-9012'
  }
];

// Mock Materiais Educativos
export const mockMateriais: Material[] = [
  {
    id: '1',
    nome: 'Lâmpadas Fluorescentes',
    categoria: 'Eletrônicos',
    icone: 'Lightbulb',
    descricao: 'Lâmpadas fluorescentes contêm mercúrio e devem ser descartadas em locais especializados.',
    como_descartar: [
      'Procure pontos de coleta especializados em lâmpadas',
      'Não descarte no lixo comum',
      'Embale com cuidado para evitar quebra',
      'Alguns supermercados e lojas de materiais elétricos aceitam lâmpadas'
    ],
    cuidados: [
      'Não quebre as lâmpadas',
      'Mantenha em local seguro até o descarte',
      'Se quebrar, ventile o ambiente e recolha com cuidado'
    ]
  },
  {
    id: '2',
    nome: 'Esmaltes',
    categoria: 'Químicos',
    icone: 'Droplet',
    descricao: 'Esmaltes contêm substâncias químicas que podem contaminar o meio ambiente.',
    como_descartar: [
      'Leve para pontos de coleta de resíduos químicos',
      'Não descarte na pia ou lixo comum',
      'Mantenha a embalagem original',
      'Procure farmácias ou drogarias que aceitem descarte de cosméticos'
    ],
    cuidados: [
      'Mantenha bem fechado',
      'Não misture com outros produtos',
      'Verifique a validade antes de descartar'
    ]
  },
  {
    id: '3',
    nome: 'Eletrônicos',
    categoria: 'Eletrônicos',
    icone: 'Smartphone',
    descricao: 'Aparelhos eletrônicos contêm metais pesados e componentes recicláveis valiosos.',
    como_descartar: [
      'Leve para pontos de coleta de eletrônicos',
      'Apague todos os dados pessoais antes de descartar',
      'Remova baterias e descarte separadamente',
      'Verifique se o fabricante tem programa de logística reversa'
    ],
    cuidados: [
      'Faça backup dos dados',
      'Remova cartões de memória e SIM',
      'Mantenha em local seco até o descarte'
    ]
  },
  {
    id: '4',
    nome: 'Óleo de Cozinha',
    categoria: 'Orgânicos',
    icone: 'Droplets',
    descricao: 'Óleo de cozinha usado pode ser transformado em biodiesel e sabão.',
    como_descartar: [
      'Armazene em garrafa PET limpa e seca',
      'Leve para pontos de coleta de óleo usado',
      'Não descarte na pia (entope canos e polui rios)',
      'Algumas cooperativas coletam em domicílio'
    ],
    cuidados: [
      'Deixe esfriar completamente antes de armazenar',
      'Use funil para facilitar o armazenamento',
      'Feche bem a garrafa'
    ]
  },
  {
    id: '5',
    nome: 'Papel',
    categoria: 'Recicláveis',
    icone: 'FileText',
    descricao: 'Papéis podem ser reciclados diversas vezes, economizando árvores e água.',
    como_descartar: [
      'Separe papéis limpos e secos',
      'Remova grampos, clipes e plásticos',
      'Papéis sujos de comida ou gordura não são recicláveis',
      'Coloque na coleta seletiva ou leve para cooperativas'
    ],
    cuidados: [
      'Mantenha secos',
      'Evite amassar demais',
      'Separe por tipo se possível (papelão, papel branco, etc.)'
    ]
  },
  {
    id: '6',
    nome: 'Plástico',
    categoria: 'Recicláveis',
    icone: 'Recycle',
    descricao: 'Plásticos podem levar centenas de anos para se degradar na natureza.',
    como_descartar: [
      'Lave e seque as embalagens',
      'Remova rótulos quando possível',
      'Amasse garrafas PET para economizar espaço',
      'Coloque na coleta seletiva'
    ],
    cuidados: [
      'Verifique o número de reciclagem na embalagem',
      'Sacolas plásticas podem ser levadas para supermercados',
      'Evite plásticos de uso único'
    ]
  },
  {
    id: '7',
    nome: 'Vidro',
    categoria: 'Recicláveis',
    icone: 'Wine',
    descricao: 'Vidro é 100% reciclável e pode ser reciclado infinitas vezes.',
    como_descartar: [
      'Lave e seque as embalagens',
      'Remova tampas e rótulos',
      'Embale vidros quebrados com cuidado',
      'Coloque na coleta seletiva'
    ],
    cuidados: [
      'Cuidado com vidros quebrados',
      'Separe por cor se possível',
      'Não misture com cerâmica ou cristal'
    ]
  },
  {
    id: '8',
    nome: 'Metal',
    categoria: 'Recicláveis',
    icone: 'Container',
    descricao: 'Latas de alumínio podem ser recicladas infinitas vezes, economizando energia.',
    como_descartar: [
      'Lave e seque as latas',
      'Amasse para economizar espaço',
      'Separe tampinhas de garrafas',
      'Coloque na coleta seletiva'
    ],
    cuidados: [
      'Latas de tinta devem ser completamente vazias',
      'Aerossóis devem estar completamente vazios',
      'Separe metais ferrosos de não-ferrosos se possível'
    ]
  }
];

// Mock Impactos
export const mockImpactos: Record<string, Impacto> = {
  '2': {
    usuario_id: '2',
    pontos: 150,
    reciclado_kg: 13,
    emissao_evitada: 26,
    economia_gerada: 65
  },
  '3': {
    usuario_id: '3',
    pontos: 85,
    reciclado_kg: 3,
    emissao_evitada: 6,
    economia_gerada: 15
  },
  '4': {
    usuario_id: '4',
    pontos: 220,
    reciclado_kg: 9.5,
    emissao_evitada: 19,
    economia_gerada: 47.5
  },
  '5': {
    usuario_id: '5',
    pontos: 850,
    reciclado_kg: 40,
    emissao_evitada: 80,
    economia_gerada: 200
  }
};

// Mock Logs Admin
export const mockLogsAdmin: LogAdmin[] = [
  {
    id: '1',
    admin_id: '1',
    acao: 'Criação de usuário',
    descricao: 'Usuário Maria Silva criado',
    created_at: '2024-02-10T14:30:00Z'
  },
  {
    id: '2',
    admin_id: '1',
    acao: 'Edição de permissões',
    descricao: 'Permissões do perfil UP atualizadas',
    created_at: '2024-02-15T10:15:00Z'
  },
  {
    id: '3',
    admin_id: '1',
    acao: 'Cadastro de ponto de coleta',
    descricao: 'Ponto de Coleta Central cadastrado',
    created_at: '2024-02-20T11:45:00Z'
  },
  {
    id: '4',
    admin_id: '1',
    acao: 'Publicação de conteúdo',
    descricao: 'Conteúdo educativo sobre lâmpadas publicado',
    created_at: '2024-03-01T09:00:00Z'
  }
];

// Mock Workspaces
export const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    entidade_id: '1',
    nome_workspace: 'Workspace Empresa Sustentável S.A.',
    descricao: 'Workspace corporativo para gestão de resíduos da empresa',
    created_at: '2024-01-25T11:20:00Z'
  }
];

// Mock Workspace Membros
export const mockWorkspaceMembros: WorkspaceMembro[] = [
  {
    id: '1',
    workspace_id: '1',
    usuario_id: '2',
    perfil_usuario: 'UC',
    setor: 'Administrativo',
    unidade: 'Matriz',
    status_vinculo: 'ativo',
    data_vinculo: '2024-02-10T14:30:00Z'
  },
  {
    id: '2',
    workspace_id: '1',
    usuario_id: '3',
    perfil_usuario: 'UC',
    setor: 'Operacional',
    unidade: 'Filial Sul',
    status_vinculo: 'ativo',
    data_vinculo: '2024-02-15T09:15:00Z'
  },
  {
    id: '3',
    workspace_id: '1',
    usuario_id: '4',
    perfil_usuario: 'UP',
    setor: 'Qualidade',
    unidade: 'Matriz',
    status_vinculo: 'ativo',
    data_vinculo: '2024-01-20T16:45:00Z'
  }
];

// Mock Convites Workspace
export const mockConvitesWorkspace: ConviteWorkspace[] = [
  {
    id: '1',
    workspace_id: '1',
    email_convidado: 'rafael@email.com',
    perfil_sugerido: 'UC',
    status_convite: 'pendente',
    created_at: '2024-03-28T10:00:00Z'
  },
  {
    id: '2',
    workspace_id: '1',
    email_convidado: 'fernanda@email.com',
    perfil_sugerido: 'UP',
    status_convite: 'pendente',
    created_at: '2024-03-29T14:30:00Z'
  }
];