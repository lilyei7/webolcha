# Generated by Django 5.2.1 on 2025-05-19 21:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_horariosucursal'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sucursal',
            name='horario',
        ),
    ]
