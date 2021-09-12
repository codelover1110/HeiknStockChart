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

    # app api
    url(r'^', include('users.urls')),
    url(r'^', include('chartApis.urls')),
    # url(r'^', include('strategy.urls')),
]
