from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include, re_path
from .views import auth_view, verify_view, signup_view, password_reset_view, password_reset_confirm_view
from strategy import views as strategy_view
admin.autodiscover()
urlpatterns = [
    path('admin/', admin.site.urls),
    path('signin/', auth_view, name='login-view'),
    path('verify/',  verify_view, name='verify-view'),
    path('signup/', signup_view, name='signup-view'),
    path('password_reset/', password_reset_view, name='password-reset-view'),
    path('password_reset_confirm/', password_reset_confirm_view, name='password-reset-confirm-view'),
    
    # strategy api
    path('strategy/parameter_list/', strategy_view.parameter_list, name='parameter-list'),
    path('strategy/parameter_item_names/', strategy_view.parameter_item_names, name='parameter-item-names'),
    path('strategy/parameter_content/', strategy_view.parameter_content, name='parameter-content'),
    path('strategy/parameter_detail_list/', strategy_view.parameter_detail_list, name='parameter-detail-list'),
    path('strategy/save_script_file/', strategy_view.save_script_file, name='save-script-file'),
    path('strategy/config_list/', strategy_view.config_list, name='config-list'),
    path('strategy/config_details/', strategy_view.config_details, name='config-details'),
    path('strategy/config_detail_names/', strategy_view.config_detail_names, name='config-detail-names'),
    path('strategy/create_one_config_detail/', strategy_view.create_one_config_detail, name='create-one-config-detail'),
    path('strategy/delete_config/', strategy_view.delete_configs, name='delete-config'),
    path('strategy/delete_config_details/', strategy_view.delete_config_details, name='delete-config-details'),
    path('strategy/config_item_detail/', strategy_view.config_item_detail, name='config_item_detail'),


    # app api
    url(r'^', include('users.urls')),
    url(r'^', include('chartApis.urls')),
    # url(r'^', include('strategy.urls')),
]
