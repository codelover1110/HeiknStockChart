from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from .views import home_view, auth_view, verify_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home-view'),
    path('login/', auth_view, name='login-view'),
    path('verify/',  verify_view, name='verify-view'),
    # url(r'^', include('chartApis.urls')),
]
