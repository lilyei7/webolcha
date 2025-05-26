from django.urls import path
from . import views

# Importar las vistas especializadas
from .views_usuarios import usuarios_crud, usuario_detail, obtener_sucursales_para_usuario
from .views_sucursales import sucursales_crud, sucursal_detail, sucursal_horarios
from .views_notifications import notifications_api, mark_notifications_read
from .views_insumos import insumos_crud, insumo_detail
from .views_categorias import categorias_crud
from .views_proveedores import proveedores_crud, proveedor_productos, asignar_insumos_proveedor
from .views_movimientos import movimientos_crud, movimiento_detail, cancelar_movimiento, sucursal_insumos
from .views_compuestos import insumos_compuestos_crud, obtener_insumos_para_compuesto, insumo_compuesto_detail
from .views_recetas import recetas_crud, receta_detail, obtener_insumos_para_receta, obtener_insumos_compuestos_para_receta

urlpatterns = [
    # URLs principales
    path('', views.login_view, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # URLs de sucursales
    path('sucursales/', sucursales_crud, name='sucursales_crud'),   
    path('sucursales/<int:id>/', sucursal_detail, name='sucursal_detail'),
    path('sucursales/<int:id>/horarios/', sucursal_horarios, name='sucursal_horarios'),
    path('api/sucursales/<int:id>/insumos/', sucursal_insumos, name='sucursal_insumos'),
    
    # URLs de usuarios
    path('usuarios/', usuarios_crud, name='usuarios_crud'),
    path('usuarios/<int:id>/', usuario_detail, name='usuario_detail'),
    path('api/sucursales-para-usuario/', obtener_sucursales_para_usuario, name='sucursales_para_usuario'),

    # URLs de notificaciones
    path('api/notifications/', notifications_api, name='notifications_api'),
    path('api/notifications/mark-read/', mark_notifications_read, name='mark_notifications_read'),
    
    # URLs de insumos
    path('insumos/', insumos_crud, name='insumos_crud'),
    path('insumos/<int:id>/', insumo_detail, name='insumo_detail'),
    
    # URLs de categorías
    path('categorias/', categorias_crud, name='categorias_crud'),
    
    # URLs de proveedores
    path('proveedores/', proveedores_crud, name='proveedores_crud'),
    path('api/proveedores/', proveedores_crud, name='api_proveedores_crud'),
    path('api/proveedores/<int:id>/productos/', proveedor_productos, name='proveedor_productos'),
    path('api/proveedores/<int:id>/asignar-insumos/', asignar_insumos_proveedor, name='asignar_insumos_proveedor'),

    # URLs de movimientos
    path('api/movimientos/', movimientos_crud, name='movimientos_crud'),
    path('api/movimientos/<int:id>/', movimiento_detail, name='movimiento_detail'),
    path('api/movimientos/<int:id>/cancelar/', cancelar_movimiento, name='cancelar_movimiento'),

    # URLs de insumos compuestos
    path('insumos-compuestos/', insumos_compuestos_crud, name='insumos_compuestos_crud'),
    path('insumos-compuestos/<int:id>/', insumo_compuesto_detail, name='insumo_compuesto_detail'),
    path('insumos-para-compuesto/', obtener_insumos_para_compuesto, name='obtener_insumos_para_compuesto'),

    # URLs de recetas
    path('recetas/', recetas_crud, name='recetas_crud'),
    path('recetas/<int:id>/', receta_detail, name='receta_detail'),
    path('insumos-para-receta/', obtener_insumos_para_receta, name='obtener_insumos_para_receta'),
    path('insumos-compuestos-para-receta/', obtener_insumos_compuestos_para_receta, name='obtener_insumos_compuestos_para_receta'),
]