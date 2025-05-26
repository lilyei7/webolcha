import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Receta, InsumoReceta, InsumoCompuestoReceta, Insumo, InsumoCompuesto

@login_required
@csrf_exempt
def recetas_crud(request):
    """Vista para listar todas las recetas o crear una nueva"""
    if request.method == 'GET':
        try:
            recetas = []
            for receta in Receta.objects.prefetch_related(
                'insumos__insumo', 
                'insumos_compuestos__insumo_compuesto'
            ).all():
                
                # Obtener insumos de la receta
                insumos_data = []
                for insumo_receta in receta.insumos.all():
                    insumos_data.append({
                        'insumo_id': insumo_receta.insumo.id,
                        'nombre': insumo_receta.insumo.nombre,
                        'cantidad': float(insumo_receta.cantidad),
                        'unidad': insumo_receta.insumo.unidad
                    })
                
                # Obtener insumos compuestos de la receta
                compuestos_data = []
                for compuesto_receta in receta.insumos_compuestos.all():
                    compuestos_data.append({
                        'insumo_compuesto_id': compuesto_receta.insumo_compuesto.id,
                        'nombre': compuesto_receta.insumo_compuesto.nombre,
                        'cantidad': float(compuesto_receta.cantidad),
                        'unidad': compuesto_receta.insumo_compuesto.unidad
                    })
                
                recetas.append({
                    'id': receta.id,
                    'nombre': receta.nombre,
                    'descripcion': receta.descripcion,
                    'tiempo_preparacion': receta.tiempo_preparacion,
                    'porciones': receta.porciones,
                    'categoria': receta.categoria,
                    'activa': receta.activa,
                    'insumos': insumos_data,
                    'insumos_compuestos': compuestos_data
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
            
            # Crear la receta
            receta = Receta.objects.create(
                nombre=data['nombre'],
                descripcion=data.get('descripcion', ''),
                tiempo_preparacion=data.get('tiempo_preparacion', 0),
                porciones=data.get('porciones', 1),
                categoria=data.get('categoria', ''),
                activa=data.get('activa', True)
            )
            
            # Agregar insumos a la receta
            if 'insumos' in data:
                for insumo_data in data['insumos']:
                    try:
                        insumo = Insumo.objects.get(id=insumo_data['insumo_id'])
                        InsumoReceta.objects.create(
                            receta=receta,
                            insumo=insumo,
                            cantidad=insumo_data['cantidad']
                        )
                    except Insumo.DoesNotExist:
                        continue
            
            # Agregar insumos compuestos a la receta
            if 'insumos_compuestos' in data:
                for compuesto_data in data['insumos_compuestos']:
                    try:
                        compuesto = InsumoCompuesto.objects.get(id=compuesto_data['insumo_compuesto_id'])
                        InsumoCompuestoReceta.objects.create(
                            receta=receta,
                            insumo_compuesto=compuesto,
                            cantidad=compuesto_data['cantidad']
                        )
                    except InsumoCompuesto.DoesNotExist:
                        continue
            
            return JsonResponse({
                'status': 'success',
                'message': 'Receta creada correctamente',
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
            # Obtener insumos
            insumos_data = []
            for insumo_receta in receta.insumos.all():
                insumos_data.append({
                    'insumo_id': insumo_receta.insumo.id,
                    'nombre': insumo_receta.insumo.nombre,
                    'cantidad': float(insumo_receta.cantidad),
                    'unidad': insumo_receta.insumo.unidad
                })
            
            # Obtener insumos compuestos
            compuestos_data = []
            for compuesto_receta in receta.insumos_compuestos.all():
                compuestos_data.append({
                    'insumo_compuesto_id': compuesto_receta.insumo_compuesto.id,
                    'nombre': compuesto_receta.insumo_compuesto.nombre,
                    'cantidad': float(compuesto_receta.cantidad),
                    'unidad': compuesto_receta.insumo_compuesto.unidad
                })
            
            return JsonResponse({
                'status': 'success',
                'receta': {
                    'id': receta.id,
                    'nombre': receta.nombre,
                    'descripcion': receta.descripcion,
                    'tiempo_preparacion': receta.tiempo_preparacion,
                    'porciones': receta.porciones,
                    'categoria': receta.categoria,
                    'activa': receta.activa,
                    'insumos': insumos_data,
                    'insumos_compuestos': compuestos_data
                }
            })
            
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar datos básicos
            receta.nombre = data.get('nombre', receta.nombre)
            receta.descripcion = data.get('descripcion', receta.descripcion)
            receta.tiempo_preparacion = data.get('tiempo_preparacion', receta.tiempo_preparacion)
            receta.porciones = data.get('porciones', receta.porciones)
            receta.categoria = data.get('categoria', receta.categoria)
            receta.activa = data.get('activa', receta.activa)
            receta.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Receta actualizada correctamente'
            })
            
        elif request.method == 'DELETE':
            receta.delete()
            return JsonResponse({
                'status': 'success',
                'message': 'Receta eliminada correctamente'
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
def obtener_insumos_compuestos_para_receta(request):
    """Devuelve la lista de insumos compuestos disponibles para crear recetas"""
    try:
        insumos_compuestos = []
        for insumo in InsumoCompuesto.objects.all():
            insumos_compuestos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'descripcion': insumo.descripcion,
                'activo': insumo.activo
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