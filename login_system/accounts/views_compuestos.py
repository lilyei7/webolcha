import json
from decimal import Decimal, InvalidOperation
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import InsumoCompuesto, ComponenteInsumoCompuesto, Insumo, InsumoProveedor

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
                        'unidad': componente.insumo.unidad,
                        'costo': float(componente.costo)
                    })
                
                compuestos.append({
                    'id': compuesto.id,
                    'nombre': compuesto.nombre,
                    'descripcion': compuesto.descripcion,
                    'unidad': compuesto.unidad,
                    'categoria': compuesto.categoria,  # Añadido
                    'cantidad': float(compuesto.cantidad),  # Añadido
                    'costo_total': float(compuesto.costo_total),  # Añadido
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
            
            # Log para depurar
            print("Datos recibidos:", data)
            print("Tipo de cantidad:", type(data.get('cantidad')))
            
            # Validaciones explícitas
            nombre = data.get('nombre')
            if not nombre:
                return JsonResponse({
                    'status': 'error',
                    'message': 'El nombre del insumo compuesto es requerido'
                }, status=400)
            
            # Validar cantidad
            try:
                cantidad = Decimal(str(data.get('cantidad', 0)))
                if cantidad <= 0:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'La cantidad debe ser mayor a cero'
                    }, status=400)
            except (InvalidOperation, ValueError, TypeError) as e:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Cantidad inválida: {e}'
                }, status=400)
                
            # Crear el insumo compuesto con valores explícitos
            insumo_compuesto = InsumoCompuesto.objects.create(
                nombre=nombre,
                categoria=data.get('categoria', ''),
                unidad=data.get('unidad', ''),
                cantidad=cantidad,  # Usar el valor validado
                costo_total=Decimal(str(data.get('costo_total', 0))),
                descripcion=data.get('descripcion', ''),
                activo=data.get('activo', True)
            )
            
            # Procesar componentes
            for componente_data in data.get('componentes', []):
                insumo_id = componente_data.get('insumo_id')
                comp_cantidad = Decimal(str(componente_data.get('cantidad', 0)))
                costo = Decimal(str(componente_data.get('costo', 0)))
                
                try:
                    insumo = Insumo.objects.get(id=insumo_id)
                    ComponenteInsumoCompuesto.objects.create(
                        insumo_compuesto=insumo_compuesto,
                        insumo=insumo,
                        cantidad=comp_cantidad,
                        costo=costo
                    )
                except Insumo.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'No existe un insumo con ID {insumo_id}'
                    }, status=400)
            
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo compuesto creado exitosamente',
                'id': insumo_compuesto.id
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Formato JSON inválido'
            }, status=400)
        except Exception as e:
            import traceback
            print("Error detallado:", traceback.format_exc())
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

@login_required
def obtener_insumos_para_compuesto(request):
    """Devuelve la lista de insumos disponibles para crear compuestos"""
    try:
        insumos = []
        for insumo in Insumo.objects.all():
            # Buscar el costo unitario del proveedor principal primero
            costo_estimado = 0
            
            # Primero buscamos si hay un proveedor principal
            proveedor_principal = InsumoProveedor.objects.filter(
                insumo=insumo,
                es_proveedor_principal=True
            ).first()
            
            if proveedor_principal and proveedor_principal.costo_unitario:
                costo_estimado = float(proveedor_principal.costo_unitario)
            else:
                # Si no hay proveedor principal, buscar el costo más bajo disponible
                proveedor_cualquiera = InsumoProveedor.objects.filter(
                    insumo=insumo
                ).order_by('costo_unitario').first()
                
                if proveedor_cualquiera and proveedor_cualquiera.costo_unitario:
                    costo_estimado = float(proveedor_cualquiera.costo_unitario)
            
            # Convertir a formato JSON compatible
            insumos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'categoria': insumo.categoria.nombre if insumo.categoria else None,
                'stock': insumo.stock,
                'costo_estimado': costo_estimado
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
                    'insumo': comp.insumo.nombre,
                    'cantidad': float(comp.cantidad),
                    'unidad': comp.insumo.unidad,
                    'costo': float(comp.costo)
                })
            
            return JsonResponse({
                'status': 'success',
                'insumo_compuesto': {
                    'id': insumo.id,
                    'nombre': insumo.nombre,
                    'descripcion': insumo.descripcion,
                    'categoria': insumo.categoria,
                    'unidad': insumo.unidad,
                    'cantidad': float(insumo.cantidad),
                    'costo_total': float(insumo.costo_total),
                    'activo': insumo.activo,
                    'componentes': componentes
                }
            })
        
        elif request.method == 'PUT':
            data = json.loads(request.body)
            
            # Actualizar TODOS los datos básicos
            insumo.nombre = data.get('nombre', insumo.nombre)
            insumo.descripcion = data.get('descripcion', insumo.descripcion)
            insumo.unidad = data.get('unidad', insumo.unidad)
            insumo.activo = data.get('activo', insumo.activo)
            insumo.categoria = data.get('categoria', insumo.categoria)
            
            # Agregar actualización de estos campos que faltaban
            insumo.cantidad = Decimal(str(data.get('cantidad', insumo.cantidad)))
            insumo.costo_total = Decimal(str(data.get('costo_total', insumo.costo_total)))
            
            insumo.save()
            
            # Si también hay que actualizar componentes
            if 'componentes' in data:
                # Opcionalmente, borrar componentes existentes y crear nuevos
                insumo.componentes.all().delete()
                
                for componente_data in data.get('componentes', []):
                    insumo_id = componente_data.get('insumo_id')
                    comp_cantidad = Decimal(str(componente_data.get('cantidad', 0)))
                    costo = Decimal(str(componente_data.get('costo', 0)))
                    
                    try:
                        insumo_item = Insumo.objects.get(id=insumo_id)
                        ComponenteInsumoCompuesto.objects.create(
                            insumo_compuesto=insumo,
                            insumo=insumo_item,
                            cantidad=comp_cantidad,
                            costo=costo
                        )
                    except Insumo.DoesNotExist:
                        return JsonResponse({
                            'status': 'error',
                            'message': f'No existe un insumo con ID {insumo_id}'
                        }, status=400)
    
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