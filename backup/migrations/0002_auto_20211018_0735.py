# Generated by Django 3.2.8 on 2021-10-18 00:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backup', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='backupprogress',
            name='target',
            field=models.CharField(default='', max_length=256),
        ),
        migrations.AlterField(
            model_name='backupprogress',
            name='status',
            field=models.CharField(default='', max_length=256),
        ),
    ]
