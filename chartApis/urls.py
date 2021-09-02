from django.conf.urls import url 
from chartApis import views 

urlpatterns = [ 
    url(r'^api/tables$', views.get_table_list),
    url(r'^api/get_data$', views.get_stock_strategy_candles),
    url(r'^api/get_backtesting_data$', views.get_backtesting_data),
    url(r'^api/get_data_trades$', views.get_data_trades),
    url(r'^api/get_strategies$', views.get_strategies),
    url(r'', views.index),
]