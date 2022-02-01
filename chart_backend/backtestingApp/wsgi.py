"""
WSGI config for backtestingApp project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""
if True:
    import os

    from django.core.wsgi import get_wsgi_application

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backtestingApp.settings')
    application = get_wsgi_application()
else:
    import os
    import eventlet
    import socketio
    from django.core.wsgi import get_wsgi_application
    from scanner.sio_collector import sio

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'integrate_socketio.settings')

    application = get_wsgi_application()
    
    eventlet.monkey_patch()
 
    
    import eventlet.wsgi
 
    
    app = socketio.WSGIApp(sio, application)
    eventlet.wsgi.server(eventlet.listen(('', 8000)), app)
