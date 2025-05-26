import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Categoria

@login_required
@csrf_exempt
def categorias_crud(request):
    if request.method == 'GET':
        try:
            categorias = []
            for categoria in Categoria.objects.all():
                categorias.append({
                    'id': categoria.id,
                    'nombre': categoria.nombre,
                    'descripcion': categoria.descripcion,
                    'icono': categoria.icono,
                    'color_fondo': categoria.color_fondo,
                    'color_icono': categoria.color_icono,
                    'activa': categoria.activa
                })
            return JsonResponse({'status': 'success', 'categorias': categorias})
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            categoria = Categoria.objects.create(
                nombre=data['nombre'],
                descripcion=data.get('descripcion', ''),
                icono=data.get('icono', 'fa-cube'),
                color_fondo=data.get('color_fondo', '#f3f4f6'),
                color_icono=data.get('color_icono', '#374151')
            )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Categoría creada exitosamente',
                'categoria': {
                    'id': categoria.id,
                    'nombre': categoria.nombre,
                    'descripcion': categoria.descripcion,
                    'icono': categoria.icono,
                    'color_fondo': categoria.color_fondo,
                    'color_icono': categoria.color_icono,
                    'activa': categoria.activa,
                    'fecha_creacion': categoria.fecha_creacion.isoformat()
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
            categoria = Categoria.objects.get(id=data['id'])
            
            categoria.nombre = data.get('nombre', categoria.nombre)
            categoria.descripcion = data.get('descripcion', categoria.descripcion)
            categoria.icono = data.get('icono', categoria.icono)
            categoria.color_fondo = data.get('color_fondo', categoria.color_fondo)
            categoria.color_icono = data.get('color_icono', categoria.color_icono)
            categoria.activa = data.get('activa', categoria.activa)
            
            categoria.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Categoría actualizada exitosamente'
            })
        except Categoria.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Categoría no encontrada'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            categoria = Categoria.objects.get(id=data['id'])
            categoria.delete()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Categoría eliminada exitosamente'
            })
        except Categoria.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Categoría no encontrada'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)