import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Receta, InsumoReceta, InsumoCompuestoReceta, Insumo, InsumoCompuesto, InsumoProveedor, ComponenteInsumoCompuesto
from django.db.models import Sum, F

@login_required
@csrf_exempt
def recetas_crud(request):
    """Vista para listar todas las recetas o crear una nueva"""
    if request.method == 'GET':
        try:
            from .models import Receta, InsumoReceta, InsumoCompuestoReceta, InsumoElaboradoReceta
            
            recetas = []
            for receta in Receta.objects.prefetch_related(
                'insumos__insumo', 
                'insumos_compuestos__insumo_compuesto',
                'insumos_elaborados__insumo_elaborado'  # Añadir prefetch para insumos elaborados
            ).all():
                
                # Obtener insumos de la receta
                insumos_data = []
                for insumo_receta in receta.insumos.all():
                    insumos_data.append({
                        'insumo_id': insumo_receta.insumo.id,
                        'nombre': insumo_receta.insumo.nombre,
                        'cantidad': float(insumo_receta.cantidad),
                        'unidad': insumo_receta.insumo.unidad,
                        'costo': float(insumo_receta.costo)
                    })
                
                # Obtener insumos compuestos de la receta
                compuestos_data = []
                for compuesto_receta in receta.insumos_compuestos.all():
                    compuestos_data.append({
                        'insumo_compuesto_id': compuesto_receta.insumo_compuesto.id,
                        'nombre': compuesto_receta.insumo_compuesto.nombre,
                        'cantidad': float(compuesto_receta.cantidad),
                        'unidad': compuesto_receta.insumo_compuesto.unidad,
                        'costo': float(compuesto_receta.costo)
                    })
                
                # Obtener insumos elaborados de la receta
                elaborados_data = []
                for elaborado_receta in receta.insumos_elaborados.all():
                    elaborados_data.append({
                        'insumo_elaborado_id': elaborado_receta.insumo_elaborado.id,
                        'nombre': elaborado_receta.insumo_elaborado.nombre,
                        'cantidad': float(elaborado_receta.cantidad),
                        'unidad': elaborado_receta.insumo_elaborado.unidad,
                        'costo': float(elaborado_receta.costo)
                    })
                
                recetas.append({
                    'id': receta.id,
                    'nombre': receta.nombre,
                    'descripcion': receta.descripcion,
                    'tiempo_preparacion': getattr(receta, 'tiempo_preparacion', 0),  # Campo opcional
                    'porciones': getattr(receta, 'porciones', 1),  # Campo opcional  
                    'categoria': receta.categoria,
                    'costo': float(receta.costo),
                    'activa': getattr(receta, 'activa', True),  # Campo opcional
                    'insumos': insumos_data,
                    'insumos_compuestos': compuestos_data,
                    'insumos_elaborados': elaborados_data  # Añadir insumos elaborados
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
            print(f"Datos recibidos para crear receta: {data}")  # Debug
            
            # Validaciones del servidor
            if not data.get('nombre') or not data.get('nombre').strip():
                return JsonResponse({
                    'status': 'error',
                    'message': 'El nombre de la receta es obligatorio'
                }, status=400)
            
            if not data.get('categoria') or not data.get('categoria').strip():
                return JsonResponse({
                    'status': 'error',
                    'message': 'La categoría es obligatoria'
                }, status=400)
            
            if not data.get('costo') or float(data.get('costo', 0)) <= 0:
                return JsonResponse({
                    'status': 'error',
                    'message': 'El precio de venta debe ser mayor a 0'
                }, status=400)
            
            from .models import Receta, Insumo, InsumoCompuesto, InsumoElaborado, InsumoReceta, InsumoCompuestoReceta, InsumoElaboradoReceta
            from django.db import transaction
            
            with transaction.atomic():
                # Crear la receta
                receta = Receta.objects.create(
                    nombre=data['nombre'].strip(),
                    descripcion=data.get('descripcion', '').strip(),
                    categoria=data.get('categoria', '').strip(),
                    costo=float(data.get('costo', 0))
                )
                
                print(f"Receta creada con ID: {receta.id}")  # Debug
                
                # Agregar insumos a la receta
                if 'insumos' in data and data['insumos']:
                    print(f"Procesando {len(data['insumos'])} insumos simples")  # Debug
                    for insumo_data in data['insumos']:
                        try:
                            insumo = Insumo.objects.get(id=insumo_data['id'])
                            InsumoReceta.objects.create(
                                receta=receta,
                                insumo=insumo,
                                cantidad=float(insumo_data['cantidad']),
                                costo=float(insumo_data['costo'])
                            )
                            print(f"Insumo agregado: {insumo.nombre}")  # Debug
                        except Insumo.DoesNotExist:
                            print(f"Insumo con ID {insumo_data['id']} no encontrado")  # Debug
                            continue
                        except (ValueError, KeyError) as e:
                            print(f"Error en datos de insumo: {e}")  # Debug
                            continue
                
                # Agregar insumos compuestos a la receta
                if 'insumos_compuestos' in data and data['insumos_compuestos']:
                    print(f"Procesando {len(data['insumos_compuestos'])} insumos compuestos")  # Debug
                    for compuesto_data in data['insumos_compuestos']:
                        try:
                            compuesto = InsumoCompuesto.objects.get(id=compuesto_data['id'])
                            InsumoCompuestoReceta.objects.create(
                                receta=receta,
                                insumo_compuesto=compuesto,
                                cantidad=float(compuesto_data['cantidad']),
                                costo=float(compuesto_data['costo'])
                            )
                            print(f"Insumo compuesto agregado: {compuesto.nombre}")  # Debug
                        except InsumoCompuesto.DoesNotExist:
                            print(f"Insumo compuesto con ID {compuesto_data['id']} no encontrado")  # Debug
                            continue
                        except (ValueError, KeyError) as e:
                            print(f"Error en datos de insumo compuesto: {e}")  # Debug
                            continue
                            
                # Agregar insumos elaborados a la receta
                if 'insumos_elaborados' in data and data['insumos_elaborados']:
                    print(f"Procesando {len(data['insumos_elaborados'])} insumos elaborados")  # Debug
                    for elaborado_data in data['insumos_elaborados']:
                        try:
                            elaborado = InsumoElaborado.objects.get(id=elaborado_data['id'])
                            InsumoElaboradoReceta.objects.create(
                                receta=receta,
                                insumo_elaborado=elaborado,
                                cantidad=float(elaborado_data['cantidad']),
                                costo=float(elaborado_data['costo'])
                            )
                            print(f"Insumo elaborado agregado: {elaborado.nombre}")  # Debug
                        except InsumoElaborado.DoesNotExist:
                            print(f"Insumo elaborado con ID {elaborado_data['id']} no encontrado")  # Debug
                            continue
                        except (ValueError, KeyError) as e:
                            print(f"Error en datos de insumo elaborado: {e}")  # Debug
                            continue
            
            return JsonResponse({
                'status': 'success',
                'message': 'Receta creada correctamente',
                'id': receta.id
            })
            
        except json.JSONDecodeError as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error en el formato de datos JSON: {str(e)}'
            }, status=400)
        except Exception as e:
            print(f"Error inesperado al crear receta: {str(e)}")  # Debug
            return JsonResponse({
                'status': 'error',
                'message': f'Error interno del servidor: {str(e)}'
            }, status=500)

@login_required
@csrf_exempt
def receta_detail(request, id):
    """Vista para obtener, actualizar o eliminar una receta específica"""
    try:
        receta = Receta.objects.prefetch_related(
            'insumos__insumo', 
            'insumos_compuestos__insumo_compuesto',
            'insumos_elaborados__insumo_elaborado'  # Añadir prefetch para insumos elaborados
        ).get(id=id)
        
        if request.method == 'GET':
            # Obtener insumos
            insumos_data = []
            for insumo_receta in receta.insumos.all():
                insumos_data.append({
                    'insumo_id': insumo_receta.insumo.id,
                    'nombre': insumo_receta.insumo.nombre,
                    'cantidad': float(insumo_receta.cantidad),
                    'unidad': insumo_receta.insumo.unidad,
                    'costo': float(insumo_receta.costo)  # Añadir costo
                })
            
            # Obtener insumos compuestos
            compuestos_data = []
            for compuesto_receta in receta.insumos_compuestos.all():
                compuestos_data.append({
                    'insumo_compuesto_id': compuesto_receta.insumo_compuesto.id,
                    'nombre': compuesto_receta.insumo_compuesto.nombre,
                    'cantidad': float(compuesto_receta.cantidad),
                    'unidad': compuesto_receta.insumo_compuesto.unidad,
                    'costo': float(compuesto_receta.costo)  # Añadir costo
                })
                
            # Obtener insumos elaborados (NUEVO)
            elaborados_data = []
            for elaborado_receta in receta.insumos_elaborados.all():
                elaborados_data.append({
                    'insumo_elaborado_id': elaborado_receta.insumo_elaborado.id,
                    'nombre': elaborado_receta.insumo_elaborado.nombre,
                    'cantidad': float(elaborado_receta.cantidad),
                    'unidad': elaborado_receta.insumo_elaborado.unidad,
                    'costo': float(elaborado_receta.costo)
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
                    'costo': float(receta.costo),  # Añadimos el campo costo (precio de venta)
                    'insumos': insumos_data,
                    'insumos_compuestos': compuestos_data,
                    'insumos_elaborados': elaborados_data
                }
            })
            
        elif request.method == 'PUT':
            # Mantener el código existente sin modificar
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
            # Mantener el código existente sin modificar
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
    """Devuelve la lista de insumos disponibles para crear recetas CON COSTOS CORRECTOS"""
    try:
        insumos = []
        
        # Obtener todos los insumos con sus costos desde InsumoProveedor
        for insumo in Insumo.objects.all():
            # Buscar el costo del insumo desde la tabla insumos_proveedores
            costo_unitario = 0.0
            
            # Primero intentar obtener del proveedor principal
            proveedor_principal = InsumoProveedor.objects.filter(
                insumo=insumo, 
                es_proveedor_principal=True
            ).first()
            
            if proveedor_principal:
                costo_unitario = float(proveedor_principal.costo_unitario)
            else:
                # Si no hay proveedor principal, tomar el primero disponible
                primer_proveedor = InsumoProveedor.objects.filter(insumo=insumo).first()
                if primer_proveedor:
                    costo_unitario = float(primer_proveedor.costo_unitario)
            
            insumos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'categoria': insumo.categoria.nombre if insumo.categoria else None,
                'stock': insumo.stock,
                'costo_unitario': costo_unitario  # COSTO OBTENIDO DE LA RELACIÓN
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
    """Devuelve la lista de insumos compuestos disponibles para crear recetas CON COSTOS CALCULADOS"""
    try:
        insumos_compuestos = []
        
        for insumo in InsumoCompuesto.objects.filter(activo=True):
            # Calcular el costo unitario del insumo compuesto
            # Costo unitario = costo_total / cantidad_producida
            costo_unitario = 0.0
            
            if insumo.cantidad and float(insumo.cantidad) > 0:
                costo_unitario = float(insumo.costo_total) / float(insumo.cantidad)
            
            # También podemos verificar el costo total calculando desde los componentes
            costo_total_componentes = ComponenteInsumoCompuesto.objects.filter(
                insumo_compuesto=insumo
            ).aggregate(
                total=Sum('costo')
            )['total'] or 0
            
            # Usar el costo total de los componentes si está disponible
            if costo_total_componentes > 0 and insumo.cantidad and float(insumo.cantidad) > 0:
                costo_unitario_componentes = float(costo_total_componentes) / float(insumo.cantidad)
                # Usar el mayor de los dos para mayor precisión
                costo_unitario = max(costo_unitario, costo_unitario_componentes)
            
            insumos_compuestos.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'categoria': insumo.categoria,
                'descripcion': insumo.descripcion,
                'cantidad': float(insumo.cantidad),
                'costo_total': float(insumo.costo_total),
                'costo_unitario': costo_unitario,  # COSTO CALCULADO CORRECTAMENTE
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

@login_required
def obtener_insumos_elaborados_para_recetas(request):
    """Devuelve la lista de insumos elaborados disponibles para crear recetas"""
    try:
        from .models import InsumoElaborado
        
        insumos_elaborados = []
        for insumo in InsumoElaborado.objects.filter(activo=True):
            # Calcular costo unitario (si hay cantidad producida)
            costo_unitario = 0
            if insumo.cantidad and float(insumo.cantidad) > 0:
                costo_unitario = float(insumo.costo_total) / float(insumo.cantidad)
            
            insumos_elaborados.append({
                'id': insumo.id,
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'categoria': insumo.categoria,
                'cantidad': float(insumo.cantidad),
                'costo_total': float(insumo.costo_total),
                'costo_unitario': costo_unitario
            })
        
        return JsonResponse({
            'status': 'success',
            'insumos_elaborados': insumos_elaborados
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)