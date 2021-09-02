from django.conf.urls import url 
from . import views

urlpatterns = [
    url(r'^links/?$', views.SignupLinkRoleView.as_view()),
    url(r'^send-signup-link/?$', views.send_link_to_email),
]