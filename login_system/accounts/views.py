from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from .models import Sucursal, HorarioSucursal, Insumo, Categoria, Proveedor, InsumoProveedor, InsumoCompuesto, ComponenteInsumoCompuesto, Receta, InsumoReceta, InsumoCompuestoReceta  # Added InsumoProveedor and InsumoCompuesto here
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
User = get_user_model()
import json
from decimal import Decimal, InvalidOperation

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
    user = request.user
    # Crear el nombre completo del usuario
    full_name = f"{user.first_name} {user.last_name}".strip()
    # Si el nombre está vacío, usar el nombre de usuario
    if not full_name:
        full_name = user.username
    
    context = {
        'user_full_name': full_name
    }
    return render(request, 'accounts/dashboard.html', context)

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
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Validar que existe un ID
            if 'id' not in data:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Se requiere ID para actualizar un insumo'
                }, status=400)
            
            # Obtener y actualizar el insumo
            insumo = Insumo.objects.get(id=data['id'])
            
            # Actualizar datos básicos
            insumo.nombre = data.get('nombre', insumo.nombre)
            insumo.unidad = data.get('unidad', insumo.unidad)
            
            # Actualizar categoría si se proporciona
            if 'categoria' in data:
                try:
                    categoria = Categoria.objects.get(nombre=data['categoria'])
                    insumo.categoria = categoria
                except Categoria.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'La categoría {data["categoria"]} no existe'
                    }, status=400)
            
            insumo.tipo = data.get('tipo', insumo.tipo)
            insumo.stock = data.get('stock', insumo.stock)
            insumo.minimo = data.get('minimo', insumo.minimo)
            
            insumo.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo actualizado correctamente',
                'insumo': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'unidad': insumo.unidad,
                    'categoria': insumo.categoria.nombre,
                    'tipo': insumo.tipo,
                    'stock': insumo.stock,
                    'minimo': insumo.minimo
                }
            })
            
        except Insumo.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Insumo no encontrado'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    
    # Implementar DELETE similarmente...

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
        productos = InsumoProveedor.objects.filter(proveedor=proveedor)
        
        return JsonResponse({
            'status': 'success',
            'proveedor_nombre': proveedor.nombre,
            'productos': [
                {
                    'id': p.id,
                    'insumo_id': p.insumo.id,
                    'nombre': p.insumo.nombre,
                    'categoria': p.insumo.categoria.nombre if p.insumo.categoria else None,
                    'unidad': p.insumo.unidad,
                    'costo_unitario': float(p.costo_unitario) if p.costo_unitario else 0,
                    'es_principal': p.es_proveedor_principal
                } for p in productos
            ]
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
    """Asigna insumos a un proveedor con costos unitarios"""
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
        insumos_data = data.get('insumos', [])
        
        if not insumos_data:
            return JsonResponse({
                'status': 'error',
                'message': 'No se proporcionaron insumos para asignar'
            }, status=400)
            
        # Procesar cada insumo
        insumos_asignados = 0
        for insumo_info in insumos_data:
            try:
                insumo_id = insumo_info.get('id')
                costo = Decimal(str(insumo_info.get('costo', '0')))
                insumo = Insumo.objects.get(id=insumo_id)
                
                # Verificar si ya existe la relación
                rel, created = InsumoProveedor.objects.get_or_create(
                    insumo=insumo,
                    proveedor=proveedor,
                    defaults={
                        'costo_unitario': costo,
                        'es_proveedor_principal': False  # No es principal por defecto
                    }
                )
                
                # Si la relación ya existía, actualizar el costo
                if not created:
                    rel.costo_unitario = costo
                    rel.save()
                    
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
    except InvalidOperation:
        return JsonResponse({
            'status': 'error',
            'message': 'Valor de costo inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def insumos_compuestos_crud(request):
    if request.method == 'GET':
        try:
            insumos_compuestos = []
            for ic in InsumoCompuesto.objects.prefetch_related('componentes__insumo').all():
                insumos_compuestos.append({
                    'id': ic.id,
                    'nombre': ic.nombre,
                    'categoria': ic.categoria,
                    'unidad': ic.unidad,
                    'cantidad': float(ic.cantidad),
                    'costo': float(ic.costo_total),
                    'descripcion': ic.descripcion,
                    'componentes': [
                        {
                            'insumo': c.insumo.nombre,
                            'unidad': c.insumo.unidad,
                            'cantidad': float(c.cantidad),
                            'costo': float(c.costo)
                        } for c in ic.componentes.all()
                    ]
                })
            return JsonResponse({'status': 'success', 'insumos_compuestos': insumos_compuestos})
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validaciones básicas
            if not data.get('nombre'):
                return JsonResponse({
                    'status': 'error', 
                    'message': 'El nombre es requerido'
                }, status=400)
                
            if not data.get('componentes') or not isinstance(data['componentes'], list):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Se requieren componentes'
                }, status=400)
                
            # Crear insumo compuesto
            insumo_compuesto = InsumoCompuesto.objects.create(
                nombre=data['nombre'],
                categoria=data['categoria'],
                unidad=data['unidad'],
                cantidad=data['cantidad'],
                costo_total=data['costo_total'],
                descripcion=data.get('descripcion', '')
            )
            
            # Crear componentes
            for comp_data in data['componentes']:
                insumo = Insumo.objects.get(id=comp_data['insumo_id'])
                ComponenteInsumoCompuesto.objects.create(
                    insumo_compuesto=insumo_compuesto,
                    insumo=insumo,
                    cantidad=comp_data['cantidad'],
                    costo=comp_data['costo']
                )
                
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo compuesto creado exitosamente',
                'id': insumo_compuesto.id
            })
            
        except Insumo.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Uno o más insumos no existen'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@login_required
def obtener_insumos_para_compuesto(request):
    """Devuelve la lista de insumos disponibles para crear compuestos"""
    try:
        insumos = []
        for insumo in Insumo.objects.all():
            insumos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                # Calculamos un costo estimado a partir del costo de proveedores
                'costo_estimado': float(InsumoProveedor.objects.filter(
                    insumo=insumo, 
                    es_proveedor_principal=True
                ).first().costo_unitario if InsumoProveedor.objects.filter(
                    insumo=insumo, 
                    es_proveedor_principal=True
                ).exists() else 0)
            })
            
        return JsonResponse({
            'status': 'success',
            'insumos': insumos
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt  # Asegurar que este decorador esté presente
def insumo_compuesto_detail(request, id):
    """Vista para obtener, actualizar o eliminar un insumo compuesto específico"""
    try:
        insumo = InsumoCompuesto.objects.prefetch_related('componentes__insumo').get(id=id)
        
        if request.method == 'GET':
            return JsonResponse({
                'status': 'success',
                'insumo_compuesto': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'categoria': insumo.categoria,
                    'unidad': insumo.unidad,
                    'cantidad': float(insumo.cantidad),
                    'costo': float(insumo.costo_total),
                    'descripcion': insumo.descripcion,
                    'componentes': [
                        {
                            'insumo': c.insumo.nombre,
                            'insumo_id': c.insumo.id,
                            'unidad': c.insumo.unidad,
                            'cantidad': float(c.cantidad),
                            'costo': float(c.costo)
                        } for c in insumo.componentes.all()
                    ]
                }
            })
        elif request.method == 'PUT':
            # Procesar actualización del insumo compuesto
            data = json.loads(request.body)
            
            # Actualizar campos básicos
            insumo.nombre = data['nombre']
            insumo.categoria = data['categoria']
            insumo.unidad = data['unidad']
            insumo.cantidad = data['cantidad']
            insumo.costo_total = data['costo_total']
            insumo.descripcion = data.get('descripcion', '')
            insumo.save()
            
            # Eliminar todos los componentes existentes
            insumo.componentes.all().delete()
            
            # Crear nuevos componentes
            for comp_data in data['componentes']:
                try:
                    comp_insumo = Insumo.objects.get(id=comp_data['insumo_id'])
                    ComponenteInsumoCompuesto.objects.create(
                        insumo_compuesto=insumo,
                        insumo=comp_insumo,
                        cantidad=comp_data['cantidad'],
                        costo=comp_data['costo']
                    )
                except Insumo.DoesNotExist:
                    # Ignorar componentes con insumos que no existen
                    pass
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo compuesto actualizado correctamente'
            })
            
        elif request.method == 'DELETE':
            insumo.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo compuesto eliminado correctamente'
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Método no permitido'
            }, status=405)
    except InsumoCompuesto.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': f'Insumo compuesto con ID {id} no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def recetas_crud(request):
    """Vista para listar todas las recetas o crear una nueva"""
    if request.method == 'GET':
        try:
            recetas = []
            for receta in Receta.objects.prefetch_related('insumos__insumo', 'insumos_compuestos__insumo_compuesto').all():
                recetas.append({
                    'id': receta.id,
                    'nombre': receta.nombre,
                    'categoria': receta.categoria,
                    'costo': float(receta.costo),
                    'descripcion': receta.descripcion
                })
            return JsonResponse({'status': 'success', 'recetas': recetas})
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos básicos
            if not data.get('nombre'):
                return JsonResponse({
                    'status': 'error',
                    'message': 'El nombre de la receta es requerido'
                }, status=400)
                
            # Crear la receta
            receta = Receta.objects.create(
                nombre=data['nombre'],
                categoria=data['categoria'],
                costo=data['costo'],
                descripcion=data.get('descripcion', '')
            )
            
            # Procesar insumos simples
            if 'insumos' in data and isinstance(data['insumos'], list):
                for insumo_data in data['insumos']:
                    try:
                        insumo = Insumo.objects.get(id=insumo_data['id'])
                        InsumoReceta.objects.create(
                            receta=receta,
                            insumo=insumo,
                            cantidad=insumo_data['cantidad'],
                            costo=insumo_data['costo']
                        )
                    except Insumo.DoesNotExist:
                        pass
            
            # Procesar insumos compuestos
            if 'insumos_compuestos' in data and isinstance(data['insumos_compuestos'], list):
                for insumo_data in data['insumos_compuestos']:
                    try:
                        insumo_compuesto = InsumoCompuesto.objects.get(id=insumo_data['id'])
                        InsumoCompuestoReceta.objects.create(
                            receta=receta,
                            insumo_compuesto=insumo_compuesto,
                            cantidad=insumo_data['cantidad'],
                            costo=insumo_data['costo']
                        )
                    except InsumoCompuesto.DoesNotExist:
                        pass
            
            return JsonResponse({
                'status': 'success',
                'message': 'Receta creada exitosamente',
                'id': receta.id
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@login_required
@csrf_exempt
def receta_detail(request, id):
    """Vista para obtener, actualizar o eliminar una receta específica"""
    try:
        receta = Receta.objects.prefetch_related(
            'insumos__insumo', 
            'insumos_compuestos__insumo_compuesto'
        ).get(id=id)
        
        if request.method == 'GET':
            # Construir los detalles de la receta
            insumos = [
                {
                    'id': item.insumo.id,
                    'nombre': item.insumo.nombre,
                    'unidad': item.insumo.unidad,
                    'cantidad': float(item.cantidad),
                    'costo': float(item.costo)
                }
                for item in receta.insumos.all()
            ]
            
            insumos_compuestos = [
                {
                    'id': item.insumo_compuesto.id,
                    'nombre': item.insumo_compuesto.nombre,
                    'unidad': item.insumo_compuesto.unidad,
                    'cantidad': float(item.cantidad),
                    'costo': float(item.costo)
                }
                for item in receta.insumos_compuestos.all()
            ]
            
            return JsonResponse({
                'status': 'success',
                'receta': {
                    'id': receta.id,
                    'nombre': receta.nombre,
                    'categoria': receta.categoria,
                    'costo': float(receta.costo),
                    'descripcion': receta.descripcion,
                    'insumos': insumos,
                    'insumos_compuestos': insumos_compuestos
                }
            })
            
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar datos básicos de la receta
            receta.nombre = data['nombre']
            receta.categoria = data['categoria']
            receta.costo = data['costo']
            receta.descripcion = data.get('descripcion', '')
            receta.save()
            
            # Eliminar todos los insumos existentes
            receta.insumos.all().delete()
            receta.insumos_compuestos.all().delete()
            
            # Procesar insumos simples
            if 'insumos' in data and isinstance(data['insumos'], list):
                for insumo_data in data['insumos']:
                    try:
                        insumo = Insumo.objects.get(id=insumo_data['id'])
                        InsumoReceta.objects.create(
                            receta=receta,
                            insumo=insumo,
                            cantidad=insumo_data['cantidad'],
                            costo=insumo_data['costo']
                        )
                    except Insumo.DoesNotExist:
                        pass
            
            # Procesar insumos compuestos
            if 'insumos_compuestos' in data and isinstance(data['insumos_compuestos'], list):
                for insumo_data in data['insumos_compuestos']:
                    try:
                        insumo_compuesto = InsumoCompuesto.objects.get(id=insumo_data['id'])
                        InsumoCompuestoReceta.objects.create(
                            receta=receta,
                            insumo_compuesto=insumo_compuesto,
                            cantidad=insumo_data['cantidad'],
                            costo=insumo_data['costo']
                        )
                    except InsumoCompuesto.DoesNotExist:
                        pass
            
            return JsonResponse({
                'status': 'success',
                'message': 'Receta actualizada exitosamente'
            })
            
        elif request.method == 'DELETE':
            receta.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Receta eliminada exitosamente'
            })
            
    except Receta.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Receta no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
def obtener_insumos_para_receta(request):
    """Devuelve la lista de insumos disponibles para crear recetas"""
    try:
        insumos = []
        for insumo in Insumo.objects.all():
            # Obtener el costo unitario del proveedor principal
            insumo_proveedor = InsumoProveedor.objects.filter(
                insumo=insumo, 
                es_proveedor_principal=True
            ).first()
            
            costo_unitario = 0
            if insumo_proveedor:
                costo_unitario = float(insumo_proveedor.costo_unitario)
            else:
                # Si no hay proveedor principal, buscar cualquier proveedor
                cualquier_proveedor = InsumoProveedor.objects.filter(insumo=insumo).first()
                if cualquier_proveedor:
                    costo_unitario = float(cualquier_proveedor.costo_unitario)
            
            insumos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'categoria': insumo.categoria.nombre if insumo.categoria else 'Sin categoría',
                'costo_unitario': costo_unitario  # Asegura que siempre hay un valor, aunque sea 0
            })
            
        return JsonResponse({
            'status': 'success',
            'insumos': insumos
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
def obtener_insumos_compuestos_para_receta(request):
    """Devuelve la lista de insumos compuestos disponibles para crear recetas"""
    try:
        insumos_compuestos = []
        for insumo in InsumoCompuesto.objects.all():
            insumos_compuestos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'costo': float(insumo.costo_total)
            })
            
        return JsonResponse({
            'status': 'success',
            'insumos_compuestos': insumos_compuestos
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def insumo_detail(request, id):
    """Vista para obtener, actualizar o eliminar un insumo específico"""
    try:
        insumo = Insumo.objects.get(id=id)
        
        if request.method == 'GET':
            # Obtener detalles del insumo
            return JsonResponse({
                'status': 'success',
                'insumo': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'unidad': insumo.unidad,
                    'categoria': insumo.categoria.nombre,
                    'tipo': insumo.tipo,
                    'stock': insumo.stock,
                    'minimo': insumo.minimo
                }
            })
        
        elif request.method == 'PUT':
            # Actualizar el insumo
            data = json.loads(request.body)
            
            # Actualizar campos básicos
            insumo.nombre = data.get('nombre', insumo.nombre)
            insumo.unidad = data.get('unidad', insumo.unidad)
            
            # Actualizar categoría si se proporciona
            if 'categoria' in data:
                try:
                    categoria = Categoria.objects.get(nombre=data['categoria'])
                    insumo.categoria = categoria
                except Categoria.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'La categoría {data["categoria"]} no existe'
                    }, status=400)
            
            insumo.tipo = data.get('tipo', insumo.tipo)
            insumo.stock = data.get('stock', insumo.stock)
            insumo.minimo = data.get('minimo', insumo.minimo)
            
            insumo.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo actualizado correctamente',
                'insumo': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'unidad': insumo.unidad,
                    'categoria': insumo.categoria.nombre,
                    'tipo': insumo.tipo,
                    'stock': insumo.stock,
                    'minimo': insumo.minimo
                }
            })
        
        elif request.method == 'DELETE':
            # Eliminar el insumo
            insumo.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo eliminado correctamente'
            })
        
        else:
            return JsonResponse({
                'status': 'error',
                'message': f'Método {request.method} no soportado'
            }, status=405)
            
    except Insumo.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Insumo no encontrado'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

def obtener_costo_unitario_insumo(insumo_id):
    """
    Obtiene el costo unitario de un insumo basado en su ID.
    Prioriza el proveedor principal, si existe.
    """
    try:
        # Intentar obtener el registro con proveedor principal
        insumo_proveedor = InsumoProveedor.objects.filter(
            insumo_id=insumo_id,
            es_proveedor_principal=True
        ).first()
        
        # Si no hay proveedor principal, intentar con cualquier proveedor
        if not insumo_proveedor:
            insumo_proveedor = InsumoProveedor.objects.filter(
                insumo_id=insumo_id
            ).first()
        
        # Si encontramos algún registro, devolver el costo unitario
        if insumo_proveedor:
            return float(insumo_proveedor.costo_unitario)
        
        # Si no hay ningún proveedor, devolver 0
        return 0
        
    except Exception as e:
        print(f"Error al obtener costo unitario: {str(e)}")
        return 0

# Ejemplo de uso en una vista
@login_required
def detalles_insumo(request, insumo_id):
    insumo = Insumo.objects.get(id=insumo_id)
    costo_unitario = obtener_costo_unitario_insumo(insumo_id)
    
    return JsonResponse({
        'status': 'success',
        'insumo': {
            'id': insumo.id,
            'nombre': insumo.nombre,
            'costo_unitario': costo_unitario
        }
    })

# Añadir al modelo Insumo en models.py
def costo_unitario(self):
    """Devuelve el costo unitario del insumo con proveedor principal o cualquier proveedor"""
    try:
        # Primero buscar con proveedor principal
        rel = InsumoProveedor.objects.filter(
            insumo=self,
            es_proveedor_principal=True
        ).first()
        
        # Si no hay proveedor principal, usar cualquier proveedor
        if not rel:
            rel = InsumoProveedor.objects.filter(insumo=self).first()
            
        # Si hay alguna relación, devolver el costo
        if rel:
            return float(rel.costo_unitario)
            
        # Por defecto devolver 0
        return 0
        
    except Exception as e:
        return 0
