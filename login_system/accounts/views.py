from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import get_user_model
from decimal import Decimal, InvalidOperation

User = get_user_model()

def safe_decimal(value):
    """Función auxiliar para manejar conversiones seguras a Decimal"""
    if value is None:
        return Decimal('0.00')
    try:
        return Decimal(str(value)).quantize(Decimal('0.01'))
    except (InvalidOperation, TypeError):
        return Decimal('0.00')

def login_view(request):
    """Vista principal de inicio de sesión"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password') 
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            user.last_login = timezone.now()
            user.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Usuario o contraseña incorrectos'
            })
    
    return render(request, 'accounts/login.html')

@ensure_csrf_cookie
@login_required
def dashboard(request):
    """Vista principal del dashboard con permisos del usuario"""
    user = request.user
    
    # Crear el nombre completo del usuario
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
    
    # Determinar el rol con prioridad
    rol = 'Empleado'
    if user.is_superuser or user.groups.filter(name__in=['Administrador', 'Admin']).exists():
        rol = 'Administrador'
    elif user.groups.filter(name='Gerente').exists():
        rol = 'Gerente'
        
    # Obtener sucursales asignadas
    sucursales = []
    if rol != 'Administrador':
        sucursales = list(user.sucursales.values('id', 'nombre'))
    else:
        # Admins ven todas las sucursales
        from .models import Sucursal
        sucursales = list(Sucursal.objects.values('id', 'nombre'))
        
    # Permisos explícitos
    is_admin = user.is_superuser or user.groups.filter(name__in=['Administrador', 'Admin']).exists()
    is_gerente = user.groups.filter(name='Gerente').exists() or is_admin
        
    # Contexto con permisos exactos
    context = {
        'user_full_name': full_name,
        'rol': rol,
        'permisos': {
            'admin': is_admin,
            'gerente': is_gerente,
            'empleado': True,  # Todos los usuarios logueados son al menos empleados
            'superuser': user.is_superuser,
            'sucursales': sucursales
        }
    }
    
    return render(request, 'accounts/dashboard.html', context)