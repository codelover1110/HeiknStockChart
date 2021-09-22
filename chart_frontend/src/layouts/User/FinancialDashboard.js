import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
// javascript plugin used to create scrollbars on windows
import disableScroll from 'disable-scroll';
import '../../assets/css/financialDashboardStyles.css';

import { Button } from 'reactstrap';
import { routes } from 'routes.js';

import Sidebar from 'components/Sidebar/Sidebar.js';
import Header from 'components/FinancialDashboard/Header';
import BarChart from 'components/FinancialDashboard/BarChart';
import GraphTypes from 'components/FinancialDashboard/GraphTypes';
import FinancialDataTable from 'components/FinancialDashboard/FinancialDataTable';
import FinancialStatementsDataTable from 'components/FinancialDashboard/FinancialStatementsDataTable';

import { getNewsFinancialData } from 'api/Api';

import {
  getAllSymbols,
  getIncomeStatement,
  getBalanceSheet,
  getCashStatement,
  getFinancialTotalData,
} from 'api/Api';

const FinancialDashboard = () => {
  const [symbol, setSymbol] = useState({ value: 'AAPL', label: 'AAPL' });
  const [optionsSymbol, setOptionsSymbol] = useState([]);
  const [isShowSidebar, setShowSidebar] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState('financial_data');
  const [selectedHeaderNav, setSelectedHeaderNav] =
    useState('Income Statement');
  const [selectedGraphType, setSelectedGraphType] = useState('Charts');
  const [selectedAggregationType, setSelectedAggregationType] = useState('');

  const [chartData, setChartData] = useState(null);
  const [datatable, setDataTable] = useState();

  const handleSidebarChange = () => {
    setShowSidebar(!isShowSidebar);
  };

  const handleInstanceChange = (instance) => {
    setSelectedInstance(instance);
  };

  const [financialStatements, setFinancialStatements] = useState({
    columns: ['id', 'time', 'title'],
    rows: [],
  });

  const sortDataPointsByDate = (data) => {
    let sortedData = {...data};
    if (sortedData.dataPoints.length > 0) {
      sortedData.dataPoints.sort(function (a, b) {
        let valueA = a['calendarDate'];
        let valueB = b['calendarDate'];
        if (typeof a['calendarDate'] != "string") {
          valueA = valueA.toString();
        }
        if (typeof b['calendarDate'] != "string") {
          valueB = valueB.toString();
        }
        return valueA.localeCompare(valueB);
      });
    }
    return sortedData;
  }

  useEffect(() => {
    disableScroll.on();
    const getSymbols = async () => {
      const res = await getAllSymbols();
      setOptionsSymbol(res);
    };
    getSymbols();

    return () => {
      disableScroll.off();
    };
  }, []);

  useEffect(() => {
    setChartData();
    const getNewsFinancials = async () => {
      const res = await getNewsFinancialData();
      console.log('res???', res);
      setFinancialStatements({
        columns: ['id', 'time', 'title'],
        rows: res.result,
      });
    };

    const getTotalData = async () => {
      const res = await getFinancialTotalData(symbol.value);
      let columns = ['BreakDown', 'TTM'];
      let rows = [];
      res.results.map((item) => {
        const calendarDateKey = item['calendarDate'];
        if (!columns.includes(calendarDateKey)) {
          columns.push(calendarDateKey);
        }

        const keys = Object.keys(item);
        keys.map((key, index) => {
          if (!(index in rows)) {
            rows[index] = {};
          }
          rows[index]['BreakDown'] = key;
          rows[index]['TTM'] = '1000000';
          rows[index][calendarDateKey] = item[key];
        });
      });

      rows = [rows, rows, rows];
      setDataTable({
        columns,
        rows,
      });
    };

    const getIncome = async () => {
      const res = await getIncomeStatement(symbol.value);
      let revenus = {
        label: 'Revenue',
        group: 0,
        color: 'rgb(25, 185, 154)',
        dataPoints: [],
      };
      let costOfRevenue = {
        label: 'Cost of Revenue',
        group: 0,
        color: 'rgb(8, 64, 129)',
        dataPoints: [],
      };
      let grossProfit = {
        label: 'Gross Profit',
        group: 0,
        color: 'rgb(127, 0, 0)',
        dataPoints: [],
      };
      let EBITDAMargin = {
        label: 'Ebit',
        group: 0,
        color: 'rgb(89, 201, 108)',
        dataPoints: [],
      };
      let NetIncome = {
        label: 'Net Income',
        group: 0,
        color: 'rgb(75, 87, 74)',
        dataPoints: [],
      };
      let earningsPerBasicShare = {
        label: 'Earnings per Basic Share',
        group: 0,
        color: 'rgb(226, 71, 130)',
        dataPoints: [],
      };
      if (res && res.results) {
        res.results.map((item) => {
          revenus.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.revenues,
          });
          costOfRevenue.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.costOfRevenue,
          });
          grossProfit.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.grossProfit,
          });
          EBITDAMargin.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.EBITDAMargin,
          });
          NetIncome.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.netIncome,
          });
          earningsPerBasicShare.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.earningsPerBasicShare,
          });
        });
      }
      setChartData([
        sortDataPointsByDate(revenus),
        sortDataPointsByDate(costOfRevenue),
        sortDataPointsByDate(grossProfit),
        sortDataPointsByDate(EBITDAMargin),
        sortDataPointsByDate(NetIncome),
        sortDataPointsByDate(earningsPerBasicShare),
      ]);
    };

    const getBalance = async () => {
      const res = await getBalanceSheet(symbol.value);
      let assets = {
        label: 'Total Assets',
        group: 1,
        color: 'rgb(182, 116, 194)',
        dataPoints: [],
      };
      let liabilitiesNonCurrent = {
        label: 'Total Liabilities',
        group: 1,
        color: 'rgb(186, 56, 58)',
        dataPoints: [],
      };
      let debt = {
        label: 'Total Debt [USD]',
        group: 1,
        color: 'rgb(172, 114, 47)',
        dataPoints: [],
      };
      let tradeAndNonTradeReceivables = {
        label: 'Receivables',
        group: 1,
        color: 'rgb(99, 89, 135)',
        dataPoints: [],
      };
      let tradeAndNonTradePayables = {
        label: 'Payables',
        group: 1,
        color: 'rgb(179, 8, 167)',
        dataPoints: [],
      };
      let cashAndEquivalents = {
        label: 'Cash & Cash Equivalents [USD]',
        group: 1,
        color: 'rgb(46, 149, 187)',
        dataPoints: [],
      };
      if (res && res.results) {
        res.results.map((item) => {
          assets.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.assets,
          });
          liabilitiesNonCurrent.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.liabilitiesNonCurrent,
          });
          debt.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.debt,
          });
          tradeAndNonTradeReceivables.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.tradeAndNonTradeReceivables,
          });
          tradeAndNonTradePayables.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.tradeAndNonTradePayables,
          });
          cashAndEquivalents.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.cashAndEquivalents,
          });
        });
      }

      setChartData([
        sortDataPointsByDate(assets),
        sortDataPointsByDate(liabilitiesNonCurrent),
        sortDataPointsByDate(debt),
        sortDataPointsByDate(tradeAndNonTradeReceivables),
        sortDataPointsByDate(tradeAndNonTradePayables),
        sortDataPointsByDate(cashAndEquivalents),
      ]);
    };

    const getCash = async () => {
      const res = await getCashStatement(symbol.value);
      let netCashFlowFromOperations = {
        label: 'Net Cash Flow from Operations',
        group: 2,
        color: 'rgb(230, 195, 176)',
        dataPoints: [],
      };
      let netCashFlowFromInvesting = {
        label: 'Net Cash Flow from Investing',
        group: 2,
        color: 'rgb(182, 102, 232)',
        dataPoints: [],
      };
      let netCashFlowFromFinancing = {
        label: 'Net Cash Flow from Financing',
        group: 2,
        color: 'rgb(221, 171, 219)',
        dataPoints: [],
      };
      let issuanceDebtSecurities = {
        label: 'Issue/Repayment of Debt Securities',
        group: 2,
        color: 'rgb(90, 125, 16)',
        dataPoints: [],
      };
      let issuanceEquityShares = {
        label: 'Issuance/Purchase of Equity Shares',
        group: 2,
        color: 'rgb(241, 76, 34)',
        dataPoints: [],
      };
      let paymentDividendsOtherCashDistributions = {
        label: 'Payment of Dividends & Other Cash Distributions',
        group: 2,
        color: 'rgb(96, 54, 217)',
        dataPoints: [],
      };
      if (res && res.results) {
        res.results.map((item) => {
          netCashFlowFromOperations.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.netCashFlowFromOperations,
          });
          netCashFlowFromInvesting.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.netCashFlowFromInvesting,
          });
          netCashFlowFromFinancing.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.netCashFlowFromFinancing,
          });
          issuanceDebtSecurities.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.issuanceDebtSecurities,
          });
          issuanceEquityShares.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.issuanceEquityShares,
          });
          paymentDividendsOtherCashDistributions.dataPoints.push({
            calendarDate: item.calendarDate,
            period: item.period,
            value: item.paymentDividendsOtherCashDistributions,
          });
        });
      }

      setChartData([
        sortDataPointsByDate(netCashFlowFromOperations),
        sortDataPointsByDate(netCashFlowFromInvesting),
        sortDataPointsByDate(netCashFlowFromFinancing),
        sortDataPointsByDate(issuanceDebtSecurities),
        sortDataPointsByDate(issuanceEquityShares),
        sortDataPointsByDate(paymentDividendsOtherCashDistributions),
      ]);
    };

    switch (selectedHeaderNav) {
      case 'News':
        getNewsFinancials();
        break;
      case 'Data Table':
        getTotalData();
        break;
      case 'Income Statement':
        getIncome();
        break;
      case 'Balance Sheet':
        getBalance();
        break;
      case 'Cash Flow Statement':
        getCash();
        break;
    }
  }, [selectedHeaderNav, symbol]);

  return (
    <div className="financial-dashboard-container">
      {!isShowSidebar && (
        <Button
          className={'show-sidebar-toggle-area show-sidebar-icon'}
          onClick={handleSidebarChange}
        >
          <i className="tim-icons icon-align-left-2" />
        </Button>
      )}
      {isShowSidebar && (
        <Sidebar
          isAdminPage={false}
          routes={routes}
          subInstance={'tradedatatable'}
          selectedInstance={selectedInstance}
          handleSidebarChange={handleSidebarChange}
          handleInstanceChange={handleInstanceChange}
        />
      )}
      <Header
        selectedHeaderNav={selectedHeaderNav}
        setSelectedHeaderNav={setSelectedHeaderNav}
        symbol={symbol}
        setSymbol={setSymbol}
        optionsSymbol={optionsSymbol}
      />
      {selectedHeaderNav !== 'News' && selectedHeaderNav !== 'Data Table' && (
        <GraphTypes
          selectedGraphType={selectedGraphType}
          setSelectedGraphType={setSelectedGraphType}
          selectedAggregationType={selectedAggregationType}
          setSelectedAggregationType={setSelectedAggregationType}
        />
      )}
      {selectedHeaderNav === 'Data Table' ? (
        <FinancialDataTable data={datatable} symbols={optionsSymbol} />
      ) : selectedHeaderNav === 'News' ? (
        <FinancialStatementsDataTable
          data={financialStatements}
          symbols={optionsSymbol}
        />
      ) : (
        <div className="container custom-container chart-area">
          <div className="row justify-content-center">
            {chartData &&
              chartData.map((data) => (
                <div
                  key={data.label}
                  className="col-lg-4 col-md-4 col-sm-6 col-xs-12 group-bar-chart"
                >
                  <BarChart
                    data={data}
                    chartData={chartData}
                    globalAggregationType={selectedAggregationType}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;
