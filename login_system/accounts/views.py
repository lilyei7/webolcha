from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from .models import Sucursal, HorarioSucursal, Insumo, Categoria, Proveedor, InsumoProveedor  # Added InsumoProveedor here
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
User = get_user_model()
import json
from decimal import Decimal, InvalidOperation
from django.db.models import Q

def safe_decimal(value):
    if value is None:
        return Decimal('0.00')
    try:
        return Decimal(str(value)).quantize(Decimal('0.01'))
    except (InvalidOperation, TypeError):
        return Decimal('0.00')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password') 
        
        # Validación simple para admin
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

@ensure_csrf_cookie  # Add this decorator
@login_required
def dashboard(request):
    return render(request, 'accounts/dashboard.html')

@csrf_exempt
def sucursales_crud(request):
    if request.method == 'GET':
        sucursales = []
        for s in Sucursal.objects.prefetch_related('horarios').all():
            # Manejar meta_diaria de forma segura
            try:
                meta_diaria = float(s.meta_diaria) if s.meta_diaria else 0.00
            except (TypeError, InvalidOperation):
                meta_diaria = 0.00

            horarios = {}
            for horario in s.horarios.all():
                horarios[horario.dia.lower()] = {
                    'apertura': horario.hora_apertura.strftime('%H:%M') if horario.hora_apertura else '',
                    'cierre': horario.hora_cierre.strftime('%H:%M') if horario.hora_cierre else '',
                    'esta_abierto': horario.esta_abierto
                }

            sucursales.append({
                'id': s.id,
                'nombre': s.nombre,
                'codigo_interno': s.codigo_interno,
                'direccion': s.direccion,
                'ciudad_estado': s.ciudad_estado,
                'locacion': s.locacion,
                'telefono': s.telefono,
                'zona_horaria': s.zona_horaria,
                'gerente': s.gerente,
                'entrega_domicilio': bool(s.entrega_domicilio),
                'numero_mesas': s.numero_mesas,
                'capacidad_comensales': s.capacidad_comensales,
                'meta_diaria': meta_diaria,
                'activa': s.activa,
                'horarios': horarios
            })
        return JsonResponse({'status': 'success', 'sucursales': sucursales})
        
    elif request.method == 'POST' or request.method == 'PUT':
        try:
            data = json.loads(request.body)
            horarios_data = data.pop('horarios', {})
            
            # Asegurar que meta_diaria sea un Decimal válido
            data['meta_diaria'] = safe_decimal(data.get('meta_diaria', 0))
            
            if request.method == 'PUT':
                sucursal = Sucursal.objects.get(id=data['id'])
                for key, value in data.items():
                    if hasattr(sucursal, key):
                        setattr(sucursal, key, value)
                sucursal.save()
            else:
                sucursal = Sucursal.objects.create(**data)

            # Guardar horarios
            for dia, horario in horarios_data.items():
                hora_apertura = horario.get('apertura') if horario.get('esta_abierto') else None
                hora_cierre = horario.get('cierre') if horario.get('esta_abierto') else None
                
                HorarioSucursal.objects.update_or_create(
                    sucursal=sucursal,
                    dia=dia.capitalize(),
                    defaults={
                        'hora_apertura': hora_apertura,
                        'hora_cierre': hora_cierre,
                        'esta_abierto': horario.get('esta_abierto', True)
                    }
                )

            return JsonResponse({
                'status': 'success',
                'message': 'Sucursal guardada exitosamente'
            })
            
        except Exception as e:
            print(f"Error: {str(e)}")  # Para debugging
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    
    elif request.method == 'DELETE':
        data = json.loads(request.body)
        try:
            sucursal = Sucursal.objects.get(id=data['id'])
            sucursal.delete()
            return JsonResponse({'status': 'success', 'message': 'Sucursal eliminada'})
        except Sucursal.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Sucursal no encontrada'})

@csrf_exempt
def sucursal_detail(request, id):
    try:
        sucursal = Sucursal.objects.prefetch_related('horarios').get(id=id)
        
        # Obtener horarios
        horarios = {}
        for horario in sucursal.horarios.all():
            horarios[horario.dia.lower()] = {
                'apertura': horario.hora_apertura.strftime('%H:%M') if horario.hora_apertura else '',
                'cierre': horario.hora_cierre.strftime('%H:%M') if horario.hora_cierre else '',
                'esta_abierto': horario.esta_abierto
            }

        return JsonResponse({
            'status': 'success',
            'sucursal': {
                'id': sucursal.id,
                'nombre': sucursal.nombre,
                'codigo_interno': sucursal.codigo_interno,
                'direccion': sucursal.direccion,
                'ciudad_estado': sucursal.ciudad_estado,
                'locacion': sucursal.locacion,
                'telefono': sucursal.telefono,
                'zona_horaria': sucursal.zona_horaria,
                'gerente': sucursal.gerente,
                'entrega_domicilio': sucursal.entrega_domicilio,
                'numero_mesas': sucursal.numero_mesas,
                'capacidad_comensales': sucursal.capacidad_comensales,
                'meta_diaria': float(sucursal.meta_diaria or 0),
                'activa': sucursal.activa,
                'horarios': horarios
            }
        })
    except Sucursal.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Sucursal no encontrada'
        }, status=404)
    except Exception as e:
        print(f"Error detallado: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error al procesar la solicitud: {str(e)}'
        }, status=500)

@csrf_exempt
def sucursal_horarios(request, id):
    try:
        sucursal = Sucursal.objects.get(id=id)
        
        if request.method == 'GET':
            horarios = {}
            for horario in sucursal.horarios.all():
                horarios[horario.dia] = {
                    'apertura': horario.hora_apertura.strftime('%H:%M') if horario.hora_apertura else '',
                    'cierre': horario.hora_cierre.strftime('%H:%M') if horario.hora_cierre else '',
                    'esta_abierto': horario.esta_abierto
                }
            return JsonResponse({'status': 'success', 'horarios': horarios})
            
        elif request.method == 'PUT':
            data = json.loads(request.body)
            horarios = data.get('horarios', {})
            
            for dia, horario in horarios.items():
                HorarioSucursal.objects.update_or_create(
                    sucursal=sucursal,
                    dia=dia.capitalize(),
                    defaults={
                        'hora_apertura': horario['apertura'] or None,
                        'hora_cierre': horario['cierre'] or None,
                        'esta_abierto': horario['esta_abierto']
                    }
                )
            
            return JsonResponse({'status': 'success', 'message': 'Horarios actualizados'})
            
    except Sucursal.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Sucursal no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
@csrf_exempt
def usuarios_crud(request):
    if request.method == 'GET':
        try:
            usuarios = []
            for user in User.objects.all():
                rol = user.groups.first().name if user.groups.exists() else 'empleado'
                usuarios.append({
                    'id': user.id,
                    'nombre': f"{user.first_name} {user.last_name}".strip(),
                    'username': user.username,
                    'email': user.email,
                    'rol': rol,
                    'activo': user.is_active,
                    'telefono': getattr(user, 'telefono', ''),
                    'sucursal': 'Principal'
                })
            return JsonResponse({'status': 'success', 'usuarios': usuarios})
        except Exception as e:
            print(f"Error al obtener usuarios: {str(e)}")  # Para debugging
            return JsonResponse({
                'status': 'error',
                'message': f'Error al obtener usuarios: {str(e)}'
            }, status=500)
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos requeridos
            required_fields = ['username', 'email', 'password', 'nombre']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({
                        'status': 'error',
                        'message': f'El campo {field} es requerido'
                    }, status=400)
            
            # Validar que el username no exista
            if User.objects.filter(username=data['username']).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'El nombre de usuario ya existe'
                }, status=400)
            
            # Crear usuario
            nombres = data['nombre'].split()
            first_name = nombres[0]
            last_name = ' '.join(nombres[1:]) if len(nombres) > 1 else ''
            
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=first_name,
                last_name=last_name,
                is_active=data.get('activo', True)
            )
            
            # Asignar rol (grupo)
            if data.get('rol'):
                group = Group.objects.get_or_create(name=data['rol'])[0]
                user.groups.add(group)
            
            # Guardar teléfono si existe
            if data.get('telefono'):
                user.telefono = data['telefono']
                user.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Usuario creado exitosamente',
                'usuario': {
                    'id': user.id,
                    'nombre': f"{user.first_name} {user.last_name}".strip(),
                    'username': user.username,
                    'email': user.email,
                    'rol': data.get('rol', 'empleado'),
                    'activo': user.is_active
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error al crear usuario: {str(e)}'
            }, status=400)

@csrf_exempt
def usuario_detail(request, id):
    try:
        user = User.objects.get(id=id)
        if request.method == 'GET':
            return JsonResponse({
                'status': 'success',
                'usuario': {
                    'id': user.id,
                    'nombre': f"{user.first_name} {user.last_name}".strip(),
                    'username': user.username,
                    'email': user.email,
                    'rol': user.groups.first().name if user.groups.exists() else 'empleado',
                    'activo': user.is_active,
                    'telefono': getattr(user, 'telefono', ''),
                    'sucursal': getattr(user, 'sucursal', 'Principal')
                }
            })
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar datos básicos
            nombres = data['nombre'].split()
            user.first_name = nombres[0]
            user.last_name = ' '.join(nombres[1:]) if len(nombres) > 1 else ''
            user.email = data['email']
            user.is_active = data.get('activo', True)
            
            # Actualizar teléfono
            if 'telefono' in data:
                user.telefono = data['telefono']
            
            # Actualizar rol si ha cambiado
            if 'rol' in data:
                user.groups.clear()
                group = Group.objects.get_or_create(name=data['rol'])[0]
                user.groups.add(group)
            
            # Actualizar contraseña si se proporciona una nueva
            if data.get('password'):
                user.set_password(data['password'])
            
            user.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Usuario actualizado exitosamente'
            })
            
        elif request.method == 'DELETE':
            user.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Usuario eliminado exitosamente'
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
def notifications_api(request):
    # Datos de ejemplo - Después los reemplazaremos con datos reales
    notifications = [
        {
            'id': 1,
            'type': 'user_created',
            'title': 'Nuevo Usuario',
            'message': 'Juan Pérez se ha unido al sistema',
            'icon': 'fa-user-plus',
            'created_at': timezone.now(),
            'read': False
        },
        {
            'id': 2,
            'type': 'sucursal_created',
            'title': 'Nueva Sucursal',
            'message': 'Se ha creado la sucursal "Plaza Mayor"',
            'icon': 'fa-building',
            'created_at': timezone.now() - timezone.timedelta(hours=2),
            'read': False
        },
        {
            'id': 3,
            'type': 'system',
            'title': 'Actualización del Sistema',
            'message': 'El sistema se actualizará esta noche a las 3 AM',
            'icon': 'fa-gear',
            'created_at': timezone.now() - timezone.timedelta(days=1),
            'read': False
        },
        {
            'id': 4,
            'type': 'login',
            'title': 'Nuevo Inicio de Sesión',
            'message': 'Se detectó un inicio de sesión desde un nuevo dispositivo',
            'icon': 'fa-shield-alt',
            'created_at': timezone.now() - timezone.timedelta(hours=5),
            'read': True
        },
        {
            'id': 5,
            'type': 'sucursal_updated',
            'title': 'Sucursal Actualizada',
            'message': 'Se actualizaron los horarios de "Centro Comercial"',
            'icon': 'fa-clock',
            'created_at': timezone.now() - timezone.timedelta(hours=8),
            'read': True
        }
    ]

    return JsonResponse({
        'status': 'success',
        'unread_count': len([n for n in notifications if not n['read']]),
        'notifications': notifications
    })

@login_required
@csrf_exempt
def mark_notifications_read(request):
    if request.method == 'POST':
        # Aquí iría la lógica para marcar las notificaciones como leídas
        return JsonResponse({
            'status': 'success',
            'message': 'Notificaciones marcadas como leídas'
        })
    return JsonResponse({'status': 'error'}, status=405)

@login_required
@csrf_exempt
def insumos_crud(request):
    if request.method == 'GET':
        try:
            insumos = []
            for insumo in Insumo.objects.select_related('categoria').prefetch_related('proveedores').all():
                # Get provider information without cost
                proveedores_list = [{
                    'id': rel.proveedor.id,
                    'nombre': rel.proveedor.nombre,
                    'es_principal': rel.es_proveedor_principal
                } for rel in InsumoProveedor.objects.filter(insumo=insumo).select_related('proveedor')]

                insumos.append({
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'unidad': insumo.unidad,
                    'categoria': insumo.categoria.nombre,
                    'tipo': insumo.tipo,
                    'stock': insumo.stock,
                    'minimo': insumo.minimo,
                    'proveedores': proveedores_list
                })
                
            return JsonResponse({'status': 'success', 'insumos': insumos})
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos básicos
            required_fields = ['nombre', 'unidad', 'categoria', 'tipo', 'stock', 'minimo']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'Falta el campo requerido: {field}'
                    }, status=400)
            
            # Obtener la categoría
            try:
                categoria = Categoria.objects.get(nombre=data['categoria'])
            except Categoria.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': f'La categoría {data["categoria"]} no existe'
                }, status=400)
            
            # Crear el insumo sin proveedores primero
            insumo = Insumo.objects.create(
                nombre=data['nombre'],
                unidad=data['unidad'],
                categoria=categoria,
                tipo=data['tipo'],
                stock=data['stock'],
                minimo=data['minimo']
            )
            
            # Si hay datos de proveedores, añadirlos
            if 'proveedores' in data and isinstance(data['proveedores'], list):
                for prov_data in data['proveedores']:
                    if 'id' in prov_data and 'costo_unitario' in prov_data:
                        try:
                            proveedor = Proveedor.objects.get(id=prov_data['id'])
                            InsumoProveedor.objects.create(
                                insumo=insumo,
                                proveedor=proveedor,
                                costo_unitario=prov_data['costo_unitario'],
                                es_proveedor_principal=prov_data.get('es_principal', False)
                            )
                        except Proveedor.DoesNotExist:
                            pass  # Ignorar proveedores que no existen
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo creado correctamente',
                'insumo_id': insumo.id
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    
    # Implementar PUT y DELETE similarmente...

@login_required
@csrf_exempt
def categorias_crud(request):
    if request.method == 'GET':
        try:
            categorias = []
            for categoria in Categoria.objects.all():
                categorias.append({
                    'id': categoria.id,
                    'nombre': categoria.nombre,
                    'descripcion': categoria.descripcion,
                    'icono': categoria.icono,
                    'color_fondo': categoria.color_fondo,
                    'color_icono': categoria.color_icono,
                    'activa': categoria.activa
                })
            return JsonResponse({'status': 'success', 'categorias': categorias})
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            categoria = Categoria.objects.create(
                nombre=data['nombre'],
                descripcion=data.get('descripcion', ''),
                icono=data.get('icono', 'fa-cube'),
                color_fondo=data.get('color_fondo', '#f3f4f6'),
                color_icono=data.get('color_icono', '#374151')
            )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Categoría creada exitosamente',
                'categoria': {
                    'id': categoria.id,
                    'nombre': categoria.nombre,
                    'descripcion': categoria.descripcion,
                    'icono': categoria.icono,
                    'color_fondo': categoria.color_fondo,
                    'color_icono': categoria.color_icono,
                    'activa': categoria.activa,
                    'fecha_creacion': categoria.fecha_creacion.isoformat()
                }
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@login_required
@csrf_exempt
def proveedores_crud(request):
    if request.method == 'GET':
        try:
            proveedores = []
            for proveedor in Proveedor.objects.all():
                proveedores.append({
                    'id': proveedor.id,
                    'nombre': proveedor.nombre,
                    'razon_social': proveedor.razon_social,
                    'rfc': proveedor.rfc,
                    'direccion': proveedor.direccion,
                    'ciudad_estado': proveedor.ciudad_estado,
                    'telefono': proveedor.telefono,
                    'email': proveedor.email,
                    'contacto': proveedor.contacto,
                    'forma_pago_preferida': proveedor.forma_pago_preferida,
                    'dias_credito': proveedor.dias_credito,
                    'categoria': proveedor.categoria,
                    'notas': proveedor.notas,
                    'activo': proveedor.activo
                })
            return JsonResponse({'status': 'success', 'proveedores': proveedores})
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos básicos - solo nombre es requerido, no ID
            if not data.get('nombre'):
                return JsonResponse({
                    'status': 'error',
                    'message': 'El nombre del proveedor es requerido'
                }, status=400)
            
            # Asegurarse de que no estamos intentando usar un ID
            if 'id' in data:
                del data['id']  # Eliminar ID si está presente
                
            proveedor = Proveedor.objects.create(
                nombre=data['nombre'],
                razon_social=data.get('razon_social'),
                rfc=data.get('rfc'),
                direccion=data.get('direccion', ''),
                ciudad_estado=data.get('ciudad_estado', ''),
                telefono=data.get('telefono', ''),
                email=data.get('email', ''),
                contacto=data.get('contacto', ''),
                forma_pago_preferida=data.get('forma_pago_preferida', 'Transferencia'),
                dias_credito=data.get('dias_credito'),
                categoria=data.get('categoria', ''),
                notas=data.get('notas', ''),
                activo=data.get('activo', True)
            )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Proveedor creado exitosamente',
                'proveedor': {
                    'id': proveedor.id,
                    'nombre': proveedor.nombre,
                    'razon_social': proveedor.razon_social,
                    'rfc': proveedor.rfc,
                    'direccion': proveedor.direccion,
                    'ciudad_estado': proveedor.ciudad_estado,
                    'telefono': proveedor.telefono,
                    'email': proveedor.email,
                    'contacto': proveedor.contacto,
                    'forma_pago_preferida': proveedor.forma_pago_preferida,
                    'dias_credito': proveedor.dias_credito,
                    'categoria': proveedor.categoria,
                    'notas': proveedor.notas,
                    'activo': proveedor.activo
                }
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
            
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Validar que el ID está presente para actualizar
            if not data.get('id'):
                return JsonResponse({
                    'status': 'error',
                    'message': 'El ID del proveedor es requerido para actualizar'
                }, status=400)
                
            proveedor = Proveedor.objects.get(id=data['id'])
            
            # Actualizar campos
            proveedor.nombre = data['nombre']
            proveedor.razon_social = data.get('razon_social')
            proveedor.rfc = data.get('rfc')
            proveedor.direccion = data.get('direccion', '')
            proveedor.ciudad_estado = data.get('ciudad_estado', '')
            proveedor.telefono = data.get('telefono', '')
            proveedor.email = data.get('email', '')
            proveedor.contacto = data.get('contacto', '')
            proveedor.forma_pago_preferida = data.get('forma_pago_preferida', 'Transferencia')
            proveedor.dias_credito = data.get('dias_credito')
            proveedor.categoria = data.get('categoria', '')
            proveedor.notas = data.get('notas', '')
            proveedor.activo = data.get('activo', True)
            proveedor.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Proveedor actualizado exitosamente'
            })
        except Proveedor.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Proveedor no encontrado'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
            
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            proveedor = Proveedor.objects.get(id=data['id'])
            proveedor.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Proveedor eliminado exitosamente'
            })
        except Proveedor.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Proveedor no encontrado'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@login_required
def proveedor_productos(request, id):
    try:
        proveedor = Proveedor.objects.get(id=id)
        relaciones = InsumoProveedor.objects.filter(proveedor=proveedor).select_related('insumo')
        
        productos = []
        for rel in relaciones:
            productos.append({
                'id': rel.insumo.id,
                'nombre': rel.insumo.nombre,
                'categoria': rel.insumo.categoria.nombre if rel.insumo.categoria else None,
                'costo_unitario': float(rel.costo_unitario),
                'es_principal': rel.es_proveedor_principal
            })
        
        return JsonResponse({
            'status': 'success',
            'proveedor_nombre': proveedor.nombre,
            'productos': productos
        })
    except Proveedor.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Proveedor no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def asignar_insumos_proveedor(request, id):
    """Asigna insumos a un proveedor"""
    if request.method != 'POST':
        return JsonResponse({
            'status': 'error',
            'message': 'Método no permitido'
        }, status=405)
        
    try:
        # Obtener el proveedor
        proveedor = Proveedor.objects.get(id=id)
        
        # Parsear los datos de la solicitud
        data = json.loads(request.body)
        insumos_ids = data.get('insumos', [])
        
        if not insumos_ids:
            return JsonResponse({
                'status': 'error',
                'message': 'No se proporcionaron insumos para asignar'
            }, status=400)
            
        # Procesar cada insumo
        insumos_asignados = 0
        for insumo_id in insumos_ids:
            try:
                insumo = Insumo.objects.get(id=insumo_id)
                
                # Verificar si ya existe la relación
                rel, created = InsumoProveedor.objects.get_or_create(
                    insumo=insumo,
                    proveedor=proveedor,
                    defaults={
                        'costo_unitario': Decimal('0.00'),  # Costo predeterminado
                        'es_proveedor_principal': False  # No es principal por defecto
                    }
                )
                
                if created:
                    insumos_asignados += 1
                    
            except Insumo.DoesNotExist:
                # Ignorar insumos que no existen
                pass
                
        return JsonResponse({
            'status': 'success',
            'message': f'Se asignaron {insumos_asignados} insumos al proveedor {proveedor.nombre}',
            'insumos_asignados': insumos_asignados
        })
        
    except Proveedor.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Proveedor no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Formato JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)
