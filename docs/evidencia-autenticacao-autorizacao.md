# Evidencia de Autenticacao e Autorizacao

## Status Geral

O projeto EcoSmart possui sistema autenticado funcional, middleware de autorizacao e regras de acesso por perfil implementadas para `UC`, `UP`, `UE` e `UA`.

Verificacao realizada em 29/05/2026.

## Checklist dos Pontos Solicitados

| Ponto verificado | Status | Evidencia |
| --- | --- | --- |
| Estrategia de autenticacao | Feito | Token assinado pelo Django em `ecosmart/auth.py`, gerado por `create_auth_token` e validado por `get_authenticated_user`. |
| Middleware de autorizacao | Feito | `EcoSmartAuthMiddleware` implementado em `ecosmart/auth.py` e registrado no `MIDDLEWARE` de `settings.py`. |
| Regras para `UC` | Feito | Usuario comum registra descartes, consulta o proprio historico, cria pedidos e edita o proprio perfil. |
| Regras para `UP` | Feito | Usuario premium visualiza descartes disponiveis, coleta residuos e atualiza status das proprias coletas. |
| Regras para `UE` | Feito | Usuario empresarial acessa descartes vinculados a instituicao e gerencia workspace empresarial. |
| Regras para `UA` | Feito | Administrador acessa metricas, gestao de usuarios, gestao de conteudos e rotas administrativas. |
| Evidencia de funcionamento | Feito | Testes automatizados cobrem login, token ausente/invalido, middleware e permissoes por perfil. |
| Sistema autenticado funcional | Confirmado | `python manage.py check` e `python manage.py test ecosmart -v 2` executados com sucesso. |

## Estrategia de Autenticacao

O backend usa autenticacao por token assinado com `django.core.signing`.

Fluxo implementado:

1. O usuario envia `email` e `senha` para `POST /api/login/`.
2. O backend valida as credenciais no modelo `Usuario`.
3. Em caso de sucesso, a API retorna os dados do usuario e um token.
4. O frontend salva o token em `localStorage` com a chave `ecosmart_token`.
5. As requisicoes autenticadas enviam o token no header HTTP:

```http
Authorization: Bearer <token>
```

Arquivos principais:

- `ecosmart/auth.py`
- `ecosmart/views.py`
- `src/contexts/AuthContext.tsx`
- `src/lib/api.ts`

## Middleware de Autorizacao

O middleware `EcoSmartAuthMiddleware` executa a validacao do token antes das views protegidas.

Responsabilidades implementadas:

- Ler o header `Authorization`.
- Validar o token assinado.
- Verificar se o usuario existe, esta ativo e tem o mesmo perfil gravado no token.
- Popular `request.ecosmart_user`.
- Retornar HTTP 401 para rotas protegidas sem autenticacao.
- Retornar HTTP 403 para perfil sem permissao.

As rotas protegidas usam o decorator `@require_auth`.

Exemplos:

```python
@require_auth(["UA"])
def api_dashboard_metrics(request):
    ...

@require_auth(["UP", "UA"])
def api_descartes_disponiveis(request):
    ...

@require_auth(["UE", "UA"])
def api_workspace(request):
    ...

@require_auth()
def api_pedidos_coleta(request):
    ...
```

## Regras por Perfil

### UC - Usuario Comum

Permissoes implementadas:

- Fazer login e manter sessao autenticada.
- Registrar descarte.
- Consultar o proprio historico.
- Criar e acompanhar pedidos de coleta.
- Atualizar o proprio perfil.
- Consultar conteudos educativos.

Restricoes implementadas:

- Nao acessa historico de outro usuario.
- Nao acessa descartes disponiveis para coleta.
- Nao acessa metricas administrativas.
- Nao cria conteudo educativo.
- Nao acessa workspace empresarial.

### UP - Usuario Premium

Permissoes implementadas:

- Fazer login e manter sessao autenticada.
- Acessar recursos basicos de usuario autenticado.
- Visualizar descartes disponiveis de usuarios comuns.
- Assumir coleta de descarte disponivel.
- Atualizar status da propria coleta.
- Consultar suas coletas.

Restricoes implementadas:

- Nao coleta o proprio descarte.
- Nao coleta descarte ja coletado.
- Nao altera coleta de outro `UP`.
- Nao acessa metricas administrativas.

### UE - Usuario Empresarial

Permissoes implementadas:

- Fazer login e manter sessao autenticada.
- Consultar descartes vinculados a sua instituicao.
- Acessar workspace empresarial.
- Vincular usuarios ao workspace.
- Inativar e reativar vinculos.
- Consultar pedidos vinculados a instituicoes do usuario.

Restricoes implementadas:

- Nao visualiza coleta feita por `UP` sem vinculo institucional.
- Nao acessa metricas administrativas.
- Nao gerencia usuarios globais.
- Nao vincula usuarios administradores ao workspace.

### UA - Usuario Administrador

Permissoes implementadas:

- Fazer login e manter sessao autenticada.
- Acessar metricas administrativas.
- Listar, criar, editar e remover usuarios.
- Criar e remover conteudos educativos.
- Acessar rotas administrativas.
- Supervisionar rotas de coleta permitidas.

Restricao implementada:

- Nao cria pedido de coleta como usuario operacional.

## Evidencia de Funcionamento

Comandos executados em 29/05/2026:

```powershell
python manage.py check
python manage.py test ecosmart -v 2
```

Resultado:

```text
System check identified no issues (0 silenced).
Found 48 test(s).
Ran 48 tests in 0.850s
OK
```

Testes relacionados:

- `test_login_retorna_token_e_rejeita_senha_invalida`
- `test_middleware_anexa_usuario_autenticado_ao_request`
- `test_middleware_bloqueia_perfil_nao_autorizado_antes_da_view`
- `test_middleware_bloqueia_token_ausente_antes_da_view`
- `test_rotas_protegidas_exigem_autenticacao`
- `test_token_invalido_retorna_401`
- `test_acesso_sem_token_retorna_401`
- `test_uc_nao_acessa_historico_de_outro_usuario`
- `test_uc_nao_acessa_lista_de_descartes_disponiveis_para_up`
- `test_up_vinculado_coleta_transita_finaliza_e_ue_visualiza`
- `test_up_nao_altera_status_de_coleta_de_outro_up`
- `test_workspace_ue_lista_vincula_e_inativa_usuario`
- `test_metricas_admin_somente_para_ua`
- `test_conteudo_educativo_post_somente_para_admin`

## Conclusao

Os pontos solicitados estao implementados e validados. O sistema possui autenticacao funcional, autorizacao centralizada por middleware/decorator e controle de acesso por perfil aplicado nas rotas principais do backend, com apoio de protecao de rotas no frontend.
