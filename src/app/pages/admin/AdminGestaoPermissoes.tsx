import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function AdminGestaoPermissoes() {
  const [permissions, setPermissions] = useState({
    UC: {
      registrar_descarte: true,
      ver_historico: true,
      ver_impacto: true,
      acessar_educacao: true,
      ver_pontos_coleta: true,
      solicitar_coleta: true,
      ver_relatorios: false,
      gerenciar_usuarios: false
    },
    UP: {
      registrar_descarte: true,
      ver_historico: true,
      ver_impacto: true,
      acessar_educacao: true,
      ver_pontos_coleta: true,
      solicitar_coleta: true,
      ver_relatorios: true,
      gerenciar_usuarios: false
    },
    UE: {
      registrar_descarte: true,
      ver_historico: true,
      ver_impacto: true,
      acessar_educacao: true,
      ver_pontos_coleta: true,
      solicitar_coleta: true,
      ver_relatorios: true,
      gerenciar_usuarios: false
    },
    UA: {
      registrar_descarte: true,
      ver_historico: true,
      ver_impacto: true,
      acessar_educacao: true,
      ver_pontos_coleta: true,
      solicitar_coleta: true,
      ver_relatorios: true,
      gerenciar_usuarios: true
    }
  });

  const handleSave = () => {
    toast.success('Permissões atualizadas com sucesso!');
  };

  const handleReset = () => {
    setPermissions({
      UC: {
        registrar_descarte: true,
        ver_historico: true,
        ver_impacto: true,
        acessar_educacao: true,
        ver_pontos_coleta: true,
        solicitar_coleta: true,
        ver_relatorios: false,
        gerenciar_usuarios: false
      },
      UP: {
        registrar_descarte: true,
        ver_historico: true,
        ver_impacto: true,
        acessar_educacao: true,
        ver_pontos_coleta: true,
        solicitar_coleta: true,
        ver_relatorios: true,
        gerenciar_usuarios: false
      },
      UE: {
        registrar_descarte: true,
        ver_historico: true,
        ver_impacto: true,
        acessar_educacao: true,
        ver_pontos_coleta: true,
        solicitar_coleta: true,
        ver_relatorios: true,
        gerenciar_usuarios: false
      },
      UA: {
        registrar_descarte: true,
        ver_historico: true,
        ver_impacto: true,
        acessar_educacao: true,
        ver_pontos_coleta: true,
        solicitar_coleta: true,
        ver_relatorios: true,
        gerenciar_usuarios: true
      }
    });
    toast.info('Permissões restauradas para padrão');
  };

  const togglePermission = (perfil: keyof typeof permissions, permission: string) => {
    setPermissions(prev => ({
      ...prev,
      [perfil]: {
        ...prev[perfil],
        [permission]: !prev[perfil][permission as keyof typeof prev.UC]
      }
    }));
  };

  const permissionLabels = {
    registrar_descarte: 'Registrar Descarte',
    ver_historico: 'Ver Histórico',
    ver_impacto: 'Ver Impacto Ambiental',
    acessar_educacao: 'Acessar Conteúdo Educativo',
    ver_pontos_coleta: 'Ver Pontos de Coleta',
    solicitar_coleta: 'Solicitar Coleta',
    ver_relatorios: 'Ver Relatórios Avançados',
    gerenciar_usuarios: 'Gerenciar Usuários'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e]">Gestão de Permissões</h1>
          <p className="mt-2 text-muted-foreground">
            Configure as permissões por perfil de usuário
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#4caf50] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#45a049]"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-4 text-left font-semibold">Permissão</th>
              <th className="px-6 py-4 text-center font-semibold">
                <div>UC</div>
                <div className="text-xs font-normal text-muted-foreground">Comum</div>
              </th>
              <th className="px-6 py-4 text-center font-semibold">
                <div>UP</div>
                <div className="text-xs font-normal text-muted-foreground">Premium</div>
              </th>
              <th className="px-6 py-4 text-center font-semibold">
                <div>UE</div>
                <div className="text-xs font-normal text-muted-foreground">Empresarial</div>
              </th>
              <th className="px-6 py-4 text-center font-semibold">
                <div>UA</div>
                <div className="text-xs font-normal text-muted-foreground">Admin</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissionLabels).map(([key, label]) => (
              <tr key={key} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-6 py-4">{label}</td>
                {(['UC', 'UP', 'UE', 'UA'] as const).map(perfil => (
                  <td key={perfil} className="px-6 py-4 text-center">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={permissions[perfil][key as keyof typeof permissions.UC]}
                        onChange={() => togglePermission(perfil, key)}
                        className="h-5 w-5 rounded border-gray-300 text-[#4caf50] focus:ring-2 focus:ring-[#4caf50]/20"
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="font-semibold">Legenda</h4>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div>
            <span className="font-medium">UC:</span> Usuário Comum
          </div>
          <div>
            <span className="font-medium">UP:</span> Usuário Premium
          </div>
          <div>
            <span className="font-medium">UE:</span> Usuário Empresarial
          </div>
          <div>
            <span className="font-medium">UA:</span> Administrador
          </div>
        </div>
      </div>
    </div>
  );
}