from django.core.management.base import BaseCommand
from datetime import date
from ecosmart.models import Usuario, TipoResiduo, Instituicao, UsuarioInstituicao, Descarte, PedidoColeta

class Command(BaseCommand):
    help = "Seed inicial do EcoSmart"

    def handle(self, *args, **kwargs):
        papel, _ = TipoResiduo.objects.get_or_create(
            nome="Papel",
            defaults={"descricao": "Resíduos de papel", "reciclavel": True}
        )
        plastico, _ = TipoResiduo.objects.get_or_create(
            nome="Plástico",
            defaults={"descricao": "Resíduos plásticos", "reciclavel": True}
        )
        metal, _ = TipoResiduo.objects.get_or_create(
            nome="Metal",
            defaults={"descricao": "Resíduos metálicos", "reciclavel": True}
        )

        instituicao, _ = Instituicao.objects.get_or_create(
            cnpj="12.345.678/0001-99",
            defaults={
                "nome": "EcoSmart Cooperativa",
                "tipo": "Cooperativa",
                "email_contato": "contato@ecosmart.com",
                "telefone": "(65) 99999-9999",
            }
        )

        ue, _ = Usuario.objects.get_or_create(
            email="carlos@empresa.com",
            defaults={"nome": "Carlos Empresa", "senha": "carlos123", "perfil": "UE", "status": True}
        )
        up1, _ = Usuario.objects.get_or_create(
            email="ana@email.com",
            defaults={"nome": "Ana Premium", "senha": "ana123", "perfil": "UP", "status": True}
        )
        up2, _ = Usuario.objects.get_or_create(
            email="joao@email.com",
            defaults={"nome": "João Premium", "senha": "joao123", "perfil": "UP", "status": True}
        )
        uc1, _ = Usuario.objects.get_or_create(
            email="maria@email.com",
            defaults={"nome": "Maria Silva", "senha": "maria123", "perfil": "UC", "status": True}
        )
        uc2, _ = Usuario.objects.get_or_create(
            email="pedro@email.com",
            defaults={"nome": "Pedro Santos", "senha": "pedro123", "perfil": "UC", "status": True}
        )
        ua, _ = Usuario.objects.get_or_create(
            email="admin@ecosmart.com",
            defaults={"nome": "Admin Sistema", "senha": "admin123", "perfil": "UA", "status": True}
        )

        UsuarioInstituicao.objects.get_or_create(usuario=ue, instituicao=instituicao)
        UsuarioInstituicao.objects.get_or_create(usuario=up1, instituicao=instituicao)
        UsuarioInstituicao.objects.get_or_create(usuario=uc1, instituicao=instituicao)

        Descarte.objects.get_or_create(
            usuario=uc1,
            tipo_residuo=papel,
            quantidade=5,
            unidade_medida="kg",
            data_descarte=date(2026, 4, 7),
            local_descarte="Residência",
            observacoes="Papelão e jornais",
            status="registrado",
        )

        Descarte.objects.get_or_create(
            usuario=uc2,
            tipo_residuo=plastico,
            quantidade=3,
            unidade_medida="kg",
            data_descarte=date(2026, 4, 8),
            local_descarte="Residência",
            observacoes="Garrafas PET",
            status="coletado",
        )

        Descarte.objects.get_or_create(
            usuario=up1,
            tipo_residuo=metal,
            quantidade=2,
            unidade_medida="kg",
            data_descarte=date(2026, 4, 8),
            local_descarte="Ponto de coleta",
            observacoes="Latas de alumínio",
            status="processado",
        )

        PedidoColeta.objects.get_or_create(
            usuario=ue,
            instituicao=instituicao,
            tipo_residuo=papel,
            quantidade=20,
            unidade_medida="kg",
            endereco_coleta="Rua Central, 1000",
            data_preferencial=date(2026, 4, 10),
            observacoes="Coleta institucional",
            status="solicitado",
        )

        self.stdout.write(self.style.SUCCESS("Seed do EcoSmart executado com sucesso!"))