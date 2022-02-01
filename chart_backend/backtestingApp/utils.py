from django.core.mail import send_mail
from django.conf import settings

import os
from twilio.rest import Client



def send_phone(user_code, phone_number):
    account_sid = ''
    auth_token = ''
    
    client = None
    # client = Client(account_sid, auth_token)

    message = client.message_create(
        body = f'Hi, Your user and verification code is {user_code}',
        from_ = '',
        to = f'{phone_number}'
    )
    print(message.sid)

def send_email(user_code, user_email):
    subject = 'Verification Code'
    message = user_code
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [user_email,]
    print (' +++++ verification code for {}: {}'.format(user_email, user_code))
    send_mail(subject, message, email_from, recipient_list )
