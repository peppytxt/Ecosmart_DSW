import { Link } from 'react-router';
import {
  Leaf,
  TrendingUp,
  Users,
  BookOpen,
  History,
  Award,
  Building2,
  ArrowRight,
  CheckCircle2,
  Recycle,
  BarChart3
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4caf50]">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-[#1a4d2e]">EcoSmart</h1>
                <p className="text-xs text-muted-foreground">Gestão Sustentável</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 transition-colors hover:bg-muted"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-lg bg-[#4caf50] px-4 py-2 text-white transition-colors hover:bg-[#45a049]"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a4d2e] via-[#2e7d43] to-[#4caf50] pt-32 pb-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563010015-bc0ea3b6dad4?q=80&w=1080')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
              Gestão Sustentável de Resíduos Sólidos
            </h1>
            <p className="mt-6 text-xl text-white/90">
              Plataforma digital colaborativa para registro de descartes, acompanhamento de impacto
              ambiental e incentivo a práticas sustentáveis.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/cadastro"
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-[#1a4d2e] transition-transform hover:scale-105"
              >
                Começar Agora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="mt-1 text-white/80">Usuários Ativos</div>
            </div>
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="text-3xl font-bold text-white">50 ton</div>
              <div className="mt-1 text-white/80">Resíduos Reciclados</div>
            </div>
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="mt-1 text-white/80">Pontos de Coleta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1a4d2e]">Como Funciona</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simples, rápido e eficiente
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4caf50]">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 font-semibold">1. Crie sua Conta</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastre-se gratuitamente e escolha o perfil que melhor se adequa às suas necessidades
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4caf50]">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 font-semibold">2. Registre Descartes</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Informe os materiais descartados com detalhes de quantidade, tipo e local
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4caf50]">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 font-semibold">3. Acompanhe seu Impacto</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Visualize métricas e indicadores do seu impacto ambiental positivo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1a4d2e]">Diferenciais EcoSmart</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Uma plataforma completa para gestão de resíduos
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CheckCircle2,
                title: 'Descarte Correto',
                description: 'Orientações sobre como descartar cada tipo de material corretamente'
              },
              {
                icon: History,
                title: 'Histórico Completo',
                description: 'Acompanhe todos os seus registros de descarte em um só lugar'
              },
              {
                icon: TrendingUp,
                title: 'Indicadores Ambientais',
                description: 'Métricas detalhadas sobre seu impacto ambiental positivo'
              },
              {
                icon: BookOpen,
                title: 'Educação Ambiental',
                description: 'Conteúdo educativo sobre reciclagem e sustentabilidade'
              },
              {
                icon: Building2,
                title: 'Colaboração Institucional',
                description: 'Empresas e cooperativas podem acompanhar dados consolidados'
              },
              {
                icon: Award,
                title: 'Gamificação',
                description: 'Ganhe pontos e recompensas por suas ações sustentáveis'
              }
            ].map((item, index) => (
              <div key={index} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4caf50]">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impacto Socioambiental */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1a4d2e]">
                Impacto Socioambiental Real
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Cada ação no EcoSmart contribui para um planeta mais sustentável
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Redução de emissões de CO₂',
                  'Economia de recursos naturais',
                  'Geração de renda para cooperativas',
                  'Educação ambiental contínua',
                  'Dados para políticas públicas'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#4caf50]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1654806356543-3e252af2705f?q=80&w=1080"
                alt="Coleta Seletiva"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parceiros */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1a4d2e]">Parceiros e Integrações</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Conectando dados de múltiplas fontes
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {['Prefeituras', 'Cooperativas', 'Órgãos Ambientais', 'Universidades'].map(
              (partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg border bg-card p-6 text-center"
                >
                  <span className="font-semibold text-muted-foreground">{partner}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-[#1a4d2e] to-[#4caf50] py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Pronto para fazer a diferença?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Junte-se a milhares de pessoas e empresas que já estão transformando o futuro
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/cadastro"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-[#1a4d2e] transition-transform hover:scale-105"
            >
              Criar Conta Gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-[#4caf50]" />
                <span className="font-bold text-[#1a4d2e]">EcoSmart</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Gestão sustentável de resíduos sólidos
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Produto</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#4caf50]">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-[#4caf50]">Preços</a></li>
                <li><a href="#" className="hover:text-[#4caf50]">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Empresa</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#4caf50]">Sobre</a></li>
                <li><a href="#" className="hover:text-[#4caf50]">Blog</a></li>
                <li><a href="#" className="hover:text-[#4caf50]">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#4caf50]">Privacidade</a></li>
                <li><a href="#" className="hover:text-[#4caf50]">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 EcoSmart. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
