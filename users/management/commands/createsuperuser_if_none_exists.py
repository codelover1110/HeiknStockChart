from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from users.models import CustomUser

class Command(BaseCommand):
    """
    Create a superuser if none exist
    Example:
        manage.py createsuperuser_if_none_exists --user=admin --password=changeme
    """

    def add_arguments(self, parser):
        parser.add_argument("--user", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument("--email", required=True)

    def handle(self, *args, **options):
        username = options["user"]
        password = options["password"]
        email = options["email"]

        self.stdout.write(f'email:{email}')
        
        try:
            user = CustomUser.objects.get(email=email)
            return
        except:
            pass
        CustomUser.objects.create_user(
            username=username,
            email=email,
            password= password,
            first_name="",
            last_name="",
            role="",
            is_superuser = True,
            is_active=True
        )
        user = CustomUser.objects.get(email=email)
        Token.objects.create(user=user)
        user.save()

        self.stdout.write(f'Local user {username} was created')