from django.conf.urls import url
from chartApis import views

urlpatterns = [

    # google get news api
    url(r'^api/get_google_news', views.get_google_news),

    # db management api
    url(r'^api/get_databases$', views.get_databases),
    url(r'^api/get_collections$', views.get_collections),
    url(r'^api/delete_collection$', views.delete_collection),
    # url(r'^api/export_database$', views.export_database),
    # url(r'^api/export_collection$', views.export_collection),


    url(r'^api/create_backup$', views.create_backup),
    url(r'^api/execute_backup$', views.execute_backup),
    url(r'^api/stop_backup$', views.stop_backup),


    url(r'^api/tables$', views.get_table_list),
    # url(r'^api/get_data$', views.get_live_data),
    url(r'^api/get_data$', views.get_live_data_test),

    url(r'^api/get_data_test$', views.get_live_data_test),


    url(r'^api/get_data_extended$', views.get_live_data_extended),
    url(r'^api/get_backtesting_symbols$', views.backtesting_symbols),
    url(r'^api/get_backtesting_result$', views.backtesting_result),
    url(r'^api/get_data_trades$', views.get_data_trades),
    url(r'^api/get_table_candles$', views.get_table_candles),
    url(r'^api/get_strategy_list$', views.get_strategies_list),
    url(r'^api/get_data_slice$', views.get_live_data_slice),
    url(r'^api/get_data_extended_slice$', views.get_live_data_extended_slice),
    url(r'^api/micro_strategy_symbols$', views.micro_strategy_symbols),
    url(r'^api/indicator_list$', views.indicator_list),
    url(r'^api/get_indicator_signalling_list$', views.get_indicator_signalling_list),

    # strategy management api
    url(r'^api/get_script_file$', views.get_script_file),
    url(r'^api/create_script_file$', views.create_script_file),
    url(r'^api/update_script_file$', views.update_script_file),
    url(r'^api/get_script_files$', views.get_script_list),
    url(r'', views.index),
]