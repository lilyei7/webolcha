import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Sucursal, HorarioSucursal
from .decorators import admin_required

@login_required
@admin_required
@csrf_exempt
def sucursales_crud(request):
    if request.method == 'GET':
        try:
            # Permitir a administradores ver todas las sucursales
            if request.user.is_superuser or hasattr(request.user, 'is_admin') and request.user.is_admin or request.user.groups.filter(name__in=['Administrador', 'Admin']).exists():
                queryset = Sucursal.objects.prefetch_related('horarios').all()
            else:
                # Usuarios normales solo ven sus sucursales asignadas
                queryset = request.user.sucursales.prefetch_related('horarios').all()
            
            sucursales = []
            for s in queryset:
                horarios = {}
                for h in s.horarios.all():
                    horarios[h.dia.lower()] = {
                        'apertura': h.hora_apertura.strftime('%H:%M') if h.hora_apertura else None,
                        'cierre': h.hora_cierre.strftime('%H:%M') if h.hora_cierre else None,
                        'esta_abierto': h.esta_abierto
                    }
                
                sucursales.append({
                    'id': s.id,
                    'nombre': s.nombre,
                    'codigo_interno': s.codigo_interno,
                    'direccion': s.direccion,
                    'ciudad_estado': s.ciudad_estado,
                    'telefono': s.telefono,
                    'gerente': s.gerente,
                    'activa': s.activa,
                    'meta_diaria': float(s.meta_diaria or 0),
                    'horarios': horarios
                })
            
            return JsonResponse({'status': 'success', 'sucursales': sucursales})
            
        except Exception as e:
            print(f"Error en sucursales_crud GET: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        
    elif request.method == 'POST' or request.method == 'PUT':
        try:
            data = json.loads(request.body)
            sucursal_id = data.get('id')
            
            if request.method == 'PUT' and sucursal_id:
                # Actualizar existente
                sucursal = Sucursal.objects.get(id=sucursal_id)
            else:
                # Crear nueva
                sucursal = Sucursal()
            
            # Actualizar campos
            sucursal.nombre = data.get('nombre')
            sucursal.codigo_interno = data.get('codigo_interno', '')
            sucursal.direccion = data.get('direccion', '')
            sucursal.ciudad_estado = data.get('ciudad_estado', '')
            sucursal.telefono = data.get('telefono', '')
            sucursal.gerente = data.get('gerente', '')
            sucursal.activa = bool(data.get('activa', True))
            sucursal.meta_diaria = data.get('meta_diaria', 0)
            
            # Guardar
            sucursal.save()
            
            # Actualizar horarios si se proporcionaron
            if 'horarios' in data:
                for dia, horario in data['horarios'].items():
                    HorarioSucursal.objects.update_or_create(
                        sucursal=sucursal,
                        dia=dia.capitalize(),
                        defaults={
                            'hora_apertura': horario.get('apertura'),
                            'hora_cierre': horario.get('cierre'),
                            'esta_abierto': horario.get('esta_abierto', True)
                        }
                    )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Sucursal guardada correctamente',
                'id': sucursal.id
            })
            
        except Exception as e:
            print(f"Error en sucursales_crud POST/PUT: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            sucursal_id = data.get('id')
            
            if not sucursal_id:
                return JsonResponse({'status': 'error', 'message': 'ID no proporcionado'}, status=400)
            
            sucursal = Sucursal.objects.get(id=sucursal_id)
            sucursal.delete()
            
            return JsonResponse({
                'status': 'success',
                'message': f'Sucursal {sucursal.nombre} eliminada correctamente'
            })
        except Sucursal.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Sucursal no encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

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