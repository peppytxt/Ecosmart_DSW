import json
from datetime import date

from django.http import JsonResponse
from django.test import RequestFactory, TestCase, override_settings

from .auth import EcoSmartAuthMiddleware, create_auth_token, require_auth
from .models import Descarte, Instituicao, PedidoColeta, TipoResiduo, Usuario, UsuarioInstituicao


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class BackendQualityTests(TestCase):
    def setUp(self):
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

        UsuarioInstituicao.objects.create(usuario=self.up_vinculado, instituicao=self.instituicao)
        UsuarioInstituicao.objects.create(usuario=self.ue, instituicao=self.instituicao)
        self.request_factory = RequestFactory()

    def auth_headers(self, email, senha):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"email": email, "senha": senha}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        return {"HTTP_AUTHORIZATION": f"Bearer {response.json()['token']}"}

    def criar_pedido_uc(self, material="Papel"):
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
        return Descarte.objects.create(
            usuario=usuario or self.uc,
            tipo_residuo=self.papel,
            quantidade=1,
            unidade_medida="kg",
            data_descarte=date(2026, 5, 16),
            local_descarte="Casa",
            status="registrado",
        )

    def test_middleware_anexa_usuario_autenticado_ao_request(self):
        token = create_auth_token(self.uc)
        request = self.request_factory.get(
            "/api/descartes/historico/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        middleware = EcoSmartAuthMiddleware(lambda req: JsonResponse({"ok": True}))

        response = middleware(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(request.ecosmart_user.email, "maria@email.com")

    def test_middleware_bloqueia_perfil_nao_autorizado_antes_da_view(self):
        token = create_auth_token(self.uc)
        request = self.request_factory.get(
            "/api/metrics/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        middleware = EcoSmartAuthMiddleware(lambda req: JsonResponse({"ok": True}))

        @require_auth(["UA"])
        def view_admin(request):
            return JsonResponse({"ok": True})

        middleware(request)
        response = middleware.process_view(request, view_admin, (), {})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(json.loads(response.content)["error"], "Permissão insuficiente")

    def test_middleware_bloqueia_token_ausente_antes_da_view(self):
        request = self.request_factory.get("/api/metrics/")
        middleware = EcoSmartAuthMiddleware(lambda req: JsonResponse({"ok": True}))

        @require_auth(["UA"])
        def view_admin(request):
            return JsonResponse({"ok": True})

        middleware(request)
        response = middleware.process_view(request, view_admin, (), {})

        self.assertEqual(response.status_code, 401)
        self.assertEqual(json.loads(response.content)["error"], "Autenticação necessária")

    def test_login_retorna_token_e_rejeita_senha_invalida(self):
        sucesso = self.client.post(
            "/api/login/",
            data=json.dumps({"email": "maria@email.com", "senha": "maria123"}),
            content_type="application/json",
        )
        falha = self.client.post(
            "/api/login/",
            data=json.dumps({"email": "maria@email.com", "senha": "senha-errada"}),
            content_type="application/json",
        )

        self.assertEqual(sucesso.status_code, 200)
        self.assertTrue(sucesso.json()["token"])
        self.assertEqual(falha.status_code, 401)

    def test_signup_com_perfil_invalido_cria_usuario_comum(self):
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

    def test_rotas_protegidas_exigem_autenticacao(self):
        response = self.client.get(f"/api/descartes/historico/?usuario_id={self.uc.id}")

        self.assertEqual(response.status_code, 401)

    def test_uc_nao_acessa_historico_de_outro_usuario(self):
        response = self.client.get(
            f"/api/descartes/historico/?usuario_id={self.outro_uc.id}",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 403)

    def test_uc_nao_acessa_lista_de_descartes_disponiveis_para_up(self):
        response = self.client.get(
            "/api/descartes/disponiveis/",
            **self.auth_headers("maria@email.com", "maria123"),
        )

        self.assertEqual(response.status_code, 403)

    def test_uc_registra_descarte_e_consulta_historico(self):
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

    def test_pedido_de_coleta_cria_descarte_disponivel_para_up(self):
        pedido = self.criar_pedido_uc()
        descarte = Descarte.objects.get(id=pedido["descarte_id"])
        disponiveis = self.client.get(
            "/api/descartes/disponiveis/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(pedido["status"], "solicitada")
        self.assertEqual(descarte.pedido_coleta_id, pedido["id"])
        self.assertEqual(descarte.status, "registrado")
        self.assertIn(pedido["descarte_id"], [item["id"] for item in disponiveis.json()])

    def test_pedido_sem_material_retorna_400(self):
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
        self.assertIn("Administradores não solicitam coleta", response.json()["error"])

    def test_up_vinculado_coleta_transita_finaliza_e_ue_visualiza(self):
        pedido = self.criar_pedido_uc()
        headers_up = self.auth_headers("ana@email.com", "ana123")

        coleta = self.client.post(f"/api/descartes/{pedido['descarte_id']}/coletar/", **headers_up)
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
        self.assertEqual(coleta.json()["instituicao_coletora_nome"], "EcoSmart Cooperativa")
        self.assertEqual(pedido_model.status, "concluido")
        self.assertEqual(em_transito.status_code, 200)
        self.assertEqual(finalizado.status_code, 200)
        self.assertIn(pedido["descarte_id"], [item["id"] for item in empresa_apos_coleta.json()])

    def test_descarte_ja_coletado_nao_pode_ser_coletado_novamente(self):
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
        pedido = self.criar_pedido_uc("Metal")
        headers_up = self.auth_headers("joao@email.com", "joao123")

        coleta = self.client.post(f"/api/descartes/{pedido['descarte_id']}/coletar/", **headers_up)
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
        self.assertNotIn(pedido["descarte_id"], [item["id"] for item in empresa.json()])

    def test_transicao_invalida_de_status_retorna_erro(self):
        pedido = self.criar_pedido_uc()
        headers_up = self.auth_headers("ana@email.com", "ana123")
        self.client.post(f"/api/descartes/{pedido['descarte_id']}/coletar/", **headers_up)

        response = self.client.post(
            f"/api/descartes/{pedido['descarte_id']}/status/",
            data=json.dumps({"status": "processado"}),
            content_type="application/json",
            **headers_up,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Transição inválida", response.json()["error"])

    def test_up_nao_altera_status_de_coleta_de_outro_up(self):
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
        descarte = self.criar_descarte_registrado()

        response = self.client.post(
            f"/api/descartes/{descarte.id}/status/",
            data=json.dumps({"status": "em_transito"}),
            content_type="application/json",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(response.status_code, 403)

    def test_up_nao_pode_coletar_o_proprio_descarte(self):
        descarte = self.criar_descarte_registrado(usuario=self.up_vinculado)

        response = self.client.post(
            f"/api/descartes/{descarte.id}/coletar/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("próprio descarte", response.json()["error"])

    def test_coletar_descarte_inexistente_retorna_404(self):
        response = self.client.post(
            "/api/descartes/9999/coletar/",
            **self.auth_headers("ana@email.com", "ana123"),
        )

        self.assertEqual(response.status_code, 404)

    def test_workspace_ue_lista_vincula_e_inativa_usuario(self):
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
        response = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({"usuario_id": self.ua.id}),
            content_type="application/json",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Administradores não podem", response.json()["error"])

    def test_workspace_rejeita_usuario_inexistente(self):
        response = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({"usuario_id": 9999}),
            content_type="application/json",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )

        self.assertEqual(response.status_code, 404)

    def test_workspace_sem_usuario_informado_retorna_400(self):
        response = self.client.post(
            "/api/workspace/vinculos/",
            data=json.dumps({}),
            content_type="application/json",
            **self.auth_headers("carlos@empresa.com", "carlos123"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Informe usuario_id ou email", response.json()["error"])

    def test_ue_sem_vinculo_recebe_workspace_auto_criado(self):
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
        self.assertEqual(response.json()["workspace"]["nome_workspace"], "Workspace Empresa Nova")
        self.assertTrue(
            UsuarioInstituicao.objects.filter(usuario=ue_sem_workspace, vinculo_ativo=True).exists()
        )

    def test_metricas_admin_somente_para_ua(self):
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
