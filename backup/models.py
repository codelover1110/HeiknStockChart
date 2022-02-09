from django.db import models

class BackupProgress(models.Model):
    database = models.CharField(max_length=256, default='')
    collection = models.CharField(max_length=256, default='')
    status = models.CharField(max_length=256, default='')
    current = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now=True)

    def json(self):
      return {
        'id': str(self.id),
        'database': self.database,
        'collection': self.collection,
      }

    def is_database(self):
      return not self.collection

    def is_collection(self):
      return self.collection