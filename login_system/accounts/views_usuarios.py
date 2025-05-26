import json
from django.db import models
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .models import Sucursal

User = get_user_model()

@login_required
@csrf_exempt
def usuarios_crud(request):
    if request.method == 'GET':
        try:
            # Determinar qué usuarios puede ver según el rol
            if request.user.is_superuser or request.user.groups.filter(name__in=['Administrador', 'Admin']).exists():
                # Administradores ven todos los usuarios
                users = User.objects.all()
                print(f"Admin {request.user.username} viendo todos los usuarios")
            elif request.user.groups.filter(name='Gerente').exists():
                # Gerentes ven solo:
                # 1. Su propio perfil
                # 2. Empleados de sus sucursales asignadas
                user_sucursales = request.user.sucursales.all()
                
                # Obtener empleados de las mismas sucursales del gerente
                empleados_sucursales = User.objects.filter(
                    sucursales__in=user_sucursales,
                    groups__name='Empleado'
                ).distinct()
                
                # Combinar: el propio gerente + empleados de sus sucursales
                users = User.objects.filter(
                    models.Q(id=request.user.id) |  # Su propio perfil
                    models.Q(id__in=empleados_sucursales.values_list('id', flat=True))  # Empleados de sus sucursales
                ).distinct()
                
                print(f"Gerente {request.user.username} viendo: su perfil + empleados de sucursales {[s.nombre for s in user_sucursales]}")
            else:
                # Empleados solo ven su propio perfil
                users = User.objects.filter(id=request.user.id)
                print(f"Empleado {request.user.username} viendo solo su perfil")
            
            # Formatear datos de usuarios
            usuarios = []
            for user in users:
                # Obtener rol principal
                rol_principal = 'Empleado'
                if user.is_superuser:
                    rol_principal = 'Administrador'
                elif user.groups.filter(name__in=['Administrador', 'Admin']).exists():
                    rol_principal = 'Administrador'
                elif user.groups.filter(name='Gerente').exists():
                    rol_principal = 'Gerente'
                
                # Obtener sucursales asignadas
                sucursales_nombres = list(user.sucursales.values_list('nombre', flat=True))
                sucursal_principal = sucursales_nombres[0] if sucursales_nombres else None
                
                usuarios.append({
                    'id': user.id,
                    'nombre': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'username': user.username,
                    'email': user.email,
                    'telefono': getattr(user, 'telefono', ''),
                    'rol': rol_principal,
                    'sucursal': sucursal_principal,
                    'activo': user.is_active
                })
            
            return JsonResponse({
                'status': 'success', 
                'usuarios': usuarios
            })
        except Exception as e:
            print(f"Error en usuarios_crud GET: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Verificar permisos para crear usuarios
            if not (request.user.is_superuser or request.user.groups.filter(name__in=['Administrador', 'Admin', 'Gerente']).exists()):
                return JsonResponse({
                    'status': 'error',
                    'message': 'No tienes permisos para crear usuarios'
                }, status=403)
            
            # Para creación de nuevos usuarios
            if 'id' not in data or not data['id']:
                # Validar datos requeridos
                required_fields = ['nombre', 'username', 'email', 'password', 'rol', 'sucursal']
                for field in required_fields:
                    if not data.get(field):
                        return JsonResponse({
                            'status': 'error',
                            'message': f'El campo {field} es requerido'
                        }, status=400)
                
                # Verificar permisos específicos para crear según el rol
                nuevo_rol = data.get('rol', '').lower()
                if request.user.groups.filter(name='Gerente').exists() and nuevo_rol != 'empleado':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Los gerentes solo pueden crear empleados'
                    }, status=403)
                
                # Crear usuario
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    password=data['password'],
                    first_name=data['nombre'].split()[0] if ' ' in data['nombre'] else data['nombre'],
                    last_name=' '.join(data['nombre'].split()[1:]) if ' ' in data['nombre'] else '',
                    is_active=data.get('activo', True)
                )
                
                # Asignar teléfono si está presente
                if 'telefono' in data:
                    user.telefono = data['telefono']
                    user.save()
                
                # Asignar rol
                rol_mapping = {
                    'admin': 'Administrador',
                    'administrador': 'Administrador',
                    'gerente': 'Gerente',
                    'empleado': 'Empleado'
                }
                grupo_nombre = rol_mapping.get(nuevo_rol, 'Empleado')
                group, created = Group.objects.get_or_create(name=grupo_nombre)
                user.groups.add(group)
                
                # Asignar sucursal
                try:
                    sucursal = Sucursal.objects.get(id=data['sucursal'])
                    user.sucursales.add(sucursal)
                except Sucursal.DoesNotExist:
                    user.delete()  # Limpiar usuario creado
                    return JsonResponse({
                        'status': 'error',
                        'message': 'La sucursal seleccionada no existe'
                    }, status=400)
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Usuario creado correctamente',
                    'usuario_id': user.id
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Para actualizar use el endpoint específico'
                }, status=400)
            
        except Exception as e:
            print(f"Error en usuarios_crud POST: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@csrf_exempt
def usuario_detail(request, id):
    try:
        user = User.objects.get(id=id)
        
        # Verificar permisos de acceso antes de cualquier operación
        def can_access_user(requesting_user, target_user):
            # Superusuarios y administradores pueden acceder a cualquier usuario
            if requesting_user.is_superuser or requesting_user.groups.filter(name__in=['Administrador', 'Admin']).exists():
                return True
            
            # Un usuario siempre puede acceder a su propio perfil
            if requesting_user.id == target_user.id:
                return True
            
            # Gerentes pueden acceder solo a empleados de sus sucursales
            if requesting_user.groups.filter(name='Gerente').exists():
                # Solo puede acceder si el target es empleado
                if target_user.groups.filter(name='Empleado').exists():
                    # Y solo si comparten al menos una sucursal
                    requesting_user_sucursales = set(requesting_user.sucursales.values_list('id', flat=True))
                    target_user_sucursales = set(target_user.sucursales.values_list('id', flat=True))
                    return bool(requesting_user_sucursales.intersection(target_user_sucursales))
            
            return False
        
        # Verificar permisos
        if not can_access_user(request.user, user):
            return JsonResponse({
                'status': 'error',
                'message': 'No tienes permisos para acceder a este usuario'
            }, status=403)
        
        if request.method == 'GET':
            # Obtener información de sucursales asignadas
            sucursales_info = []
            if hasattr(user, 'sucursales'):
                sucursales_info = [{
                    'id': s.id,
                    'nombre': s.nombre
                } for s in user.sucursales.all()]
                
            # Obtener ID de la primera sucursal o None si no hay
            sucursal_id = sucursales_info[0]['id'] if sucursales_info else None
            sucursal_nombre = sucursales_info[0]['nombre'] if sucursales_info else ""
            
            # Verificar cómo obtenemos el teléfono
            telefono_value = ''
            if hasattr(user, 'telefono'):
                telefono_value = user.telefono or ''
            
            return JsonResponse({
                'status': 'success',
                'usuario': {
                    'id': user.id,
                    'nombre': f"{user.first_name} {user.last_name}".strip(),
                    'username': user.username,
                    'email': user.email,
                    'rol': user.groups.first().name if user.groups.exists() else 'Empleado',
                    'activo': user.is_active,
                    'telefono': telefono_value,
                    'sucursal': sucursal_nombre,
                    'sucursal_id': sucursal_id,
                    'sucursales': sucursales_info
                }
            })
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Verificar permisos adicionales para edición
            def can_edit_user(requesting_user, target_user, new_role=None):
                # Superusuarios pueden editar cualquier cosa
                if requesting_user.is_superuser:
                    return True
                
                # Administradores pueden editar gerentes y empleados, pero no otros administradores
                if requesting_user.groups.filter(name__in=['Administrador', 'Admin']).exists():
                    if target_user.is_superuser or target_user.groups.filter(name__in=['Administrador', 'Admin']).exists():
                        return False  # No puede editar otros admins
                    return True
                
                # Gerentes pueden editar solo empleados de sus sucursales y su propio perfil
                if requesting_user.groups.filter(name='Gerente').exists():
                    # Puede editar su propio perfil
                    if requesting_user.id == target_user.id:
                        # Pero no puede cambiar su propio rol a algo diferente de gerente
                        if new_role and new_role.lower() not in ['gerente']:
                            return False
                        return True
                    
                    # Solo puede editar empleados de sus sucursales
                    if target_user.groups.filter(name='Empleado').exists():
                        requesting_user_sucursales = set(requesting_user.sucursales.values_list('id', flat=True))
                        target_user_sucursales = set(target_user.sucursales.values_list('id', flat=True))
                        return bool(requesting_user_sucursales.intersection(target_user_sucursales))
                
                return False
            
            # Verificar permisos de edición
            nuevo_rol = data.get('rol', '')
            if not can_edit_user(request.user, user, nuevo_rol):
                return JsonResponse({
                    'status': 'error',
                    'message': 'No tienes permisos para editar este usuario'
                }, status=403)
            
            # Actualizar datos básicos
            user.first_name = data.get('nombre', '').split()[0] if ' ' in data.get('nombre', '') else data.get('nombre', '')
            user.last_name = ' '.join(data.get('nombre', '').split()[1:]) if ' ' in data.get('nombre', '') else ''
            user.username = data.get('username')
            user.email = data.get('email')
            user.telefono = data.get('telefono', '')
            
            # IMPORTANTE: Solo actualizar contraseña si se proporciona una nueva
            password = data.get('password')
            if password and password.strip():
                user.set_password(password)
            
            # Actualizar estado activo
            user.is_active = data.get('activo', True)
            
            # Gestionar rol (grupos)
            rol = data.get('rol', '')
            if rol:
                # Quitar todos los grupos actuales
                user.groups.clear()
                
                # Mapear el rol del frontend al nombre correcto del grupo
                rol_mapping = {
                    'admin': 'Administrador',
                    'administrador': 'Administrador',
                    'gerente': 'Gerente',
                    'empleado': 'Empleado'
                }
                
                # Obtener el nombre correcto del grupo
                grupo_nombre = rol_mapping.get(rol.lower(), 'Empleado')
                
                try:
                    group = Group.objects.get(name=grupo_nombre)
                    user.groups.add(group)
                    print(f"✅ Rol asignado: {grupo_nombre} para usuario {user.username}")
                except Group.DoesNotExist:
                    # Si no existe el grupo, crearlo
                    group = Group.objects.create(name=grupo_nombre)
                    user.groups.add(group)
                    print(f"✅ Grupo creado y asignado: {grupo_nombre} para usuario {user.username}")
            
            # Asignar sucursal
            if 'sucursal' in data and data['sucursal']:
                try:
                    sucursal = Sucursal.objects.get(id=data['sucursal'])
                    user.sucursales.clear()
                    user.sucursales.add(sucursal)
                except Sucursal.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'La sucursal seleccionada no existe'
                    }, status=400)
            
            user.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Usuario actualizado correctamente',
                'usuario': {
                    'id': user.id,
                    'nombre': f"{user.first_name} {user.last_name}".strip(),
                    'username': user.username,
                    'email': user.email,
                    'telefono': user.telefono,
                    'rol': next(iter([g.name for g in user.groups.all()]), 'Empleado'),
                    'sucursal': next(iter([s.id for s in user.sucursales.all()]), None),
                    'activo': user.is_active
                }
            })
            
        elif request.method == 'DELETE':
            # Verificar permisos de eliminación (similar a edición pero más restrictivo)
            if not (request.user.is_superuser or 
                   (request.user.groups.filter(name__in=['Administrador', 'Admin']).exists() and 
                    not user.is_superuser and 
                    not user.groups.filter(name__in=['Administrador', 'Admin']).exists())):
                return JsonResponse({
                    'status': 'error',
                    'message': 'No tienes permisos para eliminar este usuario'
                }, status=403)
            
            user.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Usuario eliminado correctamente'
            })
            
    except User.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@login_required
def obtener_sucursales_para_usuario(request):
    """Devuelve la lista de sucursales para el formulario de usuarios"""
    try:
        # Verificar permisos - los admins ven todas las sucursales
        if request.user.is_superuser or hasattr(request.user, 'is_admin') and request.user.is_admin or request.user.groups.filter(name__in=['Administrador', 'Admin']).exists():
            sucursales = Sucursal.objects.filter(activa=True)
        else:
            # Gerentes solo pueden ver las sucursales a las que están asignados
            sucursales = request.user.sucursales.filter(activa=True)
            
        sucursales_data = [
            {'id': s.id, 'nombre': s.nombre} for s in sucursales
        ]
        
        return JsonResponse({
            'status': 'success',
            'sucursales': sucursales_data
        })
    except Exception as e:
        print(f"Error en obtener_sucursales_para_usuario: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)