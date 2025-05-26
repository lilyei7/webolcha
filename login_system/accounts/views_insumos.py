import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Insumo, Categoria, InsumoProveedor, Proveedor
from decimal import Decimal, InvalidOperation

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
                        'message': f'Faltan campos requeridos'
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
                                costo_unitario=Decimal(str(prov_data['costo_unitario'])),
                                es_proveedor_principal=prov_data.get('es_principal', False)
                            )
                        except (Proveedor.DoesNotExist, InvalidOperation) as e:
                            print(f"Error al asignar proveedor: {e}")
            
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

@login_required
@csrf_exempt
def insumo_detail(request, id):
    """Vista para obtener, actualizar o eliminar un insumo específico"""
    try:
        insumo = Insumo.objects.get(id=id)
        
        if request.method == 'GET':
            # Obtener proveedores del insumo
            proveedores = InsumoProveedor.objects.filter(insumo=insumo).select_related('proveedor')
            proveedores_data = [{
                'id': ip.proveedor.id,
                'nombre': ip.proveedor.nombre,
                'costo_unitario': float(ip.costo_unitario) if ip.costo_unitario else 0,
                'es_principal': ip.es_proveedor_principal
            } for ip in proveedores]
            
            return JsonResponse({
                'status': 'success',
                'insumo': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'unidad': insumo.unidad,
                    'categoria': insumo.categoria.nombre if insumo.categoria else None,
                    'tipo': insumo.tipo,
                    'stock': insumo.stock,
                    'minimo': insumo.minimo,
                    'proveedores': proveedores_data
                }
            })
            
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar campos básicos
            insumo.nombre = data.get('nombre', insumo.nombre)
            insumo.unidad = data.get('unidad', insumo.unidad)
            insumo.tipo = data.get('tipo', insumo.tipo)
            insumo.stock = data.get('stock', insumo.stock)
            insumo.minimo = data.get('minimo', insumo.minimo)
            
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
            
            insumo.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo actualizado correctamente'
            })
            
        elif request.method == 'DELETE':
            try:
                insumo.delete()
                return JsonResponse({
                    'status': 'success',
                    'message': 'Insumo eliminado correctamente'
                })
            except Exception as e:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Error al eliminar insumo: {str(e)}'
                }, status=400)
                
    except Insumo.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Insumo no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)