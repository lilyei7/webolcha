from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from decimal import Decimal, InvalidOperation
import json
from .models import Insumo, InsumoCompuesto, InsumoElaborado, IngredienteInsumoElaborado, InsumoProveedor
from django.db import transaction
from django.db.models import Q

def safe_decimal(value):
    """Función auxiliar para manejar conversiones seguras a Decimal"""
    if value is None:
        return Decimal('0.00')
    try:
        return Decimal(str(value)).quantize(Decimal('0.01'))
    except (InvalidOperation, TypeError):
        return Decimal('0.00')

@login_required
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def insumos_elaborados_crud(request):
    """
    Vista para manejar operaciones CRUD de insumos elaborados.
    """
    if request.method == 'GET':
        # Obtener todos los insumos elaborados activos
        insumos_elaborados = InsumoElaborado.objects.filter(activo=True)
        
        result = []
        for insumo in insumos_elaborados:
            # Preparar la lista de ingredientes para cada insumo
            ingredientes_list = []
            
            for ingrediente in insumo.ingredientes.all():
                # Determinar si es un insumo normal o compuesto
                nombre_ingrediente = ""
                insumo_id = None
                unidad = ""
                
                if ingrediente.insumo:
                    nombre_ingrediente = ingrediente.insumo.nombre
                    insumo_id = ingrediente.insumo.id
                    unidad = ingrediente.insumo.unidad
                    tipo = 'insumo'
                else:
                    nombre_ingrediente = ingrediente.insumo_compuesto.nombre
                    insumo_id = ingrediente.insumo_compuesto.id
                    unidad = ingrediente.insumo_compuesto.unidad
                    tipo = 'insumo_compuesto'
                
                ingredientes_list.append({
                    'insumo_id': insumo_id,
                    'insumo': nombre_ingrediente,
                    'unidad': unidad,
                    'cantidad': float(ingrediente.cantidad),
                    'costo': float(ingrediente.costo),
                    'tipo': tipo
                })
            
            # Preparar la estructura de datos del insumo elaborado
            insumo_data = {
                'id': insumo.id,
                'nombre': insumo.nombre,
                'categoria': insumo.categoria,
                'unidad': insumo.unidad,
                'cantidad': float(insumo.cantidad),
                'costo_total': float(insumo.costo_total),
                'descripcion': insumo.descripcion or '',
                'tiempo_preparacion': insumo.tiempo_preparacion,
                'metodo_preparacion': insumo.metodo_preparacion or '',
                'ingredientes': ingredientes_list
            }
            
            result.append(insumo_data)
        
        return JsonResponse({
            'status': 'success',
            'insumos_elaborados': result
        })
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            with transaction.atomic():
                # Crear el insumo elaborado
                insumo_elaborado = InsumoElaborado.objects.create(
                    nombre=data['nombre'],
                    categoria=data['categoria'],
                    unidad=data['unidad'],
                    cantidad=safe_decimal(data['cantidad']),
                    costo_total=safe_decimal(data['costo_total']),
                    descripcion=data.get('descripcion', ''),
                    tiempo_preparacion=data.get('tiempo_preparacion', 0),
                    metodo_preparacion=data.get('metodo_preparacion', '')
                )
                
                # Procesar los ingredientes
                for ing_data in data.get('ingredientes', []):
                    # Determinar si es insumo normal o compuesto
                    insumo_id = ing_data.get('insumo_id')
                    cantidad = safe_decimal(ing_data.get('cantidad', 0))
                    costo = safe_decimal(ing_data.get('costo', 0))
                    tipo = ing_data.get('tipo', 'insumo')  # Por defecto es insumo normal
                    
                    if tipo == 'insumo':
                        # Es un insumo normal
                        IngredienteInsumoElaborado.objects.create(
                            insumo_elaborado=insumo_elaborado,
                            insumo_id=insumo_id,
                            cantidad=cantidad,
                            costo=costo
                        )
                    else:
                        # Es un insumo compuesto
                        IngredienteInsumoElaborado.objects.create(
                            insumo_elaborado=insumo_elaborado,
                            insumo_compuesto_id=insumo_id,
                            cantidad=cantidad,
                            costo=costo
                        )
            
            # Responder con éxito
            return JsonResponse({
                'status': 'success',
                'message': 'Insumo elaborado creado correctamente',
                'id': insumo_elaborado.id
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            insumo_id = data.get('id')
            
            if not insumo_id:
                return JsonResponse({
                    'status': 'error',
                    'message': 'ID de insumo elaborado no proporcionado'
                }, status=400)
            
            with transaction.atomic():
                # Obtener el insumo elaborado
                try:
                    insumo_elaborado = InsumoElaborado.objects.get(id=insumo_id)
                except InsumoElaborado.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': f'Insumo elaborado con ID {insumo_id} no encontrado'
                    }, status=404)
                
                # Actualizar campos básicos
                insumo_elaborado.nombre = data['nombre']
                insumo_elaborado.categoria = data['categoria']
                insumo_elaborado.unidad = data['unidad']
                insumo_elaborado.cantidad = safe_decimal(data['cantidad'])
                insumo_elaborado.costo_total = safe_decimal(data['costo_total'])
                insumo_elaborado.descripcion = data.get('descripcion', '')
                insumo_elaborado.tiempo_preparacion = data.get('tiempo_preparacion', 0)
                insumo_elaborado.metodo_preparacion = data.get('metodo_preparacion', '')
                insumo_elaborado.save()
                
                # Eliminar ingredientes existentes
                insumo_elaborado.ingredientes.all().delete()
                
                # Crear nuevos ingredientes
                for ing_data in data.get('ingredientes', []):
                    # Determinar si es insumo normal o compuesto
                    insumo_id = ing_data.get('insumo_id')
                    cantidad = safe_decimal(ing_data.get('cantidad', 0))
                    costo = safe_decimal(ing_data.get('costo', 0))
                    tipo = ing_data.get('tipo', 'insumo')  # Por defecto es insumo normal
                    
                    if tipo == 'insumo':
                        # Es un insumo normal
                        IngredienteInsumoElaborado.objects.create(
                            insumo_elaborado=insumo_elaborado,
                            insumo_id=insumo_id,
                            cantidad=cantidad,
                            costo=costo
                        )
                    else:
                        # Es un insumo compuesto
                        IngredienteInsumoElaborado.objects.create(
                            insumo_elaborado=insumo_elaborado,
                            insumo_compuesto_id=insumo_id,
                            cantidad=cantidad,
                            costo=costo
                        )
            
            return JsonResponse({
                'status': 'success',
                'message': f'Insumo elaborado {insumo_id} actualizado correctamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            insumo_id = data.get('id')
            
            if not insumo_id:
                return JsonResponse({
                    'status': 'error',
                    'message': 'ID de insumo elaborado no proporcionado'
                }, status=400)
                
            try:
                insumo = InsumoElaborado.objects.get(id=insumo_id)
                insumo.activo = False  # Borrado lógico
                insumo.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': f'Insumo elaborado {insumo_id} eliminado correctamente'
                })
            except InsumoElaborado.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Insumo elaborado con ID {insumo_id} no encontrado'
                }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

@login_required
@require_http_methods(["GET"])
def obtener_insumos_para_elaborado(request):
    """
    Vista para obtener la lista de insumos disponibles para crear insumos elaborados
    """
    try:
        # Obtener insumos normales
        insumos = Insumo.objects.all()
        
        insumos_data = []
        
        # Agregar insumos normales
        for insumo in insumos:
            # Obtener el costo desde la tabla InsumoProveedor
            try:
                # Primero intenta encontrar un proveedor principal
                proveedor_principal = InsumoProveedor.objects.filter(
                    insumo=insumo, 
                    es_proveedor_principal=True
                ).first()
                
                # Si no hay proveedor principal, toma el primero disponible
                if not proveedor_principal:
                    proveedor_principal = InsumoProveedor.objects.filter(
                        insumo=insumo
                    ).first()
                
                costo_estimado = float(proveedor_principal.costo_unitario) if proveedor_principal else 0.00
                
            except Exception as e:
                print(f"Error al obtener costo para insumo {insumo.id} - {insumo.nombre}: {str(e)}")
                costo_estimado = 0.00
            
            insumos_data.append({
                'id': insumo.id, 
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'costo_estimado': costo_estimado,
                'tipo': 'insumo'
            })
        
        return JsonResponse({
            'status': 'success',
            'insumos': insumos_data
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@require_http_methods(["GET"])
def obtener_insumos_compuestos_para_elaborado(request):
    """
    Vista para obtener la lista de insumos compuestos disponibles para crear insumos elaborados
    """
    try:
        # Obtener insumos compuestos activos
        insumos_compuestos = InsumoCompuesto.objects.filter(activo=True)
        
        insumos_data = []
        
        # Agregar insumos compuestos
        for insumo in insumos_compuestos:
            insumos_data.append({
                'id': insumo.id, 
                'nombre': insumo.nombre,
                'unidad': insumo.unidad,
                'costo_estimado': float(insumo.costo_total / insumo.cantidad) 
                    if insumo.cantidad > 0
                    else float(insumo.costo_total),
                'tipo': 'insumo_compuesto'
            })
        
        return JsonResponse({
            'status': 'success',
            'insumos_compuestos': insumos_data
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
def insumo_elaborado_detail(request, id):
    """
    Vista para manejar operaciones sobre un insumo elaborado específico
    """
    if request.method == 'GET':
        try:
            try:
                insumo = InsumoElaborado.objects.get(id=id, activo=True)
            except InsumoElaborado.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Insumo elaborado con ID {id} no encontrado'
                }, status=404)
            
            # Preparar la lista de ingredientes
            ingredientes_list = []
            
            for ingrediente in insumo.ingredientes.all():
                # Determinar si es un insumo normal o compuesto
                nombre_ingrediente = ""
                insumo_id = None
                unidad = ""
                
                if ingrediente.insumo:
                    nombre_ingrediente = ingrediente.insumo.nombre
                    insumo_id = ingrediente.insumo.id
                    unidad = ingrediente.insumo.unidad
                    tipo = 'insumo'
                else:
                    nombre_ingrediente = ingrediente.insumo_compuesto.nombre
                    insumo_id = ingrediente.insumo_compuesto.id
                    unidad = ingrediente.insumo_compuesto.unidad
                    tipo = 'insumo_compuesto'
                
                ingredientes_list.append({
                    'insumo_id': insumo_id,
                    'insumo': nombre_ingrediente,
                    'unidad': unidad,
                    'cantidad': float(ingrediente.cantidad),
                    'costo': float(ingrediente.costo),
                    'tipo': tipo
                })
            
            # Preparar la estructura de datos del insumo elaborado
            insumo_data = {
                'id': insumo.id,
                'nombre': insumo.nombre,
                'categoria': insumo.categoria,
                'unidad': insumo.unidad,
                'cantidad': float(insumo.cantidad),
                'costo_total': float(insumo.costo_total),
                'descripcion': insumo.descripcion or '',
                'tiempo_preparacion': insumo.tiempo_preparacion,
                'metodo_preparacion': insumo.metodo_preparacion or '',
                'ingredientes': ingredientes_list
            }
            
            return JsonResponse({
                'status': 'success',
                'insumo_elaborado': insumo_data
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'PUT':
        # Esta lógica ya está en insumos_elaborados_crud para el método PUT
        # Redirigimos la llamada
        return insumos_elaborados_crud(request)
            
    elif request.method == 'DELETE':
        try:
            try:
                insumo = InsumoElaborado.objects.get(id=id)
                insumo.activo = False  # Borrado lógico
                insumo.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': f'Insumo elaborado {id} eliminado correctamente'
                })
            except InsumoElaborado.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Insumo elaborado con ID {id} no encontrado'
                }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)