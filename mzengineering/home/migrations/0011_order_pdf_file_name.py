# Generated by Django 4.2.13 on 2024-06-04 05:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0010_alter_order_order_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='pdf_file_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
