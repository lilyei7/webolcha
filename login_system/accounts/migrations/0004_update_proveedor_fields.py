from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),  # Fix: reference the actual existing migration
    ]

    operations = [
        migrations.AddField(
            model_name='proveedor',
            name='razon_social',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Razón Social'),
        ),
        migrations.AddField(
            model_name='proveedor',
            name='rfc',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='RFC'),
        ),
        migrations.AddField(
            model_name='proveedor',
            name='forma_pago_preferida',
            field=models.CharField(choices=[('Efectivo', 'Efectivo'), ('Transferencia', 'Transferencia'), ('Crédito', 'Crédito')], default='Transferencia', max_length=20, verbose_name='Forma de pago preferida'),
        ),
        migrations.AddField(
            model_name='proveedor',
            name='dias_credito',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Días de crédito'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='nombre',
            field=models.CharField(max_length=100, verbose_name='Nombre Comercial'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='direccion',
            field=models.CharField(max_length=255, verbose_name='Dirección'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='ciudad_estado',
            field=models.CharField(default='', max_length=100, verbose_name='Ciudad/Estado'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='telefono',
            field=models.CharField(max_length=100, verbose_name='Teléfono'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='email',
            field=models.EmailField(blank=True, max_length=100, null=True, verbose_name='Correo electrónico'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='contacto',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Persona de contacto'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='categoria',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Tipo de productos/servicios'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='notas',
            field=models.TextField(blank=True, null=True, verbose_name='Observaciones'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='activo',
            field=models.BooleanField(default=True, verbose_name='Estatus'),
        ),
        migrations.AlterField(
            model_name='proveedor',
            name='fecha_creacion',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Fecha de alta'),
        ),
    ]
