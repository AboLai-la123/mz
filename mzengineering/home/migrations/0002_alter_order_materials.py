# Generated by Django 4.2.13 on 2024-06-02 15:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='materials',
            field=models.CharField(blank='', max_length=100, null=''),
        ),
    ]
