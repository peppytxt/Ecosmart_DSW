import json
import re
from datetime import date

from django.db import transaction
from django.db.models import Count
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password

from .models import (
    TipoResiduo,
    Usuario,
    ConteudoEducativo,
    Descarte,
    PedidoColeta,
    Instituicao,
    UsuarioInstituicao,
)
from .auth import create_auth_token, require_auth


PEDIDO_STATUS_TO_API = {
    "solicitado": "solicitada",
    "em_andamento": "agendada",
    "concluido": "finalizada",
    "cancelado": "cancelada",
}


def parse_active(value, default=True):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"ativo", "true", "1", "sim", "yes"}


def serialize_user(usuario, include_token=False):
    payload = {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "endereco": usuario.endereco,
        "perfil": usuario.perfil,
        "status": "ativo" if usuario.status else "inativo",
        "created_at": usuario.created_at.isoformat() if usuario.created_at else None,
    }

    if include_token:
        payload["token"] = create_auth_token(usuario)

    return payload


def get_active_instituicoes(usuario):
    return [
        vinculo.instituicao
        for vinculo in UsuarioInstituicao.objects.select_related("instituicao").filter(
            usuario=usuario,
            vinculo_ativo=True,
        )
    ]


def get_workspace_instituicao(usuario):
    if usuario.perfil == "UA":
        return Instituicao.objects.order_by("nome").first()

    vinculo = (
        UsuarioInstituicao.objects.select_related("instituicao")
        .filter(usuario=usuario, vinculo_ativo=True)
        .order_by("created_at")
        .first()
    )

    if vinculo:
        return vinculo.instituicao

    if usuario.perfil == "UE":
        instituicao, _ = Instituicao.objects.get_or_create(
            cnpj=f"AUTO-UE-{usuario.id:06d}",
            defaults={
                "nome": f"Workspace {usuario.nome}",
                "tipo": "Empresa",
                "email_contato": usuario.email,
                "telefone": usuario.telefone,
            },
        )
        UsuarioInstituicao.objects.update_or_create(
            usuario=usuario,
            instituicao=instituicao,
            defaults={"vinculo_ativo": True},
        )
        return instituicao

    return None


def iso_or_value(value):
    return value.isoformat() if hasattr(value, "isoformat") else value


def serialize_descarte(descarte):
    return {
        "id": descarte.id,
        "usuario_id": descarte.usuario_id,
        "usuario_nome": descarte.usuario.nome if descarte.usuario else "N/A",
        "usuario_perfil": descarte.usuario.perfil if descarte.usuario else None,
        "tipo_residuo": descarte.tipo_residuo.nome if descarte.tipo_residuo else "Não Informado",
        "quantidade": float(descarte.quantidade),
        "unidade": descarte.unidade_medida,
        "data_descarte": iso_or_value(descarte.data_descarte),
        "local": descarte.local_descarte,
        "observacao": descarte.observacoes,
        "status": descarte.status,
        "created_at": iso_or_value(descarte.created_at),
        "pedido_coleta_id": descarte.pedido_coleta_id,
        "coletor_id": descarte.coletor_id,
        "nome_coletor": descarte.coletor.nome if descarte.coletor else None,
        "coletor_perfil": descarte.coletor.perfil if descarte.coletor else None,
        "instituicao_coletora_id": descarte.instituicao_coletora_id,
        "instituicao_coletora_nome": (
            descarte.instituicao_coletora.nome if descarte.instituicao_coletora else None
        ),
        "data_coleta": iso_or_value(descarte.data_coleta) if descarte.data_coleta else None,
    }

# Alterado


def parse_quantidade_estimada(value):
    if value is None:
        return 0, "kg"

    text = str(value).strip()
    match = re.search(r"(\d+(?:[,.]\d+)?)", text)
    quantidade = float(match.group(1).replace(",", ".")) if match else 0
    unidade = "kg"

    lowered = text.lower()
    if "unidade" in lowered:
        unidade = "unidades"
    elif "litro" in lowered or " l" in lowered:
        unidade = "litros"

    return quantidade, unidade


def serialize_pedido_coleta(pedido):
    descarte = pedido.descartes.order_by("-created_at").first()

    return {
        "id": pedido.id,
        "usuario_id": pedido.usuario_id,
        "usuario_nome": pedido.usuario.nome if pedido.usuario else "N/A",
        "status": PEDIDO_STATUS_TO_API.get(pedido.status, pedido.status),
        "descarte_id": descarte.id if descarte else None,
        "endereco": pedido.endereco_coleta,
        "observacao": pedido.observacoes or "",
        "data_solicitacao": iso_or_value(pedido.created_at),
        "data_preferencial": iso_or_value(pedido.data_preferencial),
        "materiais": [pedido.tipo_residuo.nome] if pedido.tipo_residuo else [],
        "quantidade_estimada": f"{float(pedido.quantidade):g} {pedido.unidade_medida}",
        "instituicao_id": pedido.instituicao_id,
        "instituicao_nome": pedido.instituicao.nome if pedido.instituicao else None,
    }


def sync_pedido_status_from_descarte(descarte):
    if not descarte.pedido_coleta_id:
        return

    pedido = descarte.pedido_coleta
    status_por_descarte = {
        "registrado": "solicitado",
        "coletado": "em_andamento",
        "em_transito": "em_andamento",
        "processado": "concluido",
    }
    novo_status = status_por_descarte.get(descarte.status)

    if novo_status and pedido.status != novo_status:
        pedido.status = novo_status
        pedido.save(update_fields=["status", "updated_at"])


def serialize_instituicao(instituicao):
    if not instituicao:
        return None

    return {
        "id": instituicao.id,
        "nome_workspace": instituicao.nome,
        "nome": instituicao.nome,
        "tipo": instituicao.tipo,
        "cnpj": instituicao.cnpj,
        "email_contato": instituicao.email_contato,
        "telefone": instituicao.telefone,
    }


def serialize_vinculo(vinculo):
    usuario = vinculo.usuario

    return {
        "id": vinculo.id,
        "usuario_id": usuario.id,
        "usuario_nome": usuario.nome,
        "usuario_email": usuario.email,
        "usuario_telefone": usuario.telefone,
        "usuario_endereco": usuario.endereco,
        "perfil_usuario": usuario.perfil,
        "status_vinculo": "ativo" if vinculo.vinculo_ativo else "inativo",
        "instituicao_id": vinculo.instituicao_id,
        "instituicao_nome": vinculo.instituicao.nome if vinculo.instituicao else None,
        "setor": None,
        "unidade": None,
        "data_vinculo": iso_or_value(vinculo.created_at),
        "usuario": serialize_user(usuario),
    }


def user_can_access_target(request, target_user_id):
    auth_user = request.ecosmart_user
    return auth_user.perfil == "UA" or auth_user.id == int(target_user_id)


@csrf_exempt
@require_auth(["UA"])
def api_usuarios(request):
    if request.method == "GET":
        usuarios = [serialize_user(usuario)
                    for usuario in Usuario.objects.all().order_by("nome")]
        return JsonResponse(usuarios, safe=False)

    if request.method == "POST":
        try:
            data = json.loads(request.body or "{}")

            user = Usuario.objects.create(
                nome=data.get("nome"),
                email=data.get("email"),
                telefone=data.get("telefone"),
                endereco=data.get("endereco"),
                senha=data.get("senha", "EcoSmart123"),
                perfil=data.get("perfil", "UC"),
                status=parse_active(data.get("status"), default=True),
            )

            return JsonResponse(serialize_user(user), status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
@require_auth()
def api_conteudos(request):
    if request.method == "GET":
        conteudos = ConteudoEducativo.objects.all().order_by("nome")
        lista_conteudos = []

        for conteudo in conteudos:
            lista_conteudos.append({
                "id": conteudo.id,
                "nome": conteudo.nome,
                "categoria": conteudo.categoria,
                "descricao": conteudo.descricao,
                "como_descartar": conteudo.como_descartar.split("\n") if conteudo.como_descartar else [],
                "cuidados": conteudo.cuidados.split("\n") if conteudo.cuidados else [],
            })

        return JsonResponse(lista_conteudos, safe=False)

    if request.ecosmart_user.perfil != "UA":
        return JsonResponse({"error": "Permissão insuficiente"}, status=403)

    if request.method == "POST":
        try:
            data = json.loads(request.body or "{}")
            novo_conteudo = ConteudoEducativo.objects.create(
                nome=data.get("nome"),
                categoria=data.get("categoria"),
                descricao=data.get("descricao"),
                como_descartar=data.get("comoDescartar"),
                cuidados=data.get("cuidados", ""),
            )
            return JsonResponse({"id": novo_conteudo.id, "message": "Criado com sucesso!"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    if request.method == "DELETE":
        id_conteudo = request.GET.get("id")

        if id_conteudo:
            ConteudoEducativo.objects.filter(id=id_conteudo).delete()
            return JsonResponse({"message": "Excluído!"}, status=200)

        return JsonResponse({"error": "ID não fornecido"}, status=400)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def api_signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body or "{}")

            nome = (data.get("nome") or "").strip()
            email = (data.get("email") or "").strip()
            senha = (data.get("senha") or "").strip()

            if not nome:
                return JsonResponse({"error": "Nome é obrigatório"}, status=400)

            if not senha:
                return JsonResponse({"error": "Senha é obrigatória"}, status=400)

            email_regex = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
            if not email or not re.match(email_regex, email):
                return JsonResponse({"error": "email invalido"}, status=400)

            if Usuario.objects.filter(email=email).exists():
                return JsonResponse({"error": "E-mail já cadastrado"}, status=400)

            perfil = data.get("perfil", "UC")
            if perfil not in {"UC", "UP", "UE"}:
                perfil = "UC"

            usuario = Usuario.objects.create(
                nome=nome,
                email=email,
                telefone=data.get("telefone"),
                endereco=data.get("endereco"),
                senha=senha,
                perfil=perfil,
                status=True,
            )

            return JsonResponse(serialize_user(usuario, include_token=True), status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def api_login(request):
    if request.method == "POST":
        data = json.loads(request.body or "{}")
        email = data.get("email")
        senha = data.get("senha")

        usuario = Usuario.objects.filter(email=email, status=True).first()

        if usuario and check_password(senha, usuario.senha):
            return JsonResponse(serialize_user(usuario, include_token=True))

        return JsonResponse({"error": "Credenciais inválidas"}, status=401)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
@require_auth()
def api_update_perfil(request, user_id):
    if request.method != "PUT":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    if not user_can_access_target(request, user_id):
        return JsonResponse({"error": "Permissão insuficiente"}, status=403)

    try:
        usuario = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuário não encontrado"}, status=404)

    data = json.loads(request.body or "{}")
    usuario.nome = data.get("nome", usuario.nome)
    usuario.email = data.get("email", usuario.email)
    usuario.telefone = data.get("telefone", usuario.telefone)
    usuario.endereco = data.get("endereco", usuario.endereco)
    usuario.save()

    return JsonResponse(serialize_user(usuario))


@csrf_exempt
@require_auth(["UA"])
def api_dashboard_metrics(request):
    if request.method == "GET":
        try:
            perfis = Usuario.objects.values(
                "perfil").annotate(total=Count("perfil"))
            usuarios_por_perfil = {item["perfil"]
                : item["total"] for item in perfis}

            metrics = {
                "total_usuarios": Usuario.objects.count(),
                "total_conteudos": ConteudoEducativo.objects.count(),
                "perfil_comum": usuarios_por_perfil.get("UC", 0),
                "perfil_premium": usuarios_por_perfil.get("UP", 0),
                "perfil_empresa": usuarios_por_perfil.get("UE", 0),
                "perfil_admin": usuarios_por_perfil.get("UA", 0),
            }

            return JsonResponse(metrics, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
@require_auth()
def api_usuario_detalhe(request, user_id):
    try:
        usuario = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuário não encontrado"}, status=404)

    if request.method == "GET":
        if not user_can_access_target(request, user_id):
            return JsonResponse({"error": "Permissão insuficiente"}, status=403)

        return JsonResponse(serialize_user(usuario), status=200)

    if request.method == "PUT":
        if not user_can_access_target(request, user_id):
            return JsonResponse({"error": "Permissão insuficiente"}, status=403)

        try:
            data = json.loads(request.body or "{}")

            usuario.nome = data.get("nome", usuario.nome)
            usuario.email = data.get("email", usuario.email)
            usuario.telefone = data.get("telefone", usuario.telefone)
            usuario.endereco = data.get("endereco", usuario.endereco)

            if request.ecosmart_user.perfil == "UA":
                usuario.perfil = data.get("perfil", usuario.perfil)
                usuario.status = parse_active(
                    data.get("status"), default=usuario.status)

            usuario.save()

            return JsonResponse(serialize_user(usuario), status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    if request.method == "DELETE":
        if request.ecosmart_user.perfil != "UA":
            return JsonResponse({"error": "Permissão insuficiente"}, status=403)

        try:
            usuario.delete()
            return JsonResponse({"message": "Usuário deletado com sucesso"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
@require_auth()
def api_registrar_descarte(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body or "{}")
            usuario_id = data.get("usuario_id") or request.ecosmart_user.id

            if not user_can_access_target(request, usuario_id):
                return JsonResponse({"error": "Permissão insuficiente"}, status=403)

            try:
                usuario = Usuario.objects.get(id=usuario_id)
            except Usuario.DoesNotExist:
                return JsonResponse({"error": "Usuário não localizado no sistema."}, status=404)

            quantidade = data.get("quantidade")
            if quantidade is not None and float(quantidade) < 0:
                return JsonResponse({"error": "Quantidade não pode ser negativa"}, status=400)

            observacao = data.get("observacao") or ""
            if len(observacao) > 1000:
                return JsonResponse({"error": "Observação muito grande (máximo 1000 caracteres)"}, status=400)

            nome_residuo = data.get("tipo_residuo")
            tipo_residuo, _ = TipoResiduo.objects.get_or_create(
                nome=nome_residuo)

            descarte = Descarte.objects.create(
                usuario=usuario,
                tipo_residuo=tipo_residuo,
                quantidade=quantidade,
                unidade_medida=data.get("unidade"),
                data_descarte=data.get("data_descarte"),
                local_descarte=data.get("local"),
                observacoes=observacao,
                status="registrado",
            )

            return JsonResponse({
                "id": descarte.id,
                "message": "Descarte registrado com sucesso!",
                "descarte": serialize_descarte(descarte),
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método não permitido."}, status=405)


@csrf_exempt
@require_auth(["UP", "UA"])
def api_descartes_disponiveis(request):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    descartes = (
        Descarte.objects.select_related(
            "usuario",
            "tipo_residuo",
            "coletor",
            "instituicao_coletora",
            "pedido_coleta",
        )
        .filter(status="registrado", usuario__perfil="UC")
        .order_by("-created_at")
    )

    return JsonResponse([serialize_descarte(descarte) for descarte in descartes], safe=False)


@csrf_exempt
@require_auth(["UP", "UA"])
def api_coletar_descarte(request, descarte_id):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    try:
        descarte = Descarte.objects.select_related(
            "usuario",
            "tipo_residuo",
            "pedido_coleta",
        ).get(id=descarte_id)
    except Descarte.DoesNotExist:
        return JsonResponse({"error": "Descarte não encontrado"}, status=404)

    if descarte.status != "registrado":
        return JsonResponse({"error": "Este descarte não está disponível para coleta"}, status=400)

    if descarte.usuario_id == request.ecosmart_user.id:
        return JsonResponse({"error": "Você não pode coletar o próprio descarte"}, status=400)

    instituicoes = get_active_instituicoes(request.ecosmart_user)

    descarte.coletor = request.ecosmart_user
    descarte.instituicao_coletora = instituicoes[0] if instituicoes else None
    descarte.status = "coletado"
    descarte.data_coleta = timezone.now()
    descarte.save(update_fields=[
                  "coletor", "instituicao_coletora", "status", "data_coleta", "updated_at"])
    sync_pedido_status_from_descarte(descarte)

    return JsonResponse(serialize_descarte(descarte), status=200)


@csrf_exempt
@require_auth(["UP", "UA"])
def api_minhas_coletas(request):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    descartes = Descarte.objects.select_related(
        "usuario",
        "tipo_residuo",
        "coletor",
        "instituicao_coletora",
        "pedido_coleta",
    ).filter(coletor=request.ecosmart_user)

    return JsonResponse(
        [serialize_descarte(descarte)
         for descarte in descartes.order_by("-updated_at")],
        safe=False,
    )


@csrf_exempt
@require_auth(["UP", "UA"])
def api_atualizar_status_coleta(request, descarte_id):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    try:
        descarte = Descarte.objects.select_related(
            "usuario",
            "tipo_residuo",
            "coletor",
            "instituicao_coletora",
            "pedido_coleta",
        ).get(id=descarte_id)
    except Descarte.DoesNotExist:
        return JsonResponse({"error": "Descarte não encontrado"}, status=404)

    if request.ecosmart_user.perfil != "UA" and descarte.coletor_id != request.ecosmart_user.id:
        return JsonResponse({"error": "Permissão insuficiente"}, status=403)

    if not descarte.coletor_id:
        return JsonResponse({"error": "Este descarte ainda não foi coletado"}, status=400)

    data = json.loads(request.body or "{}")
    novo_status = data.get("status")
    transicoes = {
        "coletado": {"em_transito"},
        "em_transito": {"processado"},
    }

    if novo_status not in transicoes.get(descarte.status, set()):
        return JsonResponse({
            "error": f"Transição inválida de {descarte.status} para {novo_status}"
        }, status=400)

    descarte.status = novo_status
    descarte.save(update_fields=["status", "updated_at"])
    sync_pedido_status_from_descarte(descarte)

    return JsonResponse(serialize_descarte(descarte), status=200)


@csrf_exempt
@require_auth(["UE", "UA"])
def api_descartes_empresa(request):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    if request.ecosmart_user.perfil == "UA":
        descartes = Descarte.objects.select_related(
            "usuario",
            "tipo_residuo",
            "coletor",
            "instituicao_coletora",
            "pedido_coleta",
        ).exclude(instituicao_coletora__isnull=True)
    else:
        instituicoes = get_active_instituicoes(request.ecosmart_user)
        instituicao_ids = [instituicao.id for instituicao in instituicoes]

        if not instituicao_ids:
            return JsonResponse([], safe=False)

        descartes = Descarte.objects.select_related(
            "usuario",
            "tipo_residuo",
            "coletor",
            "instituicao_coletora",
            "pedido_coleta",
        ).filter(instituicao_coletora_id__in=instituicao_ids)

    return JsonResponse(
        [serialize_descarte(descarte) for descarte in descartes.order_by(
            "-data_coleta", "-created_at")],
        safe=False,
    )


@csrf_exempt
@require_auth(["UE", "UA"])
def api_workspace(request):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    instituicao = get_workspace_instituicao(request.ecosmart_user)

    if not instituicao:
        return JsonResponse({
            "workspace": None,
            "membros": [],
            "usuarios_disponiveis": [],
        })

    vinculos = UsuarioInstituicao.objects.select_related("usuario", "instituicao").filter(
        instituicao=instituicao,
    ).order_by("-vinculo_ativo", "usuario__nome")
    usuarios_vinculados_ativos = vinculos.filter(
        vinculo_ativo=True).values_list("usuario_id", flat=True)
    usuarios_disponiveis = Usuario.objects.filter(
        perfil__in=["UC", "UP"],
        status=True,
    ).exclude(id__in=usuarios_vinculados_ativos).order_by("nome")

    return JsonResponse({
        "workspace": serialize_instituicao(instituicao),
        "membros": [serialize_vinculo(vinculo) for vinculo in vinculos],
        "usuarios_disponiveis": [serialize_user(usuario) for usuario in usuarios_disponiveis],
    })


@csrf_exempt
@require_auth(["UE", "UA"])
def api_workspace_vinculos(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    instituicao = get_workspace_instituicao(request.ecosmart_user)

    if not instituicao:
        return JsonResponse({"error": "Workspace empresarial não localizado"}, status=404)

    try:
        data = json.loads(request.body or "{}")
        usuario_id = data.get("usuario_id")
        email = data.get("email")

        if usuario_id:
            usuario = Usuario.objects.filter(
                id=usuario_id, status=True).first()
        elif email:
            usuario = Usuario.objects.filter(email=email, status=True).first()
        else:
            return JsonResponse({"error": "Informe usuario_id ou email"}, status=400)

        if not usuario:
            return JsonResponse({"error": "Usuário não encontrado"}, status=404)

        if usuario.perfil == "UA":
            return JsonResponse({"error": "Administradores não podem ser vinculados ao workspace"}, status=400)

        vinculo, created = UsuarioInstituicao.objects.get_or_create(
            usuario=usuario,
            instituicao=instituicao,
            defaults={"vinculo_ativo": True},
        )

        if not vinculo.vinculo_ativo:
            vinculo.vinculo_ativo = True
            vinculo.save(update_fields=["vinculo_ativo", "updated_at"])

        return JsonResponse(serialize_vinculo(vinculo), status=201 if created else 200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_auth(["UE", "UA"])
def api_workspace_vinculo_detalhe(request, vinculo_id):
    instituicao = get_workspace_instituicao(request.ecosmart_user)

    try:
        vinculo = UsuarioInstituicao.objects.select_related("usuario", "instituicao").get(
            id=vinculo_id,
            instituicao=instituicao,
        )
    except UsuarioInstituicao.DoesNotExist:
        return JsonResponse({"error": "Vínculo não encontrado"}, status=404)

    if request.method == "GET":
        return JsonResponse(serialize_vinculo(vinculo), status=200)

    if request.method in {"PUT", "PATCH"}:
        data = json.loads(request.body or "{}")
        status_vinculo = data.get("status_vinculo")

        if status_vinculo:
            vinculo.vinculo_ativo = status_vinculo == "ativo"
            vinculo.save(update_fields=["vinculo_ativo", "updated_at"])

        return JsonResponse(serialize_vinculo(vinculo), status=200)

    if request.method == "DELETE":
        if vinculo.usuario_id == request.ecosmart_user.id and request.ecosmart_user.perfil != "UA":
            return JsonResponse({"error": "A empresa não pode remover o próprio vínculo"}, status=400)

        vinculo.vinculo_ativo = False
        vinculo.save(update_fields=["vinculo_ativo", "updated_at"])
        return JsonResponse(serialize_vinculo(vinculo), status=200)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
@require_auth()
def api_pedidos_coleta(request):
    if request.method == "GET":
        pedidos = PedidoColeta.objects.select_related(
            "usuario", "tipo_residuo", "instituicao")

        if request.ecosmart_user.perfil == "UE":
            instituicao_ids = [instituicao.id for instituicao in get_active_instituicoes(
                request.ecosmart_user)]
            pedidos = pedidos.filter(
                instituicao_id__in=instituicao_ids) if instituicao_ids else pedidos.none()
        elif request.ecosmart_user.perfil != "UA":
            pedidos = pedidos.filter(usuario=request.ecosmart_user)

        return JsonResponse(
            [serialize_pedido_coleta(pedido)
             for pedido in pedidos.order_by("-created_at")],
            safe=False,
        )

    if request.method == "POST":
        if request.ecosmart_user.perfil == "UA":
            return JsonResponse({"error": "Administradores não solicitam coleta"}, status=403)

        try:
            data = json.loads(request.body or "{}")
            materiais = data.get("materiais") or []

            if isinstance(materiais, str):
                materiais = [materiais]

            if not materiais:
                return JsonResponse({"error": "Informe ao menos um material"}, status=400)

            endereco = data.get("endereco") or request.ecosmart_user.endereco

            if not endereco:
                return JsonResponse({"error": "Informe o endereço de coleta"}, status=400)

            quantidade, unidade = parse_quantidade_estimada(
                data.get("quantidade_estimada"))
            tipo_residuo, _ = TipoResiduo.objects.get_or_create(
                nome=materiais[0])
            instituicoes = get_active_instituicoes(request.ecosmart_user)

            with transaction.atomic():
                pedido = PedidoColeta.objects.create(
                    usuario=request.ecosmart_user,
                    instituicao=instituicoes[0] if instituicoes else None,
                    tipo_residuo=tipo_residuo,
                    quantidade=quantidade,
                    unidade_medida=unidade,
                    endereco_coleta=endereco,
                    data_preferencial=data.get(
                        "data_preferencial") or date.today(),
                    observacoes=data.get("observacao", ""),
                    status="solicitado",
                )
                Descarte.objects.create(
                    usuario=request.ecosmart_user,
                    tipo_residuo=tipo_residuo,
                    pedido_coleta=pedido,
                    quantidade=quantidade,
                    unidade_medida=unidade,
                    data_descarte=pedido.data_preferencial,
                    local_descarte=endereco,
                    observacoes=pedido.observacoes,
                    status="registrado",
                )

            return JsonResponse(serialize_pedido_coleta(pedido), status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
@require_auth()
def api_historico_descartes(request):
    if request.method == "GET":
        usuario_logado_id = request.ecosmart_user.id if request.ecosmart_user else None
        
        perfil_logado = getattr(request.ecosmart_user, "perfil", None) 

        usuario_alvo_id = request.GET.get("usuario_id")

        if not usuario_alvo_id:
            return JsonResponse({"error": "ID do usuário não fornecido"}, status=400)

        if perfil_logado != "UA" and str(usuario_logado_id) != str(usuario_alvo_id):
            return JsonResponse({
                "error": "Acesso negado. Você não tem permissão para visualizar o histórico de outro usuário."
            }, status=403)

        descartes = (
            Descarte.objects.select_related(
                "usuario",
                "tipo_residuo",
                "coletor",
                "instituicao_coletora",
                "pedido_coleta",
            )
            .filter(usuario_id=usuario_alvo_id)
            .order_by("-data_descarte")
        )

        return JsonResponse([serialize_descarte(descarte) for descarte in descartes], safe=False)

    return JsonResponse({"error": "Método não permitido"}, status=405)
