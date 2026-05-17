# Guia de Integração com Supabase

Este documento explica como migrar o protótipo EcoSmart do mock de dados para uma implementação real com Supabase.

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Projeto Supabase criado
- Acesso às credenciais do projeto (URL e anon key)

## 🗄️ Estrutura do Banco de Dados

### 1. Criar Tabelas no Supabase

Execute os seguintes comandos SQL no SQL Editor do Supabase:

```sql
-- Tabela de Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  perfil TEXT CHECK (perfil IN ('UC', 'UP', 'UE', 'UA')) DEFAULT 'UC',
  status TEXT CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Descartes
CREATE TABLE descartes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_residuo TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  data_descarte DATE NOT NULL,
  local TEXT NOT NULL,
  observacao TEXT,
  foto_url TEXT,
  status TEXT CHECK (status IN ('registrado', 'coletado', 'processado')) DEFAULT 'registrado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Entidades
CREATE TABLE entidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_entidade TEXT NOT NULL,
  tipo_entidade TEXT CHECK (tipo_entidade IN ('cooperativa', 'empresa', 'prefeitura', 'universidade')),
  responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuário-Entidade (relacionamento)
CREATE TABLE usuario_entidade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  entidade_id UUID REFERENCES entidades(id) ON DELETE CASCADE,
  vinculo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  tipo TEXT CHECK (tipo IN ('sistema', 'coleta', 'campanha', 'educativo')) DEFAULT 'sistema',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pedidos de Coleta
CREATE TABLE pedidos_coleta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('solicitada', 'agendada', 'coletando', 'finalizada', 'cancelada')) DEFAULT 'solicitada',
  endereco TEXT NOT NULL,
  observacao TEXT,
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  materiais TEXT[] NOT NULL,
  quantidade_estimada TEXT,
  foto_url TEXT,
  coletor_id UUID
);

-- Tabela de Pontos de Coleta
CREATE TABLE pontos_coleta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  endereco TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  materiais_aceitos TEXT[] NOT NULL,
  horario TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Materiais Educativos
CREATE TABLE materiais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  icone TEXT,
  descricao TEXT,
  como_descartar TEXT[],
  cuidados TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Impactos
CREATE TABLE impactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
  pontos INTEGER DEFAULT 0,
  reciclado_kg NUMERIC DEFAULT 0,
  emissao_evitada NUMERIC DEFAULT 0,
  economia_gerada NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Logs Administrativos
CREATE TABLE logs_admin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES usuarios(id),
  acao TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE descartes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_coleta ENABLE ROW LEVEL SECURITY;
ALTER TABLE impactos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver e editar seus próprios dados
CREATE POLICY "Users can view own data" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Política: Usuários podem ver e criar seus próprios descartes
CREATE POLICY "Users can view own descartes" ON descartes
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create own descartes" ON descartes
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política: Usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notificacoes
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política: Admins têm acesso total
CREATE POLICY "Admins have full access" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND perfil = 'UA'
    )
  );

-- Política: Pontos de coleta são públicos
CREATE POLICY "Collection points are public" ON pontos_coleta
  FOR SELECT USING (true);

-- Política: Materiais educativos são públicos
CREATE POLICY "Educational materials are public" ON materiais
  FOR SELECT USING (true);
```

### 3. Criar Índices para Performance

```sql
CREATE INDEX idx_descartes_usuario ON descartes(usuario_id);
CREATE INDEX idx_descartes_data ON descartes(data_descarte);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_pedidos_usuario ON pedidos_coleta(usuario_id);
CREATE INDEX idx_pedidos_status ON pedidos_coleta(status);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
```

## 🔌 Configuração no Código

### 1. Instalar Supabase Client

```bash
pnpm add @supabase/supabase-js
```

### 2. Criar Cliente Supabase

Crie o arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Atualizar AuthContext

Substitua o mock no `AuthContext.tsx`:

```typescript
import { supabase } from '../lib/supabase';

// Login
const login = async (email: string, senha: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) return false;

  // Buscar dados completos do usuário
  const { data: userData } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  setUser(userData);
  return true;
};

// Signup
const signup = async (userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.senha
  });

  if (error) throw error;

  // Criar registro na tabela usuarios
  const { data: newUser } = await supabase
    .from('usuarios')
    .insert([{ ...userData, id: data.user!.id }])
    .select()
    .single();

  setUser(newUser);
  return true;
};
```

### 4. Criar Hooks de Dados

Exemplo `src/hooks/useDescartes.ts`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useDescartes() {
  const { user } = useAuth();
  const [descartes, setDescartes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDescartes = async () => {
      const { data, error } = await supabase
        .from('descartes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_descarte', { ascending: false });

      if (!error) setDescartes(data);
      setLoading(false);
    };

    fetchDescartes();

    // Realtime subscription
    const subscription = supabase
      .channel('descartes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'descartes',
          filter: `usuario_id=eq.${user.id}`
        },
        () => fetchDescartes()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { descartes, loading };
}
```

## 🔐 Variáveis de Ambiente

Crie `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 📤 Upload de Imagens

Configure storage no Supabase e use:

```typescript
const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `descartes/${fileName}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

## 🤖 Automação com Make

Configure workflows no Make:

1. **Notificação de Nova Coleta**
   - Trigger: Novo registro em `pedidos_coleta`
   - Action: Enviar e-mail/push notification

2. **Atualização de Impacto**
   - Trigger: Novo descarte
   - Action: Atualizar tabela `impactos`

3. **Lembretes Periódicos**
   - Trigger: Schedule (semanal)
   - Action: Criar notificações para usuários inativos

## ✅ Checklist de Migração

- [ ] Criar projeto no Supabase
- [ ] Executar SQL de criação de tabelas
- [ ] Configurar RLS policies
- [ ] Criar índices
- [ ] Configurar Storage para imagens
- [ ] Adicionar variáveis de ambiente
- [ ] Instalar @supabase/supabase-js
- [ ] Atualizar AuthContext
- [ ] Criar hooks de dados
- [ ] Substituir imports de mockData
- [ ] Testar autenticação
- [ ] Testar CRUD de descartes
- [ ] Configurar workflows no Make
- [ ] Validar segurança (RLS)
- [ ] Deploy em produção

## 🚀 Benefícios da Migração

✅ Persistência real de dados
✅ Autenticação segura
✅ Realtime updates
✅ Escalabilidade
✅ Backup automático
✅ APIs REST e GraphQL prontas
✅ Storage para arquivos
✅ Row Level Security

---

Com esta integração, o EcoSmart estará pronto para produção com backend robusto e escalável! 🌿
