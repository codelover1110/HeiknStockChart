from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=12)
    role = models.CharField(max_length=255)


class SingupLinkRole(models.Model):
    link = models.CharField(max_length=255)
    role = models.TextField(default='')
    expired = models.BooleanField(default=False)
    class Meta:
        managed = True
    
