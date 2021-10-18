from django.db import models

class BackupProgress(models.Model):
    status = models.CharField(max_length=256)
    current = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now=True)