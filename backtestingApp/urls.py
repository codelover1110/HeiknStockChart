from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include, re_path
from .views import auth_view, verify_view, signup_view, password_reset_view, password_reset_confirm_view
from strategy import views as strategy_view
from news import views as news_view
from financials import views as financials_view
from scanner import views as scanner_view

admin.autodiscover()
urlpatterns = [
    path('admin/', admin.site.urls),
    path('signin/', auth_view, name='login-view'),
    path('verify/',  verify_view, name='verify-view'),
    path('signup/', signup_view, name='signup-view'),
    path('password_reset/', password_reset_view, name='password-reset-view'),
    path('password_reset_confirm/', password_reset_confirm_view, name='password-reset-confirm-view'),
    
    ################ strategy api ################
    path('strategy/parameter_list/', strategy_view.parameter_list, name='parameter-list'),
    path('strategy/parameter_item_names/', strategy_view.parameter_item_names, name='parameter-item-names'),
    path('strategy/parameter_content/', strategy_view.parameter_content, name='parameter-content'),
    path('strategy/parameter_detail_list/', strategy_view.parameter_detail_list, name='parameter-detail-list'),
    path('strategy/save_script_file/', strategy_view.save_script_file, name='save-script-file'),
   
    # config management
    path('strategy/config_list/', strategy_view.config_list, name='config-list'),
    path('strategy/config_details/', strategy_view.config_details, name='config-details'),
    path('strategy/bot_status_list/', strategy_view.config_details, name='config-details'),
    path('strategy/config_detail_names/', strategy_view.config_detail_names, name='config-detail-names'),
    path('strategy/create_one_config_detail/', strategy_view.create_one_config_detail, name='create-one-config-detail'),
    path('strategy/delete_config/', strategy_view.delete_configs, name='delete-config'),
    path('strategy/delete_config_details/', strategy_view.delete_config_details, name='delete-config-details'),
    path('strategy/config_item_detail/', strategy_view.config_item_detail, name='config-item-detail'),
    path('strategy/bot_run/', strategy_view.bot_run, name='bot-run'),
    path('strategy/bot_stop/', strategy_view.bot_stop, name='bot-stop'),
    path('strategy/bot_pause/', strategy_view.bot_pause, name='bot-pause'), 

    ################ news api ##################
    path('news/recent_news/', news_view.recent_news, name='recent-news'),
    path('news/symbol_news/', news_view.symbol_news, name='symbol-news'),

    ################ financials api ##################
    path('financials/symbol_financials/', financials_view.symbol_financials, name='symbol-financials'),
    path('financials/income_statement/', financials_view.income_statement, name='income-statement'),
    path('financials/balance_sheet/', financials_view.balance_sheet, name='balance-sheet'),
    path('financials/cash_statement/', financials_view.cash_statement, name='cash-statement'),
    path('financials/financial_total_data/', financials_view.financial_total_data, name='financial-total-data'),

    ################ scanner api ##################
    path('scanner/stock_financials_fields/', scanner_view.stock_financials_fields, name='stock-financials-fields'),
    path('scanner/indicators_fields/', scanner_view.indicators_fields, name='indicators-fields'),
    path('scanner/ticker_news_fields/', scanner_view.ticker_news_fields, name='ticker-news-fields'),
    path('scanner/ticker_details_fields/', scanner_view.ticker_details_fields, name='ticker-details-fields'),
    path('scanner/available_items/', scanner_view.available_items, name='available-items'),
    path('scanner/multi_financials/', scanner_view.multi_financials, name='multi-financials'),
    path('scanner/save_scanner_views/', scanner_view.save_scanner_views, name='save-scanner-views'),
    path('scanner/scanner_views/', scanner_view.scanner_views, name='scanner-views'),
    path('scanner/watchlists/', scanner_view.watchlists, name='watchlists'),
    path('scanner/view_values/', scanner_view.view_values, name='view-values'),

    ################ new scanner api ##################
    path('scanner/ticker_details_list/', scanner_view.ticker_details_list, name='ticker-details-details'),
    path('scanner/ticker_details_filter_options/', scanner_view.ticker_details_filter_options, name='ticker_details_filter_options'),
    
    # app api
    url(r'^', include('users.urls')),
    url(r'^', include('chartApis.urls')),
    # url(r'^', include('strategy.urls')),
]
