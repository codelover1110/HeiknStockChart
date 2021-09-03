from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from .views import auth_view, verify_view, signup_view, password_reset_view, password_reset_confirm_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('signin/', auth_view, name='login-view'),
    path('verify/',  verify_view, name='verify-view'),
    path('signup/', signup_view, name='signup-view'),
    path('password_reset/', password_reset_view, name='password-reset-view'),
    path('password_reset_confirm/', password_reset_confirm_view, name='password-reset-confirm-view'),
    url(r'^', include('users.urls')),
    url(r'^', include('chartApis.urls')),
]
