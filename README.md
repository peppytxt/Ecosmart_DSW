# EcoSmart - Plataforma de Gestão Sustentável de Resíduos Sólidos

Sistema web completo para registro, acompanhamento e gestão de descartes de resíduos sólidos, com foco em sustentabilidade e educação ambiental.

## 🌿 Visão Geral

EcoSmart é uma plataforma digital colaborativa que conecta cidadãos, empresas, cooperativas e administradores em torno da gestão responsável de resíduos. O sistema oferece:

- ✅ Registro digital de descartes
- 📊 Indicadores de impacto ambiental
- 📚 Conteúdo educativo sobre reciclagem
- 🗺️ Mapeamento de pontos de coleta
- 🚛 Solicitação de coletas
- 👥 Gestão colaborativa institucional
- 🎯 Gamificação e recompensas

## 👥 Perfis de Usuário

### UC - Usuário Comum
- Registra descartes pessoais
- Consulta histórico
- Visualiza impacto ambiental básico
- Acessa conteúdo educativo

### UP - Usuário Premium
- Todas funcionalidades do UC
- Histórico detalhado
- Relatórios avançados
- Recompensas e benefícios expandidos

### UE - Usuário Empresarial
- Painel institucional
- Dados consolidados da organização
- Gestão de usuários vinculados
- Relatórios corporativos

### UA - Usuário Administrador
- Painel administrativo completo
- Gestão de usuários e permissões
- Gestão de conteúdos educativos
- Monitoramento do sistema

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **React Router 7** para navegação
- **Tailwind CSS v4** para estilização
- **Recharts** para visualização de dados
- **Radix UI** para componentes acessíveis

### Backend (Fase Futura)
- **Supabase** como backend/database
- **PostgreSQL** via Supabase
- **Edge Functions** para lógica de negócio
- **Row Level Security (RLS)**

### Automação
- **Make** para notificações e integrações
- Alertas automáticos
- Sincronização de dados

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes compartilhados
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Table.tsx
│   │   └── TopBar.tsx
│   ├── layouts/            # Layouts da aplicação
│   │   ├── DashboardLayout.tsx
│   │   └── RootLayout.tsx
│   ├── pages/              # Páginas principais
│   │   ├── dashboard/      # Dashboards por perfil
│   │   ├── admin/          # Páginas administrativas
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── routes.tsx          # Configuração de rotas
│   └── App.tsx             # Componente raiz
├── contexts/               # Contextos React
│   └── AuthContext.tsx
├── lib/                    # Utilitários e mock data
│   └── mockData.ts
└── styles/
    ├── theme.css           # Variáveis CSS
    └── fonts.css
```

## 🎨 Design System

### Cores Principais
- **Verde Escuro (Primary)**: `#1a4d2e` - Identidade principal
- **Verde Médio (Secondary)**: `#4caf50` - Destaques e ações
- **Verde Claro (Accent)**: `#81c784` - Elementos secundários
- **Branco/Cinza**: Áreas de conteúdo

### Princípios de Design
- Interface limpa e sustentável
- Formas orgânicas e arredondadas
- Alta legibilidade e contraste
- Acessibilidade (WCAG 2.1)
- Responsivo desktop-first (1440px base)

## 📱 Páginas Implementadas

### Públicas
- ✅ Landing Page institucional
- ✅ Login
- ✅ Cadastro

### Usuário
- ✅ Dashboard (UC, UP, UE, UA)
- ✅ Registrar Descarte
- ✅ Histórico de Descartes
- ✅ Impacto Ambiental
- ✅ Central Educativa
- ✅ Conteúdo Educativo (Detalhes)
- ✅ Pontos de Coleta (com mapa)
- ✅ Pedidos de Coleta
- ✅ Novo Pedido de Coleta (wizard)
- ✅ Notificações
- ✅ Perfil e Configurações

### Administrativas
- ✅ Gestão de Usuários
- ✅ Gestão de Permissões
- ✅ Gestão de Conteúdos
- ✅ Arquitetura do Sistema

## 🔐 Credenciais de Teste

### Administrador
- Email: `admin@ecosmart.com`
- Senha: `admin123`

### Usuário Comum
- Email: `maria@email.com`
- Senha: `maria123`

### Usuário Premium
- Email: `ana@email.com`
- Senha: `ana123`
- Email: `joao@email.com`
- Senha: `joao123`

### Usuário Empresarial
- Email: `carlos@empresa.com`
- Senha: `carlos123`

## 🚀 Funcionalidades

### MVP (Integrado ao Backend Django)
- ✅ Sistema de autenticação
- ✅ Controle de acesso por perfil
- ✅ Registro de descartes
- ✅ Coleta de descartes de UC por usuários Premium
- ✅ Pedido de coleta gerando oportunidade real para UP
- ✅ Status sincronizado entre pedido, histórico do UC e coletas do UP
- ✅ Workspace empresarial com vínculos reais de usuários
- ✅ Rastreamento de coletor e instituição vinculada
- ✅ Histórico com filtros
- ✅ Métricas de impacto
- ✅ Conteúdo educativo
- ✅ Mapa de pontos de coleta
- ✅ Sistema de notificações
- ✅ Painel administrativo

### Próximos Passos
- 🔄 Substituir mocks restantes de impacto, notificações e pontos de coleta
- 🔄 Upload de imagens
- 🔄 Exportação de relatórios
- 🔄 Endurecimento de segurança para produção

## ⚙️ Configuração Local

1. Copie `.env.example` para `.env` e ajuste as variáveis do banco.
2. Para desenvolvimento local sem Docker/Postgres, mantenha:
   - `DATABASE_ENGINE=sqlite`
   - `SQLITE_DB_PATH=db.sqlite3`
3. Para usar o PostgreSQL local do `docker-compose.yml`, altere para `DATABASE_ENGINE=postgres` e mantenha:
   - `POSTGRES_DB=ecosmart_db`
   - `POSTGRES_USER=admin`
   - `POSTGRES_PASSWORD=1234`
   - `POSTGRES_HOST=localhost`
4. Rode `python manage.py migrate` e depois `python manage.py seed_db` para criar as credenciais de teste.
5. Inicie o backend com `python manage.py runserver`.
6. Inicie o frontend com `npm run dev`.

Para uma pessoa rodar o projeto no Linux, use o passo a passo completo:

- [`docs/execucao-linux.md`](docs/execucao-linux.md)

O frontend usa `VITE_API_URL` para encontrar a API Django. Login e cadastro recebem um token assinado pelo Django, salvo no navegador, e as chamadas internas enviam esse token no header `Authorization`.

## ✅ Qualidade e Testes do Backend

A estratégia de validação do backend, os 31 casos testados, o relatório de execução, a evidência de cobertura mínima funcional e o código dos testes implementados estão documentados em:

- [`docs/qualidade-backend.md`](docs/qualidade-backend.md)
- [`docs/controle-acesso.md`](docs/controle-acesso.md)

Comandos principais:

```bash
python manage.py check
python manage.py test ecosmart.tests.BackendQualityTests -v 2
```

## 🔄 Fluxo de Coleta

1. Um usuário comum (`UC`) registra um descarte.
2. O descarte aparece no dashboard de usuários Premium (`UP`) em **Descartes Disponíveis para Coleta**.
3. Ao clicar em **Coletar**, o sistema registra o UP como coletor.
4. O UP acompanha em **Minhas Coletas** e avança o status para **Em trânsito** e depois **Finalizado**.
5. Se o UP estiver vinculado a uma instituição, a coleta é vinculada automaticamente a essa instituição.
6. O perfil empresarial (`UE`) vinculado à mesma instituição vê a coleta no painel consolidado, incluindo quem gerou o descarte e quem coletou.
7. Se o UP não tiver vínculo institucional, a coleta finalizada aparece para o UC solicitante e para o UP coletor, sem entrar no painel empresarial.

As telas de histórico, dashboard Premium, dashboard Empresarial e pedidos de coleta consultam a API automaticamente em intervalos curtos para refletir movimentações recentes sem recarregar a página.

## 🚛 Solicitação de Coleta

1. O usuário comum (`UC`) cria uma solicitação em **Pedidos de Coleta > Novo Pedido**.
2. O pedido é salvo no backend real em `/api/pedidos-coleta/` e gera automaticamente um descarte com status **Registrado**.
3. O descarte aparece para usuários Premium (`UP`) em **Descartes Disponíveis para Coleta**.
4. Quando o UP coleta, o pedido do UC muda para **Agendada**.
5. Quando o UP marca como entregue, o pedido do UC muda para **Finalizada**.

### Futuro (Roadmap)
- 📍 Geolocalização em tempo real
- 🤖 IA para reconhecimento de materiais
- 📱 App mobile nativo
- 🏆 Gamificação expandida
- 💳 Sistema de recompensas
- 🔗 Integração com órgãos públicos
- 📊 Analytics avançado

## 🗄️ Estrutura de Dados Atual

### Tabelas Principais
- **usuarios**: id, nome, email, perfil, status
- **descartes**: id, usuario_id, tipo_residuo, quantidade, data
- **instituicoes**: id, nome, tipo, cnpj, contato
- **usuarios_instituicoes**: usuario_id, instituicao_id, vinculo_ativo
- **notificacoes**: id, usuario_id, titulo, mensagem, lida
- **pedidos_coleta**: id, usuario_id, status, materiais
- **pontos_coleta**: id, nome, tipo, endereco, latitude, longitude
- **materiais**: id, nome, categoria, como_descartar
- **impactos**: usuario_id, pontos, reciclado_kg, emissao_evitada

## 🔌 Integração Supabase

Para conectar ao Supabase real:

1. Acesse as configurações do Make
2. Conecte seu projeto Supabase
3. Configure as variáveis de ambiente
4. Ajuste as chamadas do frontend que ainda usam dados mockados para consumir a API escolhida

## 🎯 Diferenciais

- **Educação Ambiental**: Conteúdo rico sobre descarte correto
- **Impacto Mensurável**: Métricas claras de impacto positivo
- **Colaborativo**: Conecta múltiplos atores do ecossistema
- **Acessível**: Interface simples e intuitiva
- **Escalável**: Arquitetura preparada para crescimento
- **Sustentável**: Design e valores alinhados com o propósito

## 📊 Dados Mock

O sistema inclui:
- 5 usuários (1 admin, 2 comuns, 1 premium, 1 empresarial)
- 10 registros de descarte
- 4 pedidos de coleta
- 6 notificações
- 8 pontos de coleta
- 8 materiais educativos

## 🌍 Impacto Socioambiental

O EcoSmart contribui para:
- Redução de emissões de CO₂
- Economia de recursos naturais
- Geração de renda para cooperativas
- Educação ambiental contínua
- Dados para políticas públicas

## 📄 Licença

Sistema desenvolvido como protótipo de alta fidelidade para gestão sustentável de resíduos sólidos.

---

**EcoSmart** - Transformando o futuro através da gestão inteligente de resíduos 🌿♻️
