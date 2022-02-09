from .models import SingupLinkRole, CustomUser
from rest_framework import serializers

class SignupLinkRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SingupLinkRole
        fields = ('__all__')
    