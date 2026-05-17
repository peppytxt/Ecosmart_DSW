from functools import wraps

from django.core import signing
from django.http import JsonResponse

from .models import Usuario


AUTH_TOKEN_SALT = "ecosmart.auth"
AUTH_TOKEN_MAX_AGE = 60 * 60 * 12

PERFIL_REGRAS = {
    "UC": [
        "Registrar e consultar os próprios descartes",
        "Criar e acompanhar pedidos de coleta",
        "Editar o próprio perfil",
    ],
    "UP": [
        "Acessar recursos de UC",
        "Ver descartes disponíveis para coleta",
        "Coletar, colocar em trânsito e finalizar coletas próprias",
    ],
    "UE": [
        "Consultar descartes vinculados à instituição",
        "Gerenciar workspace empresarial e vínculos de usuários",
    ],
    "UA": [
        "Acessar métricas administrativas",
        "Gerenciar usuários e conteúdos",
        "Acessar rotas administrativas e de supervisão",
    ],
}


def create_auth_token(usuario):
    return signing.dumps(
        {"id": usuario.id, "perfil": usuario.perfil},
        salt=AUTH_TOKEN_SALT,
    )


def get_authenticated_user(request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.removeprefix("Bearer ").strip()

    try:
        payload = signing.loads(token, salt=AUTH_TOKEN_SALT, max_age=AUTH_TOKEN_MAX_AGE)
    except (signing.BadSignature, signing.SignatureExpired):
        return None

    return Usuario.objects.filter(
        id=payload.get("id"),
        perfil=payload.get("perfil"),
        status=True,
    ).first()


class EcoSmartAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.ecosmart_user = get_authenticated_user(request)
        return self.get_response(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        if not getattr(view_func, "ecosmart_auth_required", False):
            return None

        usuario = getattr(request, "ecosmart_user", None)

        if not usuario:
            return JsonResponse({"error": "Autenticação necessária"}, status=401)

        allowed_profiles = getattr(view_func, "ecosmart_allowed_profiles", ())

        if allowed_profiles and usuario.perfil not in allowed_profiles:
            return JsonResponse({"error": "Permissão insuficiente"}, status=403)

        return None


def require_auth(profiles=None):
    allowed_profiles = tuple(profiles or ())

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            usuario = getattr(request, "ecosmart_user", None) or get_authenticated_user(request)

            if not usuario:
                return JsonResponse({"error": "Autenticação necessária"}, status=401)

            if allowed_profiles and usuario.perfil not in allowed_profiles:
                return JsonResponse({"error": "Permissão insuficiente"}, status=403)

            request.ecosmart_user = usuario
            return view_func(request, *args, **kwargs)

        wrapper.ecosmart_auth_required = True
        wrapper.ecosmart_allowed_profiles = allowed_profiles
        return wrapper

    return decorator
