from rest_framework import serializers
from scanner.models import Scanner

class ScannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scanner
        fields = ('id')