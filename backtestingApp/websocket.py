# websocket.py
async def websocket_applciation(scope, receive, send):
    while True:
        event = await receive()

        if event['type'] == 'websocket.connect':
            await send({
                'type': 'websocket.accept'
            })

        if event['type'] == 'websocket.disconnect':
            break

        if event['type'] == 'websocket.receive':
            if event['text'] == 'ping':
                await send({
                    'type': 'websocket.send',
                    'text': 'pong!'
                })

from django.urls import resolve
from .connection import WebSocket

def websockets(app):
    async def asgi(scope, receive, send):
        if scope['type'] == "websocket":
            print("&&&&&&&&&&&&& we")
        await app(scope, receive, send)
    return asgi