from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('sucursales/', views.sucursales_crud, name='sucursales_crud'),   
    path('sucursales/<int:id>/', views.sucursal_detail, name='sucursal_detail'),
    path('sucursales/<int:id>/horarios/', views.sucursal_horarios, name='sucursal_horarios'),
    
    path('usuarios/', views.usuarios_crud, name='usuarios_crud'),
    path('usuarios/<int:id>/', views.usuario_detail, name='usuario_detail'),

    path('api/notifications/', views.notifications_api, name='notifications_api'),
    path('api/notifications/mark-read/', views.mark_notifications_read, name='mark_notifications_read'),
    
    path('insumos/', views.insumos_crud, name='insumos_crud'),
    path('categorias/', views.categorias_crud, name='categorias_crud'),
    path('proveedores/', views.proveedores_crud, name='proveedores_crud'),

    path('api/proveedores/', views.proveedores_crud, name='api_proveedores_crud'),
    path('api/proveedores/<int:id>/productos/', views.proveedor_productos, name='proveedor_productos'),
    
    # Añadir esta URL para manejar la asignación de insumos
    path('api/proveedores/<int:id>/asignar-insumos/', views.asignar_insumos_proveedor, name='asignar_insumos_proveedor'),

    # Añadir estas rutas a urlpatterns
    path('insumos-compuestos/', views.insumos_compuestos_crud, name='insumos_compuestos_crud'),
    path('insumos-para-compuesto/', views.obtener_insumos_para_compuesto, name='obtener_insumos_para_compuesto'),

    # Añadir esta nueva ruta para el detalle de insumos compuestos
    path('insumos-compuestos/<int:id>/', views.insumo_compuesto_detail, name='insumo_compuesto_detail'),

    # URLs para recetas
    path('recetas/', views.recetas_crud, name='recetas_crud'),
    path('recetas/<int:id>/', views.receta_detail, name='receta_detail'),
    path('insumos-para-receta/', views.obtener_insumos_para_receta, name='obtener_insumos_para_receta'),
    path('insumos-compuestos-para-receta/', views.obtener_insumos_compuestos_para_receta, name='obtener_insumos_compuestos_para_receta'),

    # Añadir esta nueva ruta para detalles de un insumo específico
    path('insumos/<int:id>/', views.insumo_detail, name='insumo_detail'),
]