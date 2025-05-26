from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Verifica si es superuser o pertenece al grupo Administrador/Admin
        is_admin = request.user.is_superuser or \
                  (hasattr(request.user, 'is_admin') and request.user.is_admin) or \
                  request.user.groups.filter(name__in=['Administrador', 'Admin']).exists()
                  
        if request.user.is_authenticated and is_admin:
            return view_func(request, *args, **kwargs)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': 'Se requieren permisos de administrador para esta acción'
            }, status=403)
        
        return redirect('dashboard')
    
    return _wrapped_view

def gerente_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated and (request.user.is_superuser or request.user.is_admin or request.user.is_gerente):
            return view_func(request, *args, **kwargs)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': 'Se requieren permisos de gerente para esta acción'
            }, status=403)
        
        return redirect('dashboard')
    
    return _wrapped_view

def sucursal_permission_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Administradores tienen acceso a todo
        if request.user.is_admin or request.user.is_superuser:
            return view_func(request, *args, **kwargs)
            
        # Verificar la sucursal del parámetro
        sucursal_id = kwargs.get('sucursal_id') or kwargs.get('id')
        if not sucursal_id or not request.user.sucursales.filter(id=sucursal_id).exists():
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error', 
                    'message': 'No tienes permiso para acceder a esta sucursal'
                }, status=403)
            return redirect('dashboard')
            
        return view_func(request, *args, **kwargs)
    
    return _wrapped_view

def gerente_or_admin_required(view_func):
    """Decorator that verifies if the user is gerente, admin or superuser"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.is_admin or 
            request.user.groups.filter(name__in=['Administrador', 'Admin']).exists() or
            request.user.is_gerente or 
            request.user.groups.filter(name='Gerente').exists()
        ):
            return view_func(request, *args, **kwargs)
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': 'Se requieren permisos de gerente o administrador para esta acción'
            }, status=403)
        
        return redirect('dashboard')
    
    return _wrapped_view