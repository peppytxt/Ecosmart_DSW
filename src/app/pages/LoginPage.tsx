import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, senha);
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate('/app');
      } else {
        setError('E-mail ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4caf50]">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1a4d2e]">EcoSmart</h1>
              <p className="text-xs text-muted-foreground">Gestão Sustentável</p>
            </div>
          </Link>

          <div>
            <h2 className="text-3xl font-bold text-[#1a4d2e]">Bem-vindo de volta</h2>
            <p className="mt-2 text-muted-foreground">
              Entre com sua conta para continuar
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium">E-mail</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Senha</label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
                />
                <span className="text-muted-foreground">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm font-medium text-[#4caf50] hover:text-[#45a049]">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-lg bg-[#4caf50] font-semibold text-white transition-colors hover:bg-[#45a049] disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link to="/cadastro" className="font-medium text-[#4caf50] hover:text-[#45a049]">
              Criar conta
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-lg border bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Credenciais de Teste
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <span className="font-medium">Admin:</span> admin@ecosmart.com / admin123
              </div>
              <div>
                <span className="font-medium">Usuário:</span> maria@email.com / maria123
              </div>
              <div>
                <span className="font-medium">Usuário:</span> pedro@email.com / pedro123
              </div>
              <div>
                <span className="font-medium">Premium:</span> ana@email.com / ana123
              </div>
              <div>
                <span className="font-medium">Premium:</span> joao@email.com / joao123
              </div>
              <div>
                <span className="font-medium">Empresarial:</span> carlos@empresa.com / carlos123
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <div className="relative h-full bg-gradient-to-br from-[#1a4d2e] to-[#4caf50]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1654806356543-3e252af2705f?q=80&w=1080')"
            }}
          />
          <div className="relative flex h-full flex-col justify-center px-16 text-white">
            <h2 className="text-4xl font-bold">
              Gestão inteligente de resíduos
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Acompanhe seu impacto ambiental, registre descartes e contribua para um futuro
              mais sustentável.
            </p>
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  ✓
                </div>
                <span>Registro digital de descartes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  ✓
                </div>
                <span>Indicadores ambientais em tempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  ✓
                </div>
                <span>Conteúdo educativo sobre reciclagem</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
