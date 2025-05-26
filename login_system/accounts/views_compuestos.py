import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import InsumoCompuesto, ComponenteInsumoCompuesto, Insumo

@login_required
@csrf_exempt
def insumos_compuestos_crud(request):
    if request.method == 'GET':
        try:
            compuestos = []
            for compuesto in InsumoCompuesto.objects.prefetch_related('componentes__insumo').all():
                # Obtener componentes
                componentes_data = []
                for componente in compuesto.componentes.all():
                    componentes_data.append({
                        'insumo_id': componente.insumo.id,
                        'insumo_nombre': componente.insumo.nombre,
                        'cantidad': float(componente.cantidad),
                        'unidad': componente.insumo.unidad
                    })
                
                compuestos.append({
                    'id': compuesto.id,
                    'nombre': compuesto.nombre,
                    'descripcion': compuesto.descripcion,
                    'unidad': compuesto.unidad,
                    'activo': compuesto.activo,
                    'componentes': componentes_data
                })
                
            return JsonResponse({'status': 'success', 'insumos_compuestos': compuestos})
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar datos requeridos
            if not data.get('nombre'):
                return JsonResponse({
                    'status': 'error',
                    'message': 'El nombre es requerido'
                }, status=400)
            
            # Crear el insumo compuesto
            compuesto = InsumoCompuesto.objects.create(
                nombre=data['nombre'],
                descripcion=data.get('descripcion', ''),
                unidad=data.get('unidad', 'kg'),
                activo=data.get('activo', True)
            )
            
            # Agregar componentes
            if 'componentes' in data:
                for comp_data in data['componentes']:
                    try:
                        insumo = Insumo.objects.get(id=comp_data['insumo_id'])
                        ComponenteInsumoCompuesto.objects.create(
                            insumo_compuesto=compuesto,
                            insumo=insumo,
                            cantidad=comp_data['cantidad']
                        )
                    except Insumo.DoesNotExist:
                        continue
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo compuesto creado correctamente',
                'id': compuesto.id
            })
            
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
                'categoria': insumo.categoria.nombre if insumo.categoria else None,
                'stock': insumo.stock
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
@csrf_exempt
def insumo_compuesto_detail(request, id):
    """Vista para obtener, actualizar o eliminar un insumo compuesto específico"""
    try:
        insumo = InsumoCompuesto.objects.prefetch_related('componentes__insumo').get(id=id)
        
        if request.method == 'GET':
            componentes = []
            for comp in insumo.componentes.all():
                componentes.append({
                    'insumo_id': comp.insumo.id,
                    'insumo_nombre': comp.insumo.nombre,
                    'cantidad': float(comp.cantidad),
                    'unidad': comp.insumo.unidad
                })
            
            return JsonResponse({
                'status': 'success',
                'insumo_compuesto': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'descripcion': insumo.descripcion,
                    'unidad': insumo.unidad,
                    'activo': insumo.activo,
                    'componentes': componentes
                }
            })
            
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar datos básicos
            insumo.nombre = data.get('nombre', insumo.nombre)
            insumo.descripcion = data.get('descripcion', insumo.descripcion)
            insumo.unidad = data.get('unidad', insumo.unidad)
            insumo.activo = data.get('activo', insumo.activo)
            insumo.save()
            
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