from django.conf.urls import url 
from chartApis import views 

urlpatterns = [ 
    url(r'^api/tables$', views.get_table_list),
    url(r'^api/get_data$', views.get_live_data),
    url(r'^api/get_data_extended$', views.get_live_data_extended),
    url(r'^api/get_backtesting_symbols$', views.backtesting_symbols),
    url(r'^api/get_backtesting_result$', views.backtesting_result),
    url(r'^api/get_data_trades$', views.get_data_trades),
    url(r'^api/get_table_candles$', views.get_table_candles),
    url(r'^api/get_strategy_list$', views.get_strategies_list),

    # strategy management api
    url(r'^api/get_script_file$', views.get_script_file),
    url(r'^api/create_script_file$', views.create_script_file),
    url(r'^api/update_script_file$', views.update_script_file),
    url(r'^api/get_script_files$', views.get_script_list),
    url(r'', views.index),
]