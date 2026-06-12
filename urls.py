from django.contrib import admin
from django.urls import include, path
from ecosmart import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', views.api_usuarios, name='api_usuarios'),
    path('api/conteudos/', views.api_conteudos, name='api_conteudos'),
    path('api/signup/', views.api_signup, name='api_signup'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/metrics/', views.api_dashboard_metrics, name='api_metrics'),
    path('api/update-perfil/<int:user_id>/', views.api_update_perfil, name='api_update_perfil'),
    path('api/usuarios/<int:user_id>/', views.api_usuario_detalhe, name='api_usuario_detalhe'),
    path('api/descartes/', views.api_registrar_descarte, name='api_registrar_descarte'),
    path('api/descartes/disponiveis/', views.api_descartes_disponiveis, name='api_descartes_disponiveis'),
    path('api/descartes/minhas-coletas/', views.api_minhas_coletas, name='api_minhas_coletas'),
    path('api/descartes/<int:descarte_id>/coletar/', views.api_coletar_descarte, name='api_coletar_descarte'),
    path('api/descartes/<int:descarte_id>/status/', views.api_atualizar_status_coleta, name='api_atualizar_status_coleta'),
    path('api/empresa/descartes/', views.api_descartes_empresa, name='api_descartes_empresa'),
    path('api/workspace/', views.api_workspace, name='api_workspace'),
    path('api/workspace/vinculos/', views.api_workspace_vinculos, name='api_workspace_vinculos'),
    path('api/workspace/vinculos/<int:vinculo_id>/', views.api_workspace_vinculo_detalhe, name='api_workspace_vinculo_detalhe'),
    path('api/descartes/historico/', views.api_historico_descartes, name='api_historico_descartes'),
    path('api/pedidos-coleta/', views.api_pedidos_coleta, name='api_pedidos_coleta'),
]
