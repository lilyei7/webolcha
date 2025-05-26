import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import MovimientoInventario, Sucursal, Insumo, Proveedor
from .decorators import sucursal_permission_required

@login_required
@csrf_exempt
def movimientos_crud(request):
    """Vista para listar todos los movimientos de inventario"""
    if request.method == 'GET':
        try:
            movimientos = []
            for mov in MovimientoInventario.objects.select_related('insumo', 'sucursal', 'usuario', 'proveedor').all():
                movimientos.append({
                    'id': mov.id,
                    'tipo': mov.tipo,
                    'insumo': mov.insumo.nombre,
                    'cantidad': float(mov.cantidad),
                    'precio_unitario': float(mov.precio_unitario) if mov.precio_unitario else 0,
                    'sucursal': mov.sucursal.nombre,
                    'usuario': f"{mov.usuario.first_name} {mov.usuario.last_name}".strip() or mov.usuario.username,
                    'proveedor': mov.proveedor.nombre if mov.proveedor else None,
                    'observaciones': mov.observaciones,
                    'fecha': mov.fecha.isoformat(),
                    'estado': mov.estado
                })
            
            return JsonResponse({
                'status': 'success',
                'movimientos': movimientos
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos requeridos
            required_fields = ['tipo', 'insumo_id', 'cantidad', 'sucursal_id']
            for field in required_fields:
                if field not in data or not data[field]:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'El campo {field} es requerido'
                    }, status=400)
            
            # Obtener objetos relacionados
            try:
                sucursal = Sucursal.objects.get(id=data['sucursal_id'])
            except Sucursal.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Sucursal no encontrada'
                }, status=404)
            
            try:
                insumo = Insumo.objects.get(id=data['insumo_id'])
            except Insumo.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Insumo no encontrado'
                }, status=404)
            
            # Proveedor es opcional
            proveedor = None
            if data.get('proveedor_id'):
                try:
                    proveedor = Proveedor.objects.get(id=data['proveedor_id'])
                except Proveedor.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Proveedor no encontrado'
                    }, status=404)
            
            # Crear el movimiento
            movimiento = MovimientoInventario.objects.create(
                tipo=data['tipo'],
                insumo=insumo,
                cantidad=data['cantidad'],
                precio_unitario=data.get('precio_unitario', 0),
                sucursal=sucursal,
                usuario=request.user,
                proveedor=proveedor,
                observaciones=data.get('observaciones', ''),
                estado='completado'
            )
            
            # Actualizar stock del insumo
            if data['tipo'] == 'entrada':
                insumo.stock += data['cantidad']
            else:  # salida
                if insumo.stock >= data['cantidad']:
                    insumo.stock -= data['cantidad']
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'Stock insuficiente. Stock actual: {insumo.stock}'
                    }, status=400)
            
            insumo.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Movimiento creado correctamente',
                'movimiento_id': movimiento.id
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@login_required
@csrf_exempt
def movimiento_detail(request, id):
    """Vista para obtener, actualizar o eliminar un movimiento específico"""
    try:
        movimiento = MovimientoInventario.objects.select_related(
            'insumo', 'sucursal', 'usuario', 'proveedor'
        ).get(id=id)
        
        if request.method == 'GET':
            return JsonResponse({
                'status': 'success',
                'movimiento': {
                    'id': movimiento.id,
                    'tipo': movimiento.tipo,
                    'insumo': movimiento.insumo.nombre,
                    'cantidad': float(movimiento.cantidad),
                    'precio_unitario': float(movimiento.precio_unitario) if movimiento.precio_unitario else 0,
                    'sucursal': movimiento.sucursal.nombre,
                    'usuario': f"{movimiento.usuario.first_name} {movimiento.usuario.last_name}".strip() or movimiento.usuario.username,
                    'proveedor': movimiento.proveedor.nombre if movimiento.proveedor else None,
                    'observaciones': movimiento.observaciones,
                    'fecha': movimiento.fecha.isoformat(),
                    'estado': movimiento.estado
                }
            })
            
        elif request.method == 'DELETE':
            if movimiento.estado == 'cancelado':
                return JsonResponse({
                    'status': 'error',
                    'message': 'No se puede eliminar un movimiento cancelado'
                }, status=400)
            
            # Revertir el efecto en el inventario antes de eliminar
            insumo = movimiento.insumo
            if movimiento.tipo == 'entrada':
                insumo.stock -= movimiento.cantidad
            else:  # salida
                insumo.stock += movimiento.cantidad
            insumo.save()
            
            movimiento.delete()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Movimiento eliminado correctamente'
            })
            
    except MovimientoInventario.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Movimiento no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@csrf_exempt
def cancelar_movimiento(request, id):
    """Vista para cancelar un movimiento de inventario"""
    if request.method != 'POST':
        return JsonResponse({
            'status': 'error',
            'message': 'Método no permitido'
        }, status=405)
        
    try:
        # Obtener el movimiento
        movimiento = MovimientoInventario.objects.get(id=id)
        
        # Verificar que no esté ya cancelado
        if movimiento.estado == 'cancelado':
            return JsonResponse({
                'status': 'error',
                'message': 'El movimiento ya está cancelado'
            }, status=400)
        
        # Revertir el efecto en el inventario
        insumo = movimiento.insumo
        if movimiento.tipo == 'entrada':
            insumo.stock -= movimiento.cantidad
        else:  # salida
            insumo.stock += movimiento.cantidad
        insumo.save()
        
        # Marcar como cancelado
        movimiento.estado = 'cancelado'
        movimiento.observaciones = (movimiento.observaciones or '') + f"\n[CANCELADO] {timezone.now().strftime('%Y-%m-%d %H:%M')} por {request.user.username}"
        movimiento.save()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Movimiento cancelado correctamente'
        })
        
    except MovimientoInventario.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Movimiento no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@sucursal_permission_required
def sucursal_insumos(request, id):
    """Vista temporal para devolver todos los insumos como disponibles en cualquier sucursal"""
    try:
        # Verificar que la sucursal existe
        sucursal = Sucursal.objects.get(id=id)
        
        # Obtener todos los insumos
        insumos = Insumo.objects.all()
        
        insumos_data = [{
            'id': insumo.id,
            'nombre': insumo.nombre,
            'unidad': insumo.unidad,
            'categoria': insumo.categoria.nombre if insumo.categoria else None,
            'stock': insumo.stock
        } for insumo in insumos]
        
        return JsonResponse({
            'status': 'success',
            'sucursal': sucursal.nombre,
            'insumos': insumos_data
        })
        
    except Sucursal.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Sucursal no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)