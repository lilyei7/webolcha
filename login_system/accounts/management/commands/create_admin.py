from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from accounts.models import Sucursal

User = get_user_model()

class Command(BaseCommand):
    help = 'Crea un superusuario con el rol de Administrador correctamente configurado'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True, help='Nombre de usuario')
        parser.add_argument('--email', required=True, help='Correo electrónico')
        parser.add_argument('--password', required=True, help='Contraseña')
        parser.add_argument('--nombre', required=False, help='Nombre completo')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        nombre = options.get('nombre', '')

        # Comprobar si el usuario ya existe
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'El usuario {username} ya existe'))
            return

        # Crear el superusuario
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )

        # Asignar nombre si se proporciona
        if nombre:
            if ' ' in nombre:
                first, *last = nombre.split(' ')
                user.first_name = first
                user.last_name = ' '.join(last)
            else:
                user.first_name = nombre

        # Asegurar que exista el grupo Administrador
        admin_group, _ = Group.objects.get_or_create(name='Administrador')
        
        # Asignar grupo Administrador
        user.groups.add(admin_group)
        
        # Asignar todas las sucursales
        sucursales = Sucursal.objects.all()
        if sucursales.exists():
            user.sucursales.set(sucursales)
            self.stdout.write(f'Asignadas {sucursales.count()} sucursales al administrador')
        
        user.save()
        
        self.stdout.write(self.style.SUCCESS(f'Superadministrador {username} creado exitosamente'))