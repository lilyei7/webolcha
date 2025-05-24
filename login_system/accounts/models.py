from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal

class User(AbstractUser):
    last_login_attempt = models.DateTimeField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.'
    )
    
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.'
    )

    class Meta:
        db_table = 'users'

class Sucursal(models.Model):
    nombre = models.CharField(max_length=100)
    codigo_interno = models.CharField(max_length=20, unique=True, default='')
    direccion = models.CharField(max_length=255)
    ciudad_estado = models.CharField(max_length=100, default='')
    locacion = models.CharField(max_length=255, default='', blank=True)  # NUEVO CAMPO
    telefono = models.CharField(max_length=100)
    zona_horaria = models.CharField(max_length=50, default='America/Mexico_City')
    gerente = models.CharField(max_length=100)
    entrega_domicilio = models.BooleanField(default=False)
    numero_mesas = models.IntegerField(default=0)
    capacidad_comensales = models.IntegerField(default=0)
    meta_diaria = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        null=True  # Añadir esto para manejar valores nulos
    )
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sucursales'

class Proveedor(models.Model):
    FORMA_PAGO_CHOICES = [
        ('Efectivo', 'Efectivo'),
        ('Transferencia', 'Transferencia'),
        ('Crédito', 'Crédito'),
    ]
    
    nombre = models.CharField(max_length=100, verbose_name="Nombre Comercial")
    razon_social = models.CharField(max_length=200, blank=True, null=True, verbose_name="Razón Social")
    rfc = models.CharField(max_length=20, blank=True, null=True, verbose_name="RFC")
    direccion = models.CharField(max_length=255, verbose_name="Dirección")
    ciudad_estado = models.CharField(max_length=100, default='', verbose_name="Ciudad/Estado")
    telefono = models.CharField(max_length=100, verbose_name="Teléfono")
    email = models.EmailField(max_length=100, blank=True, null=True, verbose_name="Correo electrónico")
    contacto = models.CharField(max_length=100, blank=True, null=True, verbose_name="Persona de contacto")
    forma_pago_preferida = models.CharField(max_length=20, choices=FORMA_PAGO_CHOICES, default='Transferencia', verbose_name="Forma de pago preferida")
    dias_credito = models.PositiveIntegerField(blank=True, null=True, verbose_name="Días de crédito")
    categoria = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tipo de productos/servicios")
    notas = models.TextField(blank=True, null=True, verbose_name="Observaciones")
    activo = models.BooleanField(default=True, verbose_name="Estatus")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de alta")
    
    class Meta:
        db_table = 'proveedores'
        ordering = ['nombre']
        
    def __str__(self):
        return self.nombre

class HorarioSucursal(models.Model):
    sucursal = models.ForeignKey(
        'Sucursal', 
        on_delete=models.CASCADE,
        related_name='horarios'
    )
    dia = models.CharField(max_length=20)
    hora_apertura = models.TimeField(null=True, blank=True)
    hora_cierre = models.TimeField(null=True, blank=True)
    esta_abierto = models.BooleanField(default=True)

    class Meta:
        unique_together = ('sucursal', 'dia')
        ordering = ['dia']

    def __str__(self):
        return f"{self.sucursal.nombre} - {self.dia}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('user_created', 'Usuario Creado'),
        ('user_updated', 'Usuario Actualizado'),
        ('user_deleted', 'Usuario Eliminado'),
        ('sucursal_created', 'Sucursal Creada'),
        ('sucursal_updated', 'Sucursal Actualizada'),
        ('sucursal_deleted', 'Sucursal Eliminada'),
        ('login', 'Inicio de Sesión'),
        ('system', 'Sistema'),
    )

    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    icon = models.CharField(max_length=50)  # Para FontAwesome icons
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')

    class Meta:
        ordering = ['-created_at']
        db_table = 'notifications'

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    icono = models.CharField(max_length=50, default='fa-cube')  # Para FontAwesome icons
    color_fondo = models.CharField(max_length=20, default='#f3f4f6')  # Color de fondo del icono
    color_icono = models.CharField(max_length=20, default='#374151')  # Color del icono
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categorias'
        ordering = ['nombre']
        
    def __str__(self):
        return self.nombre

class Insumo(models.Model):
    TIPOS = (
        ('Materia Prima', 'Materia Prima'),
        ('Producto Terminado', 'Producto Terminado'),
        ('Insumo', 'Insumo'),
    )

    nombre = models.CharField(max_length=100)
    unidad = models.CharField(max_length=50)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.PROTECT,
        related_name='insumos'
    )
    tipo = models.CharField(max_length=50, choices=TIPOS)
    stock = models.IntegerField(default=0)
    minimo = models.IntegerField(default=0)
    
    # Nueva relación muchos a muchos con Proveedor
    proveedores = models.ManyToManyField(
        'Proveedor',
        through='InsumoProveedor',
        related_name='insumos',
        blank=True
    )

    class Meta:
        db_table = 'insumos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class InsumoProveedor(models.Model):
    insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)
    costo_unitario = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Costo unitario del insumo con este proveedor"
    )
    es_proveedor_principal = models.BooleanField(
        default=False,
        help_text="Indica si este es el proveedor principal para este insumo"
    )
    ultima_compra = models.DateField(null=True, blank=True)
    notas = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'insumos_proveedores'
        unique_together = ('insumo', 'proveedor')
        verbose_name = 'Relación Insumo-Proveedor'
        verbose_name_plural = 'Relaciones Insumo-Proveedor'

    def __str__(self):
        return f"{self.insumo.nombre} - {self.proveedor.nombre}"

class InsumoCompuesto(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50)
    unidad = models.CharField(max_length=50)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'insumos_compuestos'
        ordering = ['nombre']
        
    def __str__(self):
        return self.nombre

class ComponenteInsumoCompuesto(models.Model):
    insumo_compuesto = models.ForeignKey(
        InsumoCompuesto, 
        on_delete=models.CASCADE,
        related_name='componentes'
    )
    insumo = models.ForeignKey(
        Insumo, 
        on_delete=models.PROTECT,
        related_name='usado_en_compuestos'
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'componentes_insumo_compuesto'

class Receta(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=50)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'recetas'
        ordering = ['nombre']
        
    def __str__(self):
        return self.nombre

class InsumoReceta(models.Model):
    receta = models.ForeignKey(
        'Receta', 
        on_delete=models.CASCADE,
        related_name='insumos'
    )
    insumo = models.ForeignKey(
        'Insumo', 
        on_delete=models.PROTECT,
        related_name='usado_en_recetas'
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'insumos_receta'
        unique_together = ('receta', 'insumo')
        
    def __str__(self):
        return f"{self.receta.nombre} - {self.insumo.nombre}"

class InsumoCompuestoReceta(models.Model):
    receta = models.ForeignKey(
        'Receta', 
        on_delete=models.CASCADE,
        related_name='insumos_compuestos'
    )
    insumo_compuesto = models.ForeignKey(
        'InsumoCompuesto', 
        on_delete=models.PROTECT,
        related_name='usado_en_recetas'
    )
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    costo = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'insumos_compuestos_receta'
        unique_together = ('receta', 'insumo_compuesto')
        
    def __str__(self):
        return f"{self.receta.nombre} - {self.insumo_compuesto.nombre}"
