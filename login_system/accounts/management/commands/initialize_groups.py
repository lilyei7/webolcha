from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.db import transaction

class Command(BaseCommand):
    help = 'Inicializa los grupos básicos del sistema'

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            # Crear grupos si no existen
            grupos = ['Administrador', 'Gerente', 'Empleado']
            for nombre in grupos:
                group, created = Group.objects.get_or_create(name=nombre)
                status = 'creado' if created else 'ya existía'
                self.stdout.write(f"Grupo '{nombre}': {status}")

        self.stdout.write(self.style.SUCCESS('Grupos inicializados exitosamente'))