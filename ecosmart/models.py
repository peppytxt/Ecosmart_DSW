from django.contrib.auth.hashers import make_password
from django.db import models

class Usuario(models.Model):
    PERFIL_CHOICES = [
        ("UC", "Usuário Comum"),
        ("UP", "Usuário Premium"),
        ("UE", "Usuário Empresarial"),
        ("UA", "Usuário Administrador"),
    ]

    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    endereco = models.CharField(max_length=500, blank=True, null=True)
    perfil = models.CharField(max_length=2, choices=PERFIL_CHOICES)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.senha.startswith("pbkdf2_"):
            self.senha = make_password(self.senha)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.perfil})"


class TipoResiduo(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True, null=True)
    reciclavel = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome


class Instituicao(models.Model):
    nome = models.CharField(max_length=150)
    tipo = models.CharField(max_length=100)
    cnpj = models.CharField(max_length=18, unique=True)
    email_contato = models.EmailField()
    telefone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome


class UsuarioInstituicao(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="vinculos_institucionais")
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE, related_name="usuarios_vinculados")
    vinculo_ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("usuario", "instituicao")


class PontoColeta(models.Model):
    nome = models.CharField(max_length=150)
    categoria = models.CharField(max_length=100)
    endereco = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Descarte(models.Model):
    STATUS_CHOICES = [
        ("registrado", "Registrado"),
       ("em_transito", "Em Trânsito"),
        ("processado", "Processado"),
        ("coletado", "Coletado"),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="descartes")
    tipo_residuo = models.ForeignKey(TipoResiduo, on_delete=models.PROTECT, related_name="descartes")
    coletor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="descartes_coletados",
    )
    instituicao_coletora = models.ForeignKey(
        Instituicao,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="descartes_coletados",
    )
    pedido_coleta = models.ForeignKey(
        "PedidoColeta",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="descartes",
    )
    quantidade = models.DecimalField(max_digits=10, decimal_places=2)
    unidade_medida = models.CharField(max_length=20, default="kg")
    data_descarte = models.DateField()
    local_descarte = models.CharField(max_length=200)
    observacoes = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to="descartes/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="registrado")
    data_coleta = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class PedidoColeta(models.Model):
    STATUS_CHOICES = [
        ("solicitado", "Solicitado"),
        ("em_andamento", "Em andamento"),
        ("concluido", "Concluído"),
        ("cancelado", "Cancelado"),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="pedidos_coleta")
    instituicao = models.ForeignKey(Instituicao, on_delete=models.SET_NULL, blank=True, null=True, related_name="pedidos_coleta")
    tipo_residuo = models.ForeignKey(TipoResiduo, on_delete=models.PROTECT, related_name="pedidos_coleta")
    quantidade = models.DecimalField(max_digits=10, decimal_places=2)
    unidade_medida = models.CharField(max_length=20, default="kg")
    endereco_coleta = models.CharField(max_length=255)
    data_preferencial = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="solicitado")
    observacoes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ConteudoEducativo(models.Model):
    CATEGORIAS = [
        ('Eletrônicos', 'Eletrônicos'),
        ('Químicos', 'Químicos'),
        ('Orgânicos', 'Orgânicos'),
        ('Recicláveis', 'Recicláveis'),
    ]

    nome = models.CharField(max_length=200)
    categoria = models.CharField(max_length=50, choices=CATEGORIAS)
    descricao = models.TextField()
    como_descartar = models.TextField(help_text="Separe os itens por quebra de linha")
    cuidados = models.TextField(blank=True, help_text="Separe os itens por quebra de linha")
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
