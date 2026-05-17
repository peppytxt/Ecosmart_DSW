import { Database, Server, Zap, GitBranch, Cloud, Code, Workflow } from 'lucide-react';

export function ArquiteturaSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a4d2e]">Arquitetura do Sistema</h1>
        <p className="mt-2 text-muted-foreground">
          Visão técnica da estrutura do EcoSmart
        </p>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-[#4caf50]/10 to-[#81c784]/10 p-8">
        <h2 className="text-2xl font-bold text-[#1a4d2e]">Visão Geral</h2>
        <p className="mt-2 text-muted-foreground">
          O EcoSmart é uma plataforma web construída com arquitetura moderna e escalável,
          utilizando tecnologias de ponta para garantir performance, segurança e facilidade de manutenção.
        </p>
      </div>


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <Code className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Front-end Web</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>• React 18 com TypeScript</p>
            <p>• React Router para navegação</p>
            <p>• Tailwind CSS v4 para estilização</p>
            <p>• Recharts para visualização de dados</p>
            <p>• Responsivo e acessível</p>
          </div>
        </div>

        {/* Backend */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <Server className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold">API / Backend</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>• Supabase como backend</p>
            <p>• PostgreSQL para banco de dados</p>
            <p>• Edge Functions para lógica de negócio</p>
            <p>• Row Level Security (RLS)</p>
            <p>• APIs RESTful</p>
          </div>
        </div>

        {/* Database */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Banco de Dados</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>• PostgreSQL via Supabase</p>
            <p>• Estrutura relacional normalizada</p>
            <p>• Tabelas: usuarios, descartes, entidades</p>
            <p>• notificacoes, pedidos_coleta, pontos_coleta</p>
            <p>• Índices otimizados para queries</p>
          </div>
        </div>

        {/* Automação */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Automação - Make</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>• Notificações automáticas</p>
            <p>• Confirmações de coleta</p>
            <p>• Alertas e lembretes</p>
            <p>• Integrações com serviços externos</p>
            <p>• Sincronização de dados</p>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#1a4d2e]">Fases de Desenvolvimento</h3>

        <div className="rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-900">Fase 1: MVP com Mock de Dados</h4>
              <p className="mt-2 text-sm text-yellow-800">
                <strong>Status:</strong> Atual<br />
                Desenvolvimento do protótipo funcional utilizando dados fictícios (mock) para testar
                e validar a interface, fluxos de navegação e experiência do usuário. Esta fase
                permite iterar rapidamente no design e funcionalidades sem dependência de backend.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Fase 2: Integração com Supabase</h4>
              <p className="mt-2 text-sm text-blue-800">
                <strong>Status:</strong> Próximo Passo<br />
                Conexão do frontend com Supabase real. Migração dos mocks para chamadas de API
                verdadeiras, configuração de autenticação, implementação de políticas de segurança
                (RLS) e deploy do banco de dados PostgreSQL com todas as tabelas necessárias.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-green-500 bg-green-50 p-6">
          <div className="flex items-start gap-3">
            <Cloud className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">Fase 3: Produção e Expansão</h4>
              <p className="mt-2 text-sm text-green-800">
                <strong>Status:</strong> Futuro<br />
                Deploy em produção, configuração de domínio customizado, implementação de recursos
                avançados (gamificação expandida, IA, integração com órgãos públicos), monitoramento,
                analytics e otimizações de performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#1a4d2e]">Stack Tecnológica</h3>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
          {[
            { name: 'React', desc: 'UI Library' },
            { name: 'TypeScript', desc: 'Type Safety' },
            { name: 'Tailwind CSS', desc: 'Styling' },
            { name: 'Supabase', desc: 'Backend & DB' },
            { name: 'React Router', desc: 'Navigation' },
            { name: 'Recharts', desc: 'Charts' },
            { name: 'Make', desc: 'Automation' },
            { name: 'PostgreSQL', desc: 'Database' },
            { name: 'Vite', desc: 'Build Tool' }
          ].map((tech, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]/10">
                <GitBranch className="h-6 w-6 text-[#4caf50]" />
              </div>
              <p className="mt-2 font-semibold">{tech.name}</p>
              <p className="text-xs text-muted-foreground">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Info */}
      <div className="rounded-xl border bg-gradient-to-r from-[#4caf50]/10 to-[#81c784]/10 p-6">
        <h3 className="font-semibold text-[#1a4d2e]">📋 Como Conectar ao Supabase</h3>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <strong>1.</strong> Acesse a página de configurações do Make
          </p>
          <p>
            <strong>2.</strong> Conecte seu projeto Supabase fornecendo as credenciais
          </p>
          <p>
            <strong>3.</strong> O sistema irá migrar automaticamente do mock para a conexão real
          </p>
          <p>
            <strong>4.</strong> Configure as variáveis de ambiente e secrets necessários
          </p>
          <p className="mt-4 italic text-muted-foreground">
            Nota: O sistema atual funciona com dados mock para demonstração e prototipagem.
            A conexão com Supabase permite persistência real de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
