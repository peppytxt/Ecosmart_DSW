from django.contrib import admin
# Importe os modelos do seu projeto (ajuste o nome dos modelos conforme seu arquivo models.py)
from .models import Usuario, Descarte, PedidoColeta 

# Registre cada um deles para aparecer na tela do navegador
admin.site.register(Usuario)
admin.site.register(Descarte)
admin.site.register(PedidoColeta)