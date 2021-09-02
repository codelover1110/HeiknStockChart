from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from .views import auth_view, verify_view, signup_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('signin/', auth_view, name='login-view'),
    path('verify/',  verify_view, name='verify-view'),
    path('signup/', signup_view, name='signup-view'),
    url(r'^', include('users.urls')),
    url(r'^', include('chartApis.urls')),
]
