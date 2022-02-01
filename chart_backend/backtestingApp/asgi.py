"""
ASGI config for backtestingApp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
print("wating socket data **************************************************")

if True:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backtestingApp.settings')
    application = get_asgi_application()
else:
    import socketio
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backtestingApp.settings')

    sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
    application = socketio.ASGIApp(sio, get_asgi_application())

    @sio.on('connect')
    async def test_connect(sid, environ):
        print("connected successfully!!!!!!!!!!!!!!!!!!", sid, environ)
