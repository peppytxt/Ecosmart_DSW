import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Mail, Lock, User as UserIcon, Phone, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SignupPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    senha: '',
    confirmarSenha: '',
    perfil: 'UC' as 'UC' | 'UP' | 'UE'
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (!acceptTerms) {
      setError('Você deve aceitar os termos de uso');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmarSenha, ...userData } = formData;
      const success = await signup(userData);

      if (success) {
        toast.success('Conta criada com sucesso!');
        navigate('/app');
      } else {
        setError('Não foi possível criar a conta. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Lado Esquerdo - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
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
            <h2 className="text-3xl font-bold text-[#1a4d2e]">Criar conta</h2>
            <p className="mt-2 text-muted-foreground">
              Comece sua jornada sustentável hoje
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium">Nome Completo</label>
              <div className="relative mt-2">
                <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome"
                  className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">E-mail</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Telefone</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    placeholder="(11) 98765-4321"
                    className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Tipo de Perfil</label>
                <select
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleChange}
                  className="mt-2 h-12 w-full rounded-lg border bg-input-background px-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="UC">Usuário Comum</option>
                  <option value="UP">Usuário Premium</option>
                  <option value="UE">Usuário Empresarial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Endereço</label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                  placeholder="Rua, número, bairro - Cidade, Estado"
                  className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Senha</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Confirmar Senha</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="h-12 w-full rounded-lg border bg-input-background pl-11 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Aceito os{' '}
                <a href="#" className="font-medium text-[#4caf50] hover:text-[#45a049]">
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a href="#" className="font-medium text-[#4caf50] hover:text-[#45a049]">
                  Política de Privacidade
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-lg bg-[#4caf50] font-semibold text-white transition-colors hover:bg-[#45a049] disabled:opacity-50"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login" className="font-medium text-[#4caf50] hover:text-[#45a049]">
              Entrar
            </Link>
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
                "url('https://images.unsplash.com/photo-1763569673220-322f82260587?q=80&w=1080')"
            }}
          />
          <div className="relative flex h-full flex-col justify-center px-16 text-white">
            <h2 className="text-4xl font-bold">
              Junte-se ao EcoSmart
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Faça parte de uma comunidade comprometida com a sustentabilidade e o futuro do
              planeta.
            </p>
            <div className="mt-12 space-y-6">
              <div>
                <h3 className="font-semibold">Usuário Comum</h3>
                <p className="mt-1 text-sm text-white/80">
                  Registre descartes e acompanhe seu impacto ambiental
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Usuário Premium</h3>
                <p className="mt-1 text-sm text-white/80">
                  Acesse recursos avançados, relatórios detalhados e recompensas
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Usuário Empresarial</h3>
                <p className="mt-1 text-sm text-white/80">
                  Gerencie dados consolidados da sua organização
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
