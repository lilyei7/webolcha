from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json

@login_required
def notifications_api(request):
    """API para obtener notificaciones del usuario actual."""
    if request.method == 'GET':
        try:
            # Datos de ejemplo - Después los reemplazaremos con datos reales
            notifications = [
                {
                    'id': 1,
                    'type': 'user_created',
                    'title': 'Nuevo Usuario',
                    'message': 'Juan Pérez se ha unido al sistema',
                    'icon': 'fa-user-plus',
                    'created_at': timezone.now(),
                    'read': False
                },
                {
                    'id': 2,
                    'type': 'sucursal_created',
                    'title': 'Nueva Sucursal',
                    'message': 'Se ha creado la sucursal "Plaza Mayor"',
                    'icon': 'fa-building',
                    'created_at': timezone.now() - timezone.timedelta(hours=2),
                    'read': False
                },
                {
                    'id': 3,
                    'type': 'system',
                    'title': 'Actualización del Sistema',
                    'message': 'El sistema se actualizará esta noche a las 3 AM',
                    'icon': 'fa-gear',
                    'created_at': timezone.now() - timezone.timedelta(days=1),
                    'read': False
                },
                {
                    'id': 4,
                    'type': 'login',
                    'title': 'Nuevo Inicio de Sesión',
                    'message': 'Se detectó un inicio de sesión desde un nuevo dispositivo',
                    'icon': 'fa-shield-alt',
                    'created_at': timezone.now() - timezone.timedelta(hours=5),
                    'read': True
                },
                {
                    'id': 5,
                    'type': 'sucursal_updated',
                    'title': 'Sucursal Actualizada',
                    'message': 'Se actualizaron los horarios de "Centro Comercial"',
                    'icon': 'fa-clock',
                    'created_at': timezone.now() - timezone.timedelta(hours=8),
                    'read': True
                }
            ]

            return JsonResponse({
                'status': 'success',
                'unread_count': len([n for n in notifications if not n['read']]),
                'notifications': notifications
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'Método no permitido'
        }, status=405)

@login_required
@csrf_exempt
def mark_notifications_read(request):
    """Marcar notificaciones como leídas."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            notification_ids = data.get('notification_ids', [])
            
            if notification_ids == 'all':
                # Marcar todas como leídas
                # Aquí iría la lógica para marcar todas las notificaciones como leídas
                return JsonResponse({
                    'status': 'success',
                    'message': 'Todas las notificaciones han sido marcadas como leídas'
                })
            else:
                # Marcar solo las especificadas
                # Aquí iría la lógica para marcar notificaciones específicas como leídas
                return JsonResponse({
                    'status': 'success',
                    'message': f'Se han marcado {len(notification_ids)} notificaciones como leídas'
                })
                
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'Método no permitido'
        }, status=405)