from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db import models  # ¡Añadir esta importación!
from decimal import Decimal
from django.db import transaction
import json
from datetime import datetime

from .models import (
    InsumoCompuesto, InsumoElaborado,
    Sucursal, User
)

# Modelo para Movimientos de Insumos
class MovimientoInsumos(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    
    TIPO_INSUMO_CHOICES = [
        ('compuesto', 'Insumo Compuesto'),
        ('elaborado', 'Insumo Elaborado'),
    ]
    
    MOTIVO_CHOICES = [
        ('produccion', 'Producción'),
        ('ajuste_inventario', 'Ajuste de inventario'),
        ('traspaso', 'Traspaso entre sucursales'),
        ('caducidad', 'Caducidad'),
        ('consumo_interno', 'Consumo interno'),
        ('venta', 'Venta'),
        ('merma', 'Merma'),
        ('otro', 'Otro'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    tipo_insumo = models.CharField(max_length=20, choices=TIPO_INSUMO_CHOICES)
    
    # Referencias que pueden ser nulas dependiendo del tipo
    insumo_compuesto = models.ForeignKey(
        InsumoCompuesto, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='movimientos'
    )
    insumo_elaborado = models.ForeignKey(
        InsumoElaborado, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='movimientos'
    )
    
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad = models.CharField(max_length=50)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    motivo = models.CharField(max_length=100, choices=MOTIVO_CHOICES)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    
    # Para traspasos entre sucursales
    sucursal_destino = models.ForeignKey(
        Sucursal, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='traspasos_insumos_destino'
    )
    
    estado = models.CharField(
        max_length=20, 
        choices=[('activo', 'Activo'), ('cancelado', 'Cancelado')], 
        default='activo'
    )
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(tipo_insumo='compuesto', insumo_compuesto__isnull=False, insumo_elaborado__isnull=True) | 
                    models.Q(tipo_insumo='elaborado', insumo_elaborado__isnull=False, insumo_compuesto__isnull=True)
                ),
                name='movimiento_solo_un_tipo_insumo'
            )
        ]

@login_required
@csrf_exempt
def movimientos_insumos_crud(request):
    """Vista para CRUD de movimientos de insumos compuestos o elaborados"""
    
    if request.method == 'GET':
        # Listar movimientos (con filtros opcionales)
        try:
            movimientos = MovimientoInsumos.objects.select_related(
                'insumo_compuesto', 
                'insumo_elaborado', 
                'sucursal', 
                'usuario'
            ).order_by('-fecha_hora')
            
            # Aplicar filtros si existen
            tipo = request.GET.get('tipo')
            if tipo:
                movimientos = movimientos.filter(tipo=tipo)
                
            tipo_insumo = request.GET.get('tipo_insumo')
            if tipo_insumo:
                movimientos = movimientos.filter(tipo_insumo=tipo_insumo)
                
            sucursal_id = request.GET.get('sucursal_id')
            if sucursal_id:
                movimientos = movimientos.filter(sucursal_id=sucursal_id)
            
            # Convertir a formato de respuesta
            movimientos_data = []
            for m in movimientos:
                insumo_nombre = ""
                if m.insumo_compuesto:
                    insumo_nombre = m.insumo_compuesto.nombre
                elif m.insumo_elaborado:
                    insumo_nombre = m.insumo_elaborado.nombre
                
                movimientos_data.append({
                    'id': m.id,
                    'tipo': m.tipo,
                    'tipo_insumo': m.tipo_insumo,
                    'insumo_id': m.insumo_compuesto_id if m.tipo_insumo == 'compuesto' else m.insumo_elaborado_id,
                    'insumo_nombre': insumo_nombre,
                    'cantidad': str(m.cantidad),
                    'unidad': m.unidad,
                    'fecha_hora': m.fecha_hora.isoformat(),
                    'motivo': m.motivo,
                    'sucursal_id': m.sucursal_id,
                    'sucursal_nombre': m.sucursal.nombre,
                    'usuario_id': m.usuario_id,
                    'usuario_nombre': f"{m.usuario.first_name} {m.usuario.last_name}".strip() or m.usuario.username,
                    'costo_unitario': str(m.costo_unitario) if m.costo_unitario else None,
                    'observaciones': m.observaciones,
                    'sucursal_destino_id': m.sucursal_destino_id,
                    'sucursal_destino_nombre': m.sucursal_destino.nombre if m.sucursal_destino else None,
                    'estado': m.estado
                })
            
            return JsonResponse({
                'status': 'success',
                'movimientos': movimientos_data
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error al cargar movimientos: {str(e)}'
            }, status=500)
    
    elif request.method == 'POST':
        # Crear un nuevo movimiento
        try:
            data = json.loads(request.body)
            
            with transaction.atomic():
                # Validar datos básicos
                tipo = data.get('tipo')
                tipo_insumo = data.get('tipo_insumo')
                sucursal_id = data.get('sucursal_id')
                insumo_id = data.get('insumo_id')
                cantidad = Decimal(data.get('cantidad', '0'))
                motivo = data.get('motivo')
                
                if not all([tipo, tipo_insumo, sucursal_id, insumo_id, cantidad > 0, motivo]):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Faltan datos requeridos o son inválidos'
                    }, status=400)
                
                # Obtener objetos relacionados
                try:
                    sucursal = Sucursal.objects.get(id=sucursal_id)
                except Sucursal.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'La sucursal especificada no existe'
                    }, status=404)
                
                # Inicializar variables de insumo
                insumo_compuesto = None
                insumo_elaborado = None
                unidad = data.get('unidad', '')
                
                # Obtener el insumo según el tipo
                if tipo_insumo == 'compuesto':
                    try:
                        insumo_compuesto = InsumoCompuesto.objects.get(id=insumo_id)
                        unidad = unidad or insumo_compuesto.unidad
                    except InsumoCompuesto.DoesNotExist:
                        return JsonResponse({
                            'status': 'error',
                            'message': 'El insumo compuesto especificado no existe'
                        }, status=404)
                elif tipo_insumo == 'elaborado':
                    try:
                        insumo_elaborado = InsumoElaborado.objects.get(id=insumo_id)
                        unidad = unidad or insumo_elaborado.unidad
                    except InsumoElaborado.DoesNotExist:
                        return JsonResponse({
                            'status': 'error',
                            'message': 'El insumo elaborado especificado no existe'
                        }, status=404)
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Tipo de insumo inválido'
                    }, status=400)
                
                # Validar datos adicionales según el tipo de movimiento
                sucursal_destino = None
                if motivo == 'traspaso':
                    sucursal_destino_id = data.get('sucursal_destino_id')
                    if not sucursal_destino_id:
                        return JsonResponse({
                            'status': 'error',
                            'message': 'Se requiere una sucursal de destino para traspasos'
                        }, status=400)
                    
                    try:
                        sucursal_destino = Sucursal.objects.get(id=sucursal_destino_id)
                    except Sucursal.DoesNotExist:
                        return JsonResponse({
                            'status': 'error',
                            'message': 'La sucursal de destino no existe'
                        }, status=404)
                
                # Crear el movimiento
                movimiento = MovimientoInsumos(
                    tipo=tipo,
                    tipo_insumo=tipo_insumo,
                    insumo_compuesto=insumo_compuesto,
                    insumo_elaborado=insumo_elaborado,
                    cantidad=cantidad,
                    unidad=unidad,
                    motivo=motivo,
                    sucursal=sucursal,
                    usuario=request.user,
                    costo_unitario=Decimal(data.get('costo_unitario', '0')) if tipo == 'entrada' else None,
                    observaciones=data.get('observaciones', ''),
                    sucursal_destino=sucursal_destino
                )
                
                movimiento.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Movimiento registrado correctamente',
                    'id': movimiento.id
                })
                
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error al registrar movimiento: {str(e)}'
            }, status=500)
    
    elif request.method == 'DELETE':
        # Lógica para cancelar un movimiento, no eliminarlo físicamente
        try:
            data = json.loads(request.body)
            movimiento_id = data.get('id')
            
            if not movimiento_id:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Se requiere el ID del movimiento'
                }, status=400)
            
            try:
                movimiento = MovimientoInsumos.objects.get(id=movimiento_id)
                movimiento.estado = 'cancelado'
                movimiento.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Movimiento cancelado correctamente'
                })
            except MovimientoInsumos.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'El movimiento especificado no existe'
                }, status=404)
                
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error al cancelar el movimiento: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'status': 'error',
        'message': 'Método no permitido'
    }, status=405)