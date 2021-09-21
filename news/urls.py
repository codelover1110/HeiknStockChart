from django.conf.urls import url 
from . import views


urlpatterns = [
    # url(r'^api/hello$', views.hello),
    #  url(r'^api/hello$', views.hello),
    url(r'^hello/', views.hello)
]