from django.db import models

class BackupProgress(models.Model):
    target = models.CharField(max_length=256, default='')
    target_type = models.CharField(max_length=256, default='collection')
    status = models.CharField(max_length=256, default='')
    current = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now=True)

    def json(self):
      return {
        'id': self.id,
        'target': self.target
      }