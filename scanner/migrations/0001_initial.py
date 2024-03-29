# Generated by Django 3.1.4 on 2021-09-23 17:39

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Scanner',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(default='AMZN', max_length=10)),
                ('open', models.FloatField(default=0.0)),
                ('high', models.FloatField(default=0.0)),
                ('close', models.FloatField(default=0.0)),
                ('value', models.IntegerField(default=0)),
                ('num', models.IntegerField(default=0)),
                ('date', models.DateTimeField(default=datetime.datetime(2021, 9, 23, 19, 39, 49, 211409))),
            ],
        ),
    ]
