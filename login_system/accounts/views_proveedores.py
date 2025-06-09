import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Proveedor, InsumoProveedor, Insumo
from decimal import Decimal, InvalidOperation

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
                del data['id']  # Remover ID si viene en los datos
                
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
                    'message': 'Se requiere ID para actualizar'
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
        errores = []
        
        for insumo_info in insumos_data:
            try:
                # Verificar si tenemos los campos necesarios
                if 'insumo_id' not in insumo_info:
                    errores.append(f"Falta el ID del insumo en un elemento")
                    continue
                    
                if 'costo_unitario' not in insumo_info:
                    errores.append(f"Falta el costo unitario para el insumo {insumo_info.get('insumo_id')}")
                    continue
                
                # Validar que el costo sea mayor que cero
                try:
                    costo = Decimal(str(insumo_info['costo_unitario']))
                    if costo <= 0:
                        errores.append(f"El costo debe ser mayor que cero para el insumo {insumo_info['insumo_id']}")
                        continue
                except (InvalidOperation, ValueError):
                    errores.append(f"Costo inválido para el insumo {insumo_info['insumo_id']}")
                    continue
                
                # Buscar el insumo
                try:
                    insumo = Insumo.objects.get(id=insumo_info['insumo_id'])
                except Insumo.DoesNotExist:
                    errores.append(f"Insumo con ID {insumo_info['insumo_id']} no encontrado")
                    continue
                 
                es_principal = insumo_info.get('es_principal', False)
                
                # Crear o actualizar la relación
                relacion, created = InsumoProveedor.objects.update_or_create(
                    insumo=insumo,
                    proveedor=proveedor,
                    defaults={
                        'costo_unitario': costo,
                        'es_proveedor_principal': es_principal
                    }
                )
                
                insumos_asignados += 1
                   
            except Exception as e:
                print(f"Error procesando insumo {insumo_info}: {str(e)}")
                errores.append(f"Error al procesar insumo: {str(e)}")
                continue
        
        if insumos_asignados > 0:
            mensaje_respuesta = f'Se asignaron {insumos_asignados} insumos al proveedor {proveedor.nombre}'
            if errores:
                mensaje_respuesta += f', pero hubo {len(errores)} errores'
                
            return JsonResponse({
                'status': 'success',
                'message': mensaje_respuesta,
                'insumos_asignados': insumos_asignados,
                'errores': errores
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'No se pudo asignar ningún insumo',
                'errores': errores
            }, status=400)
            
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