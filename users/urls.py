from django.conf.urls import url 
from . import views

urlpatterns = [
    url(r'^links/?$', views.SignupLinkRoleView.as_view()),
    url(r'^send-signup-link/?$', views.send_link_to_email),
    url(r'^get_all_users/?$', views.get_all_user),
    url(r'^save_user/?$', views.save_user)
]