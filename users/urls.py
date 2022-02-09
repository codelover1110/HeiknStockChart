from django.conf.urls import url 
from . import views

urlpatterns = [
    url(r'^links/?$', views.SignupLinkRoleView.as_view()),
    url(r'^send-signup-link/?$', views.send_link_to_email),
    url(r'^update_user_role/?$', views.update_user_role),
    url(r'^get_user_list/?$', views.get_user_list),
    url(r'^delete_user/?$', views.delete_user)
    # url(r'^edit_user_role/?$', views.edit_user_role),
    # url(r'^get_all_users/?$', views.get_all_user),
]