import json
from datetime import date

from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.test import RequestFactory, TestCase, override_settings

from .auth import EcoSmartAuthMiddleware, create_auth_token, require_auth
from .models import Descarte, Instituicao, PedidoColeta, TipoResiduo, Usuario, UsuarioInstituicao


# MIXIN BASE — Reutiliza setUp e utilitários em todas as classes de teste.
# Não herda de TestCase, então o Django não executa os métodos desta classe.


class EcoSmartTestMixin:
    """
    Mixin base com setUp e métodos utilitários compartilhados.
    Não herda de TestCase — o Django ignora esta classe e não executa
    seus métodos como testes. As subclasses herdam daqui + TestCase.
    """

    def setUp(self):
        """
        Prepara o ambiente antes de cada teste.
        Cria tipos de resíduo, uma instituição e usuários com perfis variados:
        - UC  = Usuário Comum
        - UP  = Usuário Premium (coletor)
        - UE  = Usuário Empresa
        - UA  = Usuário Administrador
        """
        self.papel = TipoResiduo.objects.create(nome="Papel", reciclavel=True)
        self.metal = TipoResiduo.objects.create(nome="Metal", reciclavel=True)
        self.instituicao = Instituicao.objects.create(
            nome="EcoSmart Cooperativa",
            tipo="Cooperativa",
            cnpj="12.345.678/0001-99",
            email_contato="contato@ecosmart.com",
        )
        self.uc = Usuario.objects.create(
            nome="Maria Silva",
            email="maria@email.com",
            senha="maria123",
            perfil="UC",
            status=True,
            endereco="Rua UC, 100",
        )
        self.outro_uc = Usuario.objects.create(
            nome="Pedro Santos",
            email="pedro@email.com",
            senha="pedro123",
            perfil="UC",
            status=True,
        )
        self.up_vinculado = Usuario.objects.create(
            nome="Ana Premium",
            email="ana@email.com",
            senha="ana123",
            perfil="UP",
            status=True,
        )
        self.up_sem_vinculo = Usuario.objects.create(
            nome="Joao Premium",
            email="joao@email.com",
            senha="joao123",
            perfil="UP",
            status=True,
        )
        self.ue = Usuario.objects.create(
            nome="Carlos Empresa",
            email="carlos@empresa.com",
            senha="carlos123",
            perfil="UE",
            status=True,
        )
        self.ua = Usuario.objects.create(
            nome="Admin Sistema",
            email="admin@ecosmart.com",
            senha="admin123",
            perfil="UA",
            status=True,
        )

        # Vincula a UP (Ana) e a UE (Carlos) à mesma instituição
        UsuarioInstituicao.objects.create(
            usuario=self.up_vinculado, instituicao=self.instituicao)
        UsuarioInstituicao.objects.create(
            usuario=self.ue, instituicao=self.instituicao)
        self.request_factory = RequestFactory()

    def auth_headers(self, email, senha):
        """
        Utilitário: faz login e retorna o header de autenticação Bearer.
        Usado para autenticar requisições nos testes.
        """
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"email": email, "senha": senha}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        return {"HTTP_AUTHORIZATION": f"Bearer {response.json()['token']}"}

    def criar_pedido_uc(self, material="Papel"):
        """
        Utilitário: cria um pedido de coleta como o usuário UC (Maria).
        Retorna o JSON do pedido criado.
        """
        response = self.client.post(
            "/api/pedidos-coleta/",
            data=json.dumps({
                "materiais": [material],
                "quantidade_estimada": "4 kg",
                "endereco": "Rua Teste, 123",
                "observacao": "Teste automatizado",
                "data_preferencial": "2026-05-16",
            }),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )
        self.assertEqual(response.status_code, 201)
        return response.json()

    def criar_descarte_registrado(self, usuario=None):
        """
        Utilitário: cria um descarte diretamente no banco com status 'registrado'.
        Útil para testar fluxos de coleta sem passar pela API de pedidos.
        """
        return Descarte.objects.create(
            usuario=usuario or self.uc,
            tipo_residuo=self.papel,
            quantidade=1,
            unidade_medida="kg",
            data_descarte=date(2026, 5, 16),
            local_descarte="Casa",
            status="registrado",
        )


# TESTES PRINCIPAIS — Middleware, Autenticação, Descartes, Pedidos, Workspace


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class BackendQualityTests(EcoSmartTestMixin, TestCase):
    """
    Suite principal de testes de qualidade do backend EcoSmart.
    Usa MD5 como hasher de senha para tornar os testes mais rápidos.
    """

    # Testes de Middleware e Autenticação

    def test_middleware_anexa_usuario_autenticado_ao_request(self):
        """
        Verifica se o middleware identifica corretamente o usuário pelo token
        e o anexa ao objeto request como 'ecosmart_user'.
        """
        token = create_auth_token(self.uc)
        request = self.request_factory.get(
            "/api/descartes/historico/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        middleware = EcoSmartAuthMiddleware(
            lambda req: JsonResponse({"ok": True}))

        response = middleware(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(request.ecosmart_user.email, "maria@email.com")

    def test_middleware_bloqueia_perfil_nao_autorizado_antes_da_view(self):
        """
        Verifica se o middleware bloqueia (403) um usuário com perfil insuficiente
        antes mesmo de a view ser executada.
        """
        token = create_auth_token(self.uc)
        request = self.request_factory.get(
            "/api/metrics/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        middleware = EcoSmartAuthMiddleware(
            lambda req: JsonResponse({"ok": True}))

        @require_auth(["UA"])
        def view_admin(request):
            return JsonResponse({"ok": True})

        middleware(request)
        response = middleware.process_view(request, view_admin, (), {})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(json.loads(response.content)[
                         "error"], "Permissão insuficiente")

    def test_middleware_bloqueia_token_ausente_antes_da_view(self):
        """
        Verifica se o middleware retorna 401 quando a requisição não possui
        nenhum token de autenticação no header.
        """
        request = self.request_factory.get("/api/metrics/")
        middleware = EcoSmartAuthMiddleware(
            lambda req: JsonResponse({"ok": True}))

        @require_auth(["UA"])
        def view_admin(request):
            return JsonResponse({"ok": True})

        middleware(request)
        response = middleware.process_view(request, view_admin, (), {})

        self.assertEqual(response.status_code, 401)
        self.assertEqual(json.loads(response.content)[
                         "error"], "Autenticação necessária")

    # Testes de Login e Cadastro

    def test_login_retorna_token_e_rejeita_senha_invalida(self):
        """
        Verifica que o login com credenciais corretas retorna um token (200),
        e que credenciais erradas são rejeitadas com 401.
        """
        sucesso = self.client.post(
            "/api/login/",
            data=json.dumps({"email": "maria@email.com", "senha": "maria123"}),
            content_type="application/json",
        )
        falha = self.client.post(
            "/api/login/",
            data=json.dumps({"email": "maria@email.com",
                            "senha": "senha-errada"}),
            content_type="application/json",
        )

        self.assertEqual(sucesso.status_code, 200)
        self.assertTrue(sucesso.json()["token"])
        self.assertEqual(falha.status_code, 401)

    def test_signup_com_perfil_invalido_cria_usuario_comum(self):
        """
        Verifica que ao tentar criar um usuário com perfil inválido (ex: 'ROOT'),
        o sistema ignora e cria como perfil padrão 'UC'.
        """
        response = self.client.post(
            "/api/signup/",
            data=json.dumps({
                "nome": "Novo Usuario",
                "email": "novo@email.com",
                "senha": "novo123",
                "perfil": "ROOT",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["perfil"], "UC")
        self.assertTrue(response.json()["token"])

    def test_signup_com_email_duplicado_retorna_erro(self):
        """
        Verifica que tentar cadastrar dois usuários com o mesmo e-mail
        retorna erro 400 com mensagem de erro no corpo.
        """
        response = self.client.post(
            "/api/signup/",
            data=json.dumps({
                "nome": "Maria Duplicada",
                "email": "maria@email.com",
                "senha": "maria123",
                "perfil": "UC",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    # Testes de Controle de Acesso

    def test_rotas_protegidas_exigem_autenticacao(self):
        """
        Verifica que acessar rotas protegidas sem autenticação retorna 401.
        """
        response = self.client.get(
            f"/api/descartes/historico/?usuario_id={self.uc.id}")

        self.assertEqual(response.status_code, 401)

    def test_uc_nao_acessa_historico_de_outro_usuario(self):
        """
        Verifica que um UC não consegue visualizar o histórico de outro UC.
        Deve retornar 403 (proibido).
        """
        response = self.client.get(
            f"/api/descartes/historico/?usuario_id={self.outro_uc.id}",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 403)

    def test_uc_nao_acessa_lista_de_descartes_disponiveis_para_up(self):
        """
        Verifica que um UC não pode acessar a lista de descartes disponíveis
        para coleta, que é exclusiva de coletores (UP).
        """
        response = self.client.get(
            "/api/descartes/disponiveis/",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 403)

    # Testes de Descartes

    def test_uc_registra_descarte_e_consulta_historico(self):
        """
        Verifica o fluxo completo: UC registra um descarte e depois consulta
        seu histórico, que deve conter exatamente o item criado.
        """
        response = self.client.post(
            "/api/descartes/",
            data=json.dumps({
                "usuario_id": self.uc.id,
                "tipo_residuo": "Papel",
                "quantidade": 2,
                "unidade": "kg",
                "data_descarte": "2026-05-16",
                "local": "Residencia",
                "observacao": "Papelao limpo",
            }),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )
        historico = self.client.get(
            f"/api/descartes/historico/?usuario_id={self.uc.id}",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(historico.status_code, 200)
        self.assertEqual(len(historico.json()), 1)
        self.assertEqual(historico.json()[0]["tipo_residuo"], "Papel")

    def test_registro_de_descarte_com_usuario_inexistente_retorna_404(self):
        """
        Verifica que tentar registrar um descarte para um usuário inexistente
        retorna 404.
        """
        response = self.client.post(
            "/api/descartes/",
            data=json.dumps({
                "usuario_id": 9999,
                "tipo_residuo": "Papel",
                "quantidade": 2,
                "unidade": "kg",
                "data_descarte": "2026-05-16",
                "local": "Residencia",
            }),
            content_type="application/json",
            **self.auth_headers("admin@ecosmart.com", "admin123"),
        )

        self.assertEqual(response.status_code, 404)

    # Testes de Pedidos de Coleta

    def test_pedido_de_coleta_cria_descarte_disponivel_para_up(self):
        """
        Verifica que ao criar um pedido de coleta, um descarte com status
        'registrado' é gerado e fica visível na lista de disponíveis para UP.
        """
        pedido = self.criar_pedido_uc()
        descarte = Descarte.objects.get(id=pedido["descarte_id"])
        disponiveis = self.client.get(
            "/api/descartes/disponiveis/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(pedido["status"], "solicitada")
        self.assertEqual(descarte.pedido_coleta_id, pedido["id"])
        self.assertEqual(descarte.status, "registrado")
        self.assertIn(pedido["descarte_id"], [item["id"]
                      for item in disponiveis.json()])

    def test_pedido_sem_material_retorna_400(self):
        """
        Verifica que um pedido de coleta sem materiais informados é rejeitado
        com 400 e mensagem de erro adequada.
        """
        response = self.client.post(
            "/api/pedidos-coleta/",
            data=json.dumps({
                "materiais": [],
                "quantidade_estimada": "4 kg",
                "endereco": "Rua Teste, 123",
            }),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Informe ao menos um material", response.json()["error"])

    def test_pedido_sem_endereco_e_usuario_sem_endereco_retorna_400(self):
        """
        Verifica que um pedido sem endereço, feito por um usuário que também
        não tem endereço cadastrado, retorna 400.
        """
        response = self.client.post(
            "/api/pedidos-coleta/",
            data=json.dumps({
                "materiais": ["Papel"],
                "quantidade_estimada": "4 kg",
                "endereco": "",
            }),
            content_type="application/json",
            **self.auth_headers("pedro@email.com", "pedro123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Informe o endereço", response.json()["error"])

    def test_ua_nao_pode_criar_pedido_de_coleta(self):
        """
        Verifica que administradores (UA) não podem solicitar coleta,
        retornando 403 com mensagem explicativa.
        """
        response = self.client.post(
            "/api/pedidos-coleta/",
            data=json.dumps({
                "materiais": ["Papel"],
                "quantidade_estimada": "4 kg",
                "endereco": "Rua Teste, 123",
            }),
            content_type="application/json",
            **self.auth_headers("admin@ecosmart.com", "admin123"),
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("Administradores não solicitam coleta",
                      response.json()["error"])

    # Testes de Fluxo de Coleta

    def test_up_vinculado_coleta_transita_finaliza_e_ue_visualiza(self):
        """
        Testa o fluxo completo de uma coleta por um UP vinculado a uma instituição:
        coleta → em_transito → processado.
        Verifica que a UE da mesma instituição consegue visualizar o descarte.
        """
        pedido = self.criar_pedido_uc()
        headers_up = self.auth_headers("ana@email.com", "ana123")

        coleta = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/", **headers_up)
        pedido_model = PedidoColeta.objects.get(id=pedido["id"])
        empresa_apos_coleta = self.client.get(
            "/api/empresa/descartes/",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )
        em_transito = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **headers_up,
        )
        finalizado = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "processado"}),
            content_type="application/json",
            **headers_up,
        )
        pedido_model.refresh_from_db()

        self.assertEqual(coleta.status_code, 200)
        self.assertEqual(coleta.json()["nome_coletor"], "Ana Premium")
        self.assertEqual(
            coleta.json()["instituicao_coletora_nome"], "EcoSmart Cooperativa")
        self.assertEqual(pedido_model.status, "concluido")
        self.assertEqual(em_transito.status_code, 200)
        self.assertEqual(finalizado.status_code, 200)
        self.assertIn(pedido["descarte_id"], [item["id"]
                      for item in empresa_apos_coleta.json()])

    def test_descarte_ja_coletado_nao_pode_ser_coletado_novamente(self):
        """
        Verifica que um descarte já coletado por um UP não pode ser coletado
        por outro UP, retornando 400.
        """
        pedido = self.criar_pedido_uc()
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        response = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/",
            **self.auth_headers("joao@email.com", "joao123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("não está disponível", response.json()["error"])

    def test_up_sem_vinculo_finaliza_sem_aparecer_para_ue(self):
        """
        Verifica que quando um UP sem vínculo institucional realiza a coleta,
        o descarte não aparece para a UE (pois não há instituição associada).
        """
        pedido = self.criar_pedido_uc("Metal")
        headers_up = self.auth_headers("joao@email.com", "joao123")

        coleta = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/", **headers_up)
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **headers_up,
        )
        finalizado = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "processado"}),
            content_type="application/json",
            **headers_up,
        )
        empresa = self.client.get(
            "/api/empresa/descartes/",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )
        pedido_model = PedidoColeta.objects.get(id=pedido["id"])

        self.assertEqual(coleta.status_code, 200)
        self.assertIsNone(coleta.json()["instituicao_coletora_nome"])
        self.assertEqual(finalizado.json()["status"], "processado")
        self.assertEqual(pedido_model.status, "concluido")
        self.assertNotIn(pedido["descarte_id"], [item["id"]
                         for item in empresa.json()])

    def test_transicao_invalida_de_status_retorna_erro(self):
        """
        Verifica que uma transição de status inválida (ex: coletado → processado,
        pulando 'em_transito') retorna 400 com mensagem de erro.
        """
        pedido = self.criar_pedido_uc()
        headers_up = self.auth_headers("ana@email.com", "ana123")
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/", **headers_up)

        response = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "processado"}),
            content_type="application/json",
            **headers_up,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Transição inválida", response.json()["error"])

    def test_up_nao_altera_status_de_coleta_de_outro_up(self):
        """
        Verifica que um UP não pode alterar o status de uma coleta iniciada
        por outro UP, retornando 403.
        """
        pedido = self.criar_pedido_uc()
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        response = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **self.auth_headers("joao@email.com", "joao123"),
        )

        self.assertEqual(response.status_code, 403)

    def test_status_nao_pode_ser_atualizado_antes_da_coleta(self):
        """
        Verifica que o status de um descarte ainda não coletado não pode ser
        alterado por um UP, retornando 403.
        """
        descarte = self.criar_descarte_registrado()

        response = self.client.post(
            f"/api/descartes/{descarte.id}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(response.status_code, 403)

    def test_up_nao_pode_coletar_o_proprio_descarte(self):
        """
        Verifica que um UP não pode coletar um descarte que ele mesmo registrou,
        retornando 400 com mensagem de erro.
        """
        descarte = self.criar_descarte_registrado(usuario=self.up_vinculado)

        response = self.client.post(
            f"/api/descartes/{descarte.id}/coletar/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("próprio descarte", response.json()["error"])

    def test_coletar_descarte_inexistente_retorna_404(self):
        """
        Verifica que tentar coletar um descarte com ID inexistente retorna 404.
        """
        response = self.client.post(
            "/api/descartes/9999/coletar/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(response.status_code, 404)

    # Testes de Workspace (UE)

    def test_workspace_ue_lista_vincula_e_inativa_usuario(self):
        """
        Testa o fluxo de workspace da UE: listar workspace, vincular um usuário
        e depois inativar o vínculo.
        """
        headers_ue = self.auth_headers("carlos@empresa.com", "carlos123")

        workspace = self.client.get("/api/workspace/", **headers_ue)
        vinculo = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({"usuario_id": self.outro_uc.id}),
            content_type="application/json",
            **headers_ue,
        )
        inativo = self.client.put(
            f"/api/workspace/vinculos/{vinculo.json()['id']}/",
            data=json.dumps({"status_vinculo": "inativo"}),
            content_type="application/json",
            **headers_ue,
        )

        self.assertEqual(workspace.status_code, 200)
        self.assertEqual(vinculo.status_code, 201)
        self.assertEqual(vinculo.json()["usuario_email"], "pedro@email.com")
        self.assertEqual(inativo.status_code, 200)
        self.assertEqual(inativo.json()["status_vinculo"], "inativo")

    def test_workspace_rejeita_vinculo_com_admin(self):
        """
        Verifica que a UE não pode vincular um administrador ao workspace,
        retornando 400 com mensagem de erro.
        """
        response = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({"usuario_id": self.ua.id}),
            content_type="application/json",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Administradores não podem", response.json()["error"])

    def test_workspace_rejeita_usuario_inexistente(self):
        """
        Verifica que tentar vincular um usuário com ID inexistente retorna 404.
        """
        response = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({"usuario_id": 9999}),
            content_type="application/json",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )

        self.assertEqual(response.status_code, 404)

    def test_workspace_sem_usuario_informado_retorna_400(self):
        """
        Verifica que tentar criar um vínculo sem informar o usuário retorna 400.
        """
        response = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({}),
            content_type="application/json",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Informe usuario_id ou email", response.json()["error"])

    def test_ue_sem_vinculo_recebe_workspace_auto_criado(self):
        """
        Verifica que uma UE sem workspace já existente recebe um criado
        automaticamente ao acessar a rota de workspace pela primeira vez.
        """
        ue_sem_workspace = Usuario.objects.create(
            nome="Empresa Nova",
            email="empresa-nova@email.com",
            senha="empresa123",
            perfil="UE",
            status=True,
        )

        response = self.client.get(
            "/api/workspace/",
            **self.auth_headers(ue_sem_workspace.email, "empresa123"),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["workspace"]["nome_workspace"], "Workspace Empresa Nova")
        self.assertTrue(
            UsuarioInstituicao.objects.filter(
                usuario=ue_sem_workspace, vinculo_ativo=True).exists()
        )

    # Testes de Métricas e Conteúdo Educativo

    def test_metricas_admin_somente_para_ua(self):
        """
        Verifica que a rota de métricas só é acessível por administradores (UA).
        UC deve receber 403 e UA deve receber 200 com os dados corretos.
        """
        uc_response = self.client.get(
            "/api/metrics/",
            **self.auth_headers("maria@email.com", "maria123"),
        )
        ua_response = self.client.get(
            "/api/metrics/",
            **self.auth_headers("admin@ecosmart.com", "admin123"),
        )

        self.assertEqual(uc_response.status_code, 403)
        self.assertEqual(ua_response.status_code, 200)
        self.assertEqual(ua_response.json()["perfil_premium"], 2)

    def test_conteudo_educativo_post_somente_para_admin(self):
        """
        Verifica que apenas administradores (UA) podem criar conteúdo educativo.
        UC deve receber 403 e UA deve receber 201.
        """
        payload = {
            "nome": "Guia de Papel",
            "categoria": "Recicláveis",
            "descricao": "Como separar papel",
            "comoDescartar": "Separar seco",
            "cuidados": "Evitar sujeira",
        }
        uc_response = self.client.post(
            "/api/conteudos/",
            data=json.dumps(payload),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )
        ua_response = self.client.post(
            "/api/conteudos/",
            data=json.dumps(payload),
            content_type="application/json",
            **self.auth_headers("admin@ecosmart.com", "admin123"),
        )

        self.assertEqual(uc_response.status_code, 403)
        self.assertEqual(ua_response.status_code, 201)

    def test_usuario_comum_pode_atualizar_proprio_perfil_mas_nao_outro_usuario(self):
        """
        Verifica que um UC pode editar seu próprio perfil (200), mas não
        o de outro usuário (403).
        """
        outro_usuario = self.client.put(
            f"/api/usuarios/{self.outro_uc.id}/",
            data=json.dumps({"nome": "Tentativa Indevida"}),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )
        proprio_usuario = self.client.put(
            f"/api/usuarios/{self.uc.id}/",
            data=json.dumps({"nome": "Maria Atualizada"}),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(outro_usuario.status_code, 403)
        self.assertEqual(proprio_usuario.status_code, 200)
        self.assertEqual(proprio_usuario.json()["nome"], "Maria Atualizada")


# TESTES DE VALIDAÇÃO DE ENTRADA


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class ValidationTests(EcoSmartTestMixin, TestCase):
    """
    Testes focados em validação de dados de entrada.
    Herda o setUp do EcoSmartTestMixin para reutilizar os dados base.
    """

    def test_signup_com_email_invalido_retorna_erro(self):
        """
        Verifica que o cadastro com um e-mail em formato inválido (sem @, sem domínio)
        é rejeitado com 400 ou 422.
        """
        response = self.client.post(
            "/api/signup/",
            data=json.dumps({
                "nome": "Teste",
                "email": "email-invalido",
                "senha": "123456",
                "perfil": "UC",
            }),
            content_type="application/json",
        )

        self.assertIn(response.status_code, [400, 422])
        self.assertIn("email", str(response.content).lower())

    def test_signup_sem_nome_retorna_erro(self):
        """
        Verifica que o cadastro com o campo 'nome' vazio é rejeitado
        com 400 ou 422.
        """
        response = self.client.post(
            "/api/signup/",
            data=json.dumps({
                "nome": "",
                "email": "teste@email.com",
                "senha": "123456",
                "perfil": "UC",
            }),
            content_type="application/json",
        )

        self.assertIn(response.status_code, [400, 422])

    def test_descarte_com_quantidade_negativa_retorna_erro(self):
        """
        Verifica que registrar um descarte com quantidade negativa é rejeitado
        com 400 ou 422, pois quantidade não pode ser menor que zero.
        """
        response = self.client.post(
            "/api/descartes/",
            data=json.dumps({
                "usuario_id": self.uc.id,
                "tipo_residuo": "Papel",
                "quantidade": -5,
                "unidade": "kg",
                "data_descarte": "2026-05-16",
                "local": "Residencia",
            }),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertIn(response.status_code, [400, 422])

    def test_descricao_muito_grande_retorna_erro(self):
        """
        Verifica que uma observação com 10.000 caracteres é rejeitada
        pelo servidor com 400, 413 (payload too large) ou 422.
        """
        texto_grande = "A" * 10000

        response = self.client.post(
            "/api/descartes/",
            data=json.dumps({
                "usuario_id": self.uc.id,
                "tipo_residuo": "Papel",
                "quantidade": 1,
                "unidade": "kg",
                "data_descarte": "2026-05-16",
                "local": "Residencia",
                "observacao": texto_grande,
            }),
            content_type="application/json",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertIn(response.status_code, [400, 413, 422])


# TESTES DE INTEGRIDADE DE BANCO DE DADOS


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class DatabaseIntegrityTests(EcoSmartTestMixin, TestCase):
    """
    Testes que verificam as restrições do banco de dados (NOT NULL, UNIQUE,
    chaves estrangeiras). Garante que o modelo de dados é robusto.
    """

    def test_tipo_residuo_sem_nome_deve_falhar(self):
        """
        Verifica que a constraint NOT NULL do campo 'nome' de TipoResiduo
        é respeitada: criar com nome=None deve lançar IntegrityError.
        """
        with self.assertRaises(IntegrityError):
            TipoResiduo.objects.create(nome=None)

    def test_usuario_nao_pode_ter_email_duplicado(self):
        """
        Verifica que a constraint UNIQUE do campo 'email' de Usuario
        é respeitada: criar dois usuários com o mesmo e-mail deve lançar IntegrityError.
        """
        with self.assertRaises(IntegrityError):
            Usuario.objects.create(
                nome="Duplicado",
                email="maria@email.com",
                senha="123456",
                perfil="UC",
            )

    def test_descarte_com_usuario_inexistente_falha(self):
        """
        Verifica que a constraint de chave estrangeira é respeitada:
        criar um descarte referenciando um usuário que não existe no banco
        deve lançar IntegrityError.
        """
        from django.db import connection

        usuario_fake = Usuario(id=9999)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Descarte.objects.create(
                    usuario=usuario_fake,
                    tipo_residuo=self.papel,
                    quantidade=1,
                    unidade_medida="kg",
                    data_descarte=date(2026, 5, 16),
                    local_descarte="Casa",
                )
                connection.check_constraints()


# TESTES DE REGRESSÃO


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class RegressionTests(EcoSmartTestMixin, TestCase):
    """
    Testes de regressão: garantem que funcionalidades críticas continuam
    funcionando corretamente após alterações no código.
    """

    def test_regressao_permissoes_admin(self):
        """
        Regressão: confirma que o acesso de administrador às métricas
        continua funcionando (200).
        """
        response = self.client.get(
            "/api/metrics/",
            **self.auth_headers("admin@ecosmart.com", "admin123"),
        )

        self.assertEqual(response.status_code, 200)

    def test_regressao_uc_continua_sem_acesso_admin(self):
        """
        Regressão: confirma que usuários comuns (UC) continuam sendo bloqueados
        (403) ao tentar acessar rotas administrativas.
        """
        response = self.client.get(
            "/api/metrics/",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 403)


# TESTES DE SEGURANÇA


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class SecurityTests(EcoSmartTestMixin, TestCase):
    """
    Testes de segurança: verificam que tokens inválidos e acessos sem
    autenticação são corretamente bloqueados.
    """

    def test_token_invalido_retorna_401(self):
        """
        Verifica que uma requisição com token malformado ou inválido
        retorna 401 (não autorizado).
        """
        response = self.client.get(
            "/api/metrics/",
            HTTP_AUTHORIZATION="Bearer TOKEN_INVALIDO",
        )

        self.assertEqual(response.status_code, 401)

    def test_acesso_sem_token_retorna_401(self):
        """
        Verifica que acessar uma rota protegida sem nenhum token
        retorna 401 (não autorizado).
        """
        response = self.client.get("/api/workspace/")

        self.assertEqual(response.status_code, 401)


# TESTES DE ESTRESSE / CARGA


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class StressTests(EcoSmartTestMixin, TestCase):
    """
    Testes de estresse: simulam volume elevado de requisições para verificar
    que o sistema se mantém estável sob carga.
    """

    def test_criar_varios_descartes(self):
        """
        Cria 100 descartes consecutivos para o mesmo usuário e verifica
        que todos retornam 201. Testa a estabilidade da rota de registro.
        """
        for i in range(100):
            response = self.client.post(
                "/api/descartes/",
                data=json.dumps({
                    "usuario_id": self.uc.id,
                    "tipo_residuo": "Papel",
                    "quantidade": 1,
                    "unidade": "kg",
                    "data_descarte": "2026-05-16",
                    "local": f"Residencia {i}",
                }),
                content_type="application/json",
                **self.auth_headers("maria@email.com", "maria123"),
            )

            self.assertEqual(response.status_code, 201)

    def test_multiplos_logins_consecutivos(self):
        """
        Realiza 50 logins consecutivos com o mesmo usuário e verifica
        que todos retornam 200. Testa a estabilidade do sistema de autenticação.
        """
        for _ in range(50):
            response = self.client.post(
                "/api/login/",
                data=json.dumps({
                    "email": "maria@email.com",
                    "senha": "maria123",
                }),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)


# TESTES DE TRATAMENTO DE ERRO


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class ErrorHandlingTests(EcoSmartTestMixin, TestCase):
    """
    Testes de tratamento de erro: verificam o comportamento da API
    para requisições malformadas, rotas inexistentes e métodos inválidos.
    """

    def test_rota_inexistente_retorna_404(self):
        """
        Verifica que acessar uma rota que não existe na API retorna 404.
        """
        response = self.client.get("/api/rota-inexistente/")

        self.assertEqual(response.status_code, 404)

    def test_metodo_invalido_retorna_erro(self):
        """
        Verifica que usar um método HTTP não permitido (DELETE em /api/login/)
        retorna 400 ou 405 (Method Not Allowed).
        """
        response = self.client.delete("/api/login/")

        self.assertIn(response.status_code, [400, 405])

# TESTES DE INTEGRIDADE DE WORKFLOW


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class WorkflowIntegrityTests(EcoSmartTestMixin, TestCase):
    """
    Testes de integridade de workflow: garantem que os fluxos de negócio
    seguem a ordem correta de estados e transições.
    """

    def test_pedido_inicia_com_status_solicitada(self):
        """
        Verifica que todo pedido de coleta recém-criado inicia com
        o status 'solicitada'.
        """
        pedido = self.criar_pedido_uc()

        self.assertEqual(pedido["status"], "solicitada")

    def test_descarte_processado_nao_volta_para_em_transito(self):
        """
        Verifica que após um descarte ser marcado como 'processado',
        não é possível retroceder para 'em_transito'.
        O sistema deve rejeitar a transição com 400.
        """
        pedido = self.criar_pedido_uc()
        headers = self.auth_headers("ana@email.com", "ana123")

        # Fluxo normal: coletar → em_transito → processado
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/coletar/",
            **headers,
        )
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **headers,
        )
        self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "processado"}),
            content_type="application/json",
            **headers,
        )

        # Tentativa de retroceder o status — deve falhar
        response = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **headers,
        )

        self.assertEqual(response.status_code, 400)
