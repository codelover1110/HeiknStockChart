import React, { useState, useEffect } from 'react';
import '../../assets/css/financialDashboardStyles.css';

import { Button } from 'reactstrap';
import { routes } from 'routes.js';

import Sidebar from 'components/Sidebar/Sidebar.js';
import Header from 'components/FinancialDashboard/Header';
import GroupBarChart from 'components/FinancialDashboard/GroupBarChart';
import GraphTypes from 'components/FinancialDashboard/GraphTypes';
import FinancialDataTable from 'components/FinancialDashboard/FinancialDataTable';
import FinancialStatementsDataTable from 'components/FinancialDashboard/FinancialStatementsDataTable';

import { getNewsFinancialData } from 'api/Api'


import {
  getAllSymbols,
  getIncomeStatement,
  getBalanceSheet,
  getCashStatement,
  getFinancialTotalData,
} from 'api/Api'


/** Dummy data for Income statement */
const dummyForRevenue = {
  label: 'Revenue',
  group: 2,
  color: 'rgb(25, 185, 154)',
  dataPoints: {
    '1995-12-31': [0.5, 1.2, 1.5, 1.6, 1.8, 2.3, 2.7, 1.4],
    '1997-12-31': [0.4, 1.7, 1.6, 1.7, 1.2, 1.3, 1.5, 1.5],
    '1999-12-31': [0.8, 2.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.6, 0.9, 1.5, 1.7, 1.6, 1.7, 1.3, 1.4],
    '2003-12-31': [0.9, 1.4, 1.9, 1.8, 1.7, 2.3, 1.9, 1.5],
    '2005-12-31': [0.4, 1.7, 1.5, 1.7, 1.9, 1.8, 1.6, 1.6],
    '2007-12-31': [0.9, 1.2, 1.5, 1.7, 1.1, 1.5, 1.1, 1.5],
    '2009-12-31': [1.4, 1.9, 1.3, 1.2, 1.8, 1.3, 1.9, 1.8],
    '2011-12-31': [1.8, 0.5, 1.1, 1.7, 1.4, 2.1, 1.7, 1.5],
    '2013-12-31': [0.9, 2.5, 1.5, 1.7, 1.9, 1.3, 1.9, 1.3],
    '2015-12-31': [0.4, 1.9, 1.5, 1.9, 1.4, 1.4, 1.9, 1.9],
    '2017-12-31': [1.2, 2.2, 1.1, 1.7, 1.1, 2.4, 1.8, 1.5],
    '2019-12-31': [0.9, 0.4, 1.5, 1.7, 1.4, 1.3, 1.9, 1.1],
  },
};

const dummyForCostOfRevenue = {
  label: 'Cost of Revenue',
  group: 2,
  color: 'rgb(8, 64, 129)',
  dataPoints: {
    '1995-12-31': [0.5, 1.2, 1.5, 1.6, 1.8, 2.3, 2.7, 1.4],
    '1997-12-31': [0.4, 1.7, 1.6, 1.7, 1.2, 1.3, 1.5, 1.5],
    '1999-12-31': [0.8, 2.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.6, 0.9, 1.5, 1.7, 1.6, 1.7, 1.3, 1.4],
    '2003-12-31': [0.9, 1.4, 1.9, 1.8, 1.7, 2.3, 1.9, 1.5],
    '2005-12-31': [0.4, 1.7, 1.5, 1.7, 1.9, 1.8, 1.6, 1.6],
    '2007-12-31': [0.9, 1.2, 1.5, 1.7, 1.1, 1.5, 1.1, 1.5],
    '2009-12-31': [1.4, 1.9, 1.3, 1.2, 1.8, 1.3, 1.9, 1.8],
    '2011-12-31': [1.8, 0.5, 1.1, 1.7, 1.4, 2.1, 1.7, 1.5],
    '2013-12-31': [0.9, 2.5, 1.5, 1.7, 1.9, 1.3, 1.9, 1.3],
    '2015-12-31': [0.4, 1.9, 1.5, 1.9, 1.4, 1.4, 1.9, 1.9],
    '2017-12-31': [1.2, 2.2, 1.1, 1.7, 1.1, 2.4, 1.8, 1.5],
    '2019-12-31': [0.9, 0.4, 1.5, 1.7, 1.4, 1.3, 1.9, 1.1],
  },
};

const dummyForGrossProfit = {
  label: 'Gross Profit',
  group: 2,
  color: 'rgb(127, 0, 0)',
  dataPoints: {
    '1995-12-31': [0.5, 1.2, 1.5, 1.6, 1.8, 2.3, 2.7, 1.4],
    '1997-12-31': [0.9, 1.7, 1.6, 1.7, 1.2, 1.3, 1.5, 1.5],
    '1999-12-31': [0.8, 2.2, 1.3, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.6, 0.9, 1.5, 1.7, 1.1, 1.7, 1.3, 1.4],
    '2003-12-31': [0.9, 1.4, 1.9, 1.8, 1.3, 2.3, 1.9, 1.5],
    '2005-12-31': [0.4, 1.7, 1.7, 1.7, 1.9, 1.8, 1.6, 1.6],
    '2007-12-31': [0.1, 1.2, 1.5, 1.7, 1.1, 1.5, 1.1, 1.5],
    '2009-12-31': [1.4, 1.9, 1.3, 1.2, 1.2, 1.3, 1.9, 1.8],
    '2011-12-31': [1.8, 0.5, 1.7, 1.7, 1.4, 2.1, 1.7, 1.5],
    '2013-12-31': [0.5, 2.5, 1.5, 1.7, 1.9, 1.3, 1.9, 1.3],
    '2015-12-31': [0.4, 1.9, 1.5, 1.9, 1.6, 1.4, 1.9, 1.9],
    '2017-12-31': [1.3, 2.2, 1.1, 1.7, 1.1, 2.4, 1.8, 1.5],
    '2019-12-31': [0.9, 0.4, 1.5, 1.7, 1.4, 1.3, 1.9, 1.1],
  },
};

const dummyForEbit = {
  label: 'Ebit',
  group: 2,
  color: 'rgb(89, 201, 108)',
  dataPoints: {
    '1995-12-31': [-0.5, -1.2, -1.1, 1.7, 1.1, 1.1, 2.6, -1.1],
    '1997-12-31': [-0.8, -1.3, -1.5, 1.8, 1.4, 1.3, 1.9, -1.5],
    '1999-12-31': [-0.6, -1.2, -1.9, 1.7, 1.4, 1.3, 1.5, -1.8],
    '2001-12-31': [-0.8, -1.3, -1.2, 1.7, 1.2, 1.1, 1.9, -1.2],
    '2003-12-31': [-0.8, -1.2, -1.5, 1.8, 1.0, 1.3, 2.4, -1.7],
    '2005-12-31': [-0.2, -1.2, -1.8, 1.6, 1.4, 1.6, 1.9, -1.5],
    '2007-12-31': [-0.6, -1.4, -1.3, 1.7, 1.4, 1.3, 1.3, -1.3],
    '2009-12-31': [-0.8, -1.2, -1.5, 1.1, 1.3, 1.4, 1.9, -1.9],
    '2011-12-31': [-0.5, -1.5, -1.4, 1.7, 1.8, 1.3, 1.2, -1.6],
    '2013-12-31': [-0.8, -1.2, -1.5, 1.7, 1.4, 1.9, 2.9, -1.5],
    '2015-12-31': [-0.7, -1.6, -1.7, 1.2, 1.4, 1.3, 1.9, -1.4],
    '2017-12-31': [-0.8, -1.2, -1.6, 1.7, 1.5, 1.5, 1.1, -1.5],
    '2019-12-31': [-0.5, -1.8, -1.5, 1.4, 1.7, 1.3, 2.9, -1.5],
  },
};

const dummyForNetIncome = {
  label: 'Net Income',
  group: 2,
  color: 'rgb(75, 87, 74)',
  dataPoints: {
    '1995-12-31': [-0.5, -1.2, -1.1, 1.7, 1.1, 1.1, 2.6, -1.1],
    '1997-12-31': [-0.8, -1.3, -1.5, 1.8, 1.4, 1.3, 1.9, -1.5],
    '1999-12-31': [-0.6, -1.2, -1.9, 1.7, 1.4, 1.3, 1.5, -1.8],
    '2001-12-31': [-0.8, -1.3, -1.2, 1.7, 1.2, 1.1, 1.9, -1.2],
    '2003-12-31': [-0.8, -1.2, -1.5, 1.8, 1.0, 1.3, 2.4, -1.7],
    '2005-12-31': [-0.2, -1.2, -1.8, 1.6, 1.4, 1.6, 1.9, -1.5],
    '2007-12-31': [-0.6, -1.4, -1.3, 1.7, 1.4, 1.3, 1.3, -1.3],
    '2009-12-31': [-0.8, -1.2, -1.5, 1.1, 1.3, 1.4, 1.9, -1.9],
    '2011-12-31': [-0.5, -1.5, -1.4, 1.7, 1.8, 1.3, 1.2, -1.6],
    '2013-12-31': [-0.8, -1.2, -1.5, 1.7, 1.4, 1.9, 2.9, -1.5],
    '2015-12-31': [-0.7, -1.6, -1.7, 1.2, 1.4, 1.3, 1.9, -1.4],
    '2017-12-31': [-0.8, -1.2, -1.6, 1.7, 1.5, 1.5, 1.1, -1.5],
    '2019-12-31': [-0.5, -1.8, -1.5, 1.4, 1.7, 1.3, 2.9, -1.5],
  },
};

const dummyForEarningsPerBasicShare = {
  label: 'Earnings per Basic Share',
  group: 2,
  color: 'rgb(226, 71, 130)',
  dataPoints: {
    '1995-12-31': [-0.5, -1.2, -1.1, 1.7, 1.1, 1.1, 2.6, -1.1],
    '1997-12-31': [-0.8, -1.3, -1.5, 1.8, 1.4, 1.3, 1.9, -1.5],
    '1999-12-31': [-0.6, -1.2, -1.9, 1.7, 1.4, 1.3, 1.5, -1.8],
    '2001-12-31': [-0.8, -1.3, -1.2, 1.7, 1.2, 1.1, 1.9, -1.2],
    '2003-12-31': [-0.8, -1.2, -1.5, 1.8, 1.0, 1.3, 2.4, -1.7],
    '2005-12-31': [-0.2, -1.2, -1.8, 1.6, 1.4, 1.6, 1.9, -1.5],
    '2007-12-31': [-0.6, -1.4, -1.3, 1.7, 1.4, 1.3, 1.3, -1.3],
    '2009-12-31': [-0.8, -1.2, -1.5, 1.1, 1.3, 1.4, 1.9, -1.9],
    '2011-12-31': [-0.5, -1.5, -1.4, 1.7, 1.8, 1.3, 1.2, -1.6],
    '2013-12-31': [-0.8, -1.2, -1.5, 1.7, 1.4, 1.9, 2.9, -1.5],
    '2015-12-31': [-0.7, -1.6, -1.7, 1.2, 1.4, 1.3, 1.9, -1.4],
    '2017-12-31': [-0.8, -1.2, -1.6, 1.7, 1.5, 1.5, 1.1, -1.5],
    '2019-12-31': [-0.5, -1.8, -1.5, 1.4, 1.7, 1.3, 2.9, -1.5],
  },
};

/** Dummy data for Balance Sheet */
const dummyForTotalAssets = {
  label: 'Total Assets',
  group: 3,
  color: 'rgb(182, 116, 194)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForTotalLiabilities = {
  label: 'Total Liabilities',
  group: 3,
  color: 'rgb(186, 56, 58)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForTotalDebt = {
  label: 'Total Debt [USD]',
  group: 3,
  color: 'rgb(172, 114, 47)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForReceivables = {
  label: 'Receivables',
  group: 3,
  color: 'rgb(99, 89, 135)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForPayables = {
  label: 'Payables',
  group: 3,
  color: 'rgb(179, 8, 167)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForCashAndEquivalents = {
  label: 'Cash & Cash Equivalents [USD]',
  group: 3,
  color: 'rgb(46, 149, 187)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

/** Dummy data for Cash Flow Statement */
const dummyForNetCashFromOperation = {
  label: 'Net Cash Flow from Operations',
  group: 4,
  color: 'rgb(230, 195, 176)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForNetCashFromInvesting = {
  label: 'Net Cash Flow from Investing',
  group: 4,
  color: 'rgb(182, 102, 232)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForNetCashFromFinancing = {
  label: 'Net Cash Flow from Financing',
  group: 4,
  color: 'rgb(221, 171, 219)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForIssuRepayDebtSecurities = {
  label: 'Issue/Repayment of Debt Securities',
  group: 4,
  color: 'rgb(90, 125, 16)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForIssuPurchaseEquityShares = {
  label: 'Issuance/Purchase of Equity Shares',
  group: 4,
  color: 'rgb(241, 76, 34)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForPaymentDivAndCashDistributions = {
  label: 'Payment of Dividends & Other Cash Distributions',
  group: 4,
  color: 'rgb(96, 54, 217)',
  dataPoints: {
    '1995-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1997-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '1999-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2001-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2003-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2005-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2007-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2009-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2011-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2013-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2015-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2017-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
    '2019-12-31': [0.8, 1.2, 1.5, 1.7, 1.4, 1.3, 1.9, 1.5],
  },
};

const dummyForFinancialStatements = {
  columns: [
    'id',
    'time',
    'title',
  ],
  rows: [
    {
      id: "0",
      time: "2021-09-12",
      title: "Sorrento Announces an Independent Real-World Study That Reports Superior Sensitivity Results in Detecting COVID-19 Virus Infections in All-Comer General Population by COVISTIX as Compared to a Globally Leading Rapid Antigen Test",
    }
  ]
}

// 0: income statement 1: Balance sheet 2: Cash Flow Statement
const dummyForDataTable = {
  columns: [
    "BreakDown",
    "TTM",
    "12/31/2021",
    "12/31/2020",
    "12/31/2019",
    "12/31/2018",
    "12/31/2017",
    "12/31/2016",
    "12/31/2015",
  ],
  rows: [
    [
      {
        BreakDown: "EBITDAMargin",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "accumulatedOtherComprehensiveIncome",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "accumulatedRetainedEarningsDeficit",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetTurnover",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assets",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsAverage",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsAvassetsCurrenterage",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsNonCurrent",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "averageEquity",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "bookValuePerShare",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "calendarDate",
        TTM: "0",
        '12/31/2021': '12/31/2021',
        '12/31/2020': '12/31/2021',
        '12/31/2019': '12/31/2021',
        '12/31/2018': '12/31/2021',
        '12/31/2017': '12/31/2021',
        '12/31/2016': '12/31/2021',
        '12/31/2015': '12/31/2021',
      },
      {
        BreakDown: "capitalExpenditure",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "cashAndEquivalents",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "cashAndEquivalentsUSD",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "consolidatedIncome",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
    ],
    [
      {
        BreakDown: "EBITDAMargin",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "accumulatedOtherComprehensiveIncome",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "accumulatedRetainedEarningsDeficit",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetTurnover",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assets",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsAverage",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsAvassetsCurrenterage",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsNonCurrent",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "averageEquity",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "bookValuePerShare",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "calendarDate",
        TTM: "0",
        '12/31/2021': '12/31/2021',
        '12/31/2020': '12/31/2021',
        '12/31/2019': '12/31/2021',
        '12/31/2018': '12/31/2021',
        '12/31/2017': '12/31/2021',
        '12/31/2016': '12/31/2021',
        '12/31/2015': '12/31/2021',
      },
      {
        BreakDown: "capitalExpenditure",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "cashAndEquivalents",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "cashAndEquivalentsUSD",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "consolidatedIncome",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
    ],
    [
      {
        BreakDown: "EBITDAMargin",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "accumulatedOtherComprehensiveIncome",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "accumulatedRetainedEarningsDeficit",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetTurnover",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assets",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsAverage",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsAvassetsCurrenterage",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "assetsNonCurrent",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "averageEquity",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "bookValuePerShare",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "calendarDate",
        TTM: "0",
        '12/31/2021': '12/31/2021',
        '12/31/2020': '12/31/2021',
        '12/31/2019': '12/31/2021',
        '12/31/2018': '12/31/2021',
        '12/31/2017': '12/31/2021',
        '12/31/2016': '12/31/2021',
        '12/31/2015': '12/31/2021',
      },
      {
        BreakDown: "capitalExpenditure",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "cashAndEquivalents",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "cashAndEquivalentsUSD",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
      {
        BreakDown: "consolidatedIncome",
        TTM: "0",
        '12/31/2021': "0",
        '12/31/2020': "0",
        '12/31/2019': "0",
        '12/31/2018': "0",
        '12/31/2017': "0",
        '12/31/2016': "0",
        '12/31/2015': "0",
      },
    ]
  ]
};

const FinancialDashboard = () => {
  const [symbol, setSymbol] = useState({ value: 'AAPL', label: 'AAPL' });
  const [optionsSymbol, setOptionsSymbol] = useState([]);
  const [isShowSidebar, setShowSidebar] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState('financial_data');
  const [selectedHeaderNav, setSelectedHeaderNav] =
    useState('Income Statement');
  const [selectedGraphType, setSelectedGraphType] = useState('Charts');
  const [selectedAggregationType, setSelectedAggregationType] = useState('ANN');

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
    rows: []
  })

  useEffect(() => {
    const getSymbols = async () => {
      const res = await getAllSymbols();
      setOptionsSymbol(res);
    }
    getSymbols();
  }, []);

  // useEffect(() => {
  //   const getIncome = async () => {
  //     const res = await getIncomeStatement(symbol.value);
  //     const revenus = {
  //       label: 'Revenue',
  //       group: 2,
  //       color: 'rgb(25, 185, 154)',
  //       dataPoints: res.results.revenues,
  //     }
  //     const costOfRevenue = {
  //       label: 'Cost of Revenue',
  //       group: 2,
  //       color: 'rgb(8, 64, 129)',
  //       dataPoints: res.results.costOfRevenue,
  //     }
  //     const grossProfit = {
  //       label: 'Gross Profit',
  //       group: 2,
  //       color: 'rgb(127, 0, 0)',
  //       dataPoints: res.results.grossProfit,
  //     }
  //     const EBITDAMargin = {
  //       label: 'Ebit',
  //       group: 2,
  //       color: 'rgb(89, 201, 108)',
  //       dataPoints: res.results.EBITDAMargin,
  //     }
  //     // const NetIncome = {
  //     //   label: 'Earnings per Basic Share',
  //     //   group: 2,
  //     //   color: 'rgb(226, 71, 130)',
  //     //   dataPoints: res.results.NetIncome,
  //     // }
  //     const earningsPerBasicShare = {
  //       label: 'Earnings per Basic Share',
  //       group: 2,
  //       color: 'rgb(226, 71, 130)',
  //       dataPoints: res.results.earningsPerBasicShare,
  //     }
  //     setChartData([
  //       revenus,
  //       costOfRevenue,
  //       grossProfit,
  //       EBITDAMargin,
  //       revenus,
  //       earningsPerBasicShare,
  //     ]);
  //   }
  //   getIncome();

  //   // const getBalance = async () => {
  //   //   const res = await getBalanceSheet();
  //   //   setOptionsSymbol(res);
  //   // }
  //   // getBalance();

  //   // const getCash = async () => {
  //   //   const res = await getCashStatement();
  //   //   setOptionsSymbol(res);
  //   // }
  //   // getCash();

  //   // let data = [
  //   //   dummyForRevenue,
  //   //   dummyForCostOfRevenue,
  //   //   dummyForGrossProfit,
  //   //   dummyForEbit,
  //   //   dummyForNetIncome,
  //   //   dummyForEarningsPerBasicShare,
  //   // ];
  //   // switch (selectedHeaderNav) {
  //   //   case 'Income Statement':
  //   //     data = [
  //   //       dummyForRevenue,
  //   //       dummyForCostOfRevenue,
  //   //       dummyForGrossProfit,
  //   //       dummyForEbit,
  //   //       dummyForNetIncome,
  //   //       dummyForEarningsPerBasicShare,
  //   //     ];
  //   //     break;
  //   //   case 'Balance Sheet':
  //   //     data = [
  //   //       dummyForTotalAssets,
  //   //       dummyForTotalLiabilities,
  //   //       dummyForTotalDebt,
  //   //       dummyForReceivables,
  //   //       dummyForPayables,
  //   //       dummyForCashAndEquivalents,
  //   //     ];
  //   //     break;
  //   //   case 'Cash Flow Statement':
  //   //     data = [
  //   //       dummyForNetCashFromOperation,
  //   //       dummyForNetCashFromInvesting,
  //   //       dummyForNetCashFromFinancing,
  //   //       dummyForIssuRepayDebtSecurities,
  //   //       dummyForIssuPurchaseEquityShares,
  //   //       dummyForPaymentDivAndCashDistributions,
  //   //     ];
  //   //     break;
  //   //   default:
  //   //     break;
  //   // }
  //   // setChartData(data);
  // }, [selectedHeaderNav]);

  useEffect(() => {
    let data = [
      dummyForRevenue,
      dummyForCostOfRevenue,
      dummyForGrossProfit,
      dummyForEbit,
      dummyForNetIncome,
      dummyForEarningsPerBasicShare,
    ];
    switch (selectedHeaderNav) {
      case 'Income Statement':
        data = [
          dummyForRevenue,
          dummyForCostOfRevenue,
          dummyForGrossProfit,
          dummyForEbit,
          dummyForNetIncome,
          dummyForEarningsPerBasicShare,
        ];
        break;
      case 'Balance Sheet':
        data = [
          dummyForTotalAssets,
          dummyForTotalLiabilities,
          dummyForTotalDebt,
          dummyForReceivables,
          dummyForPayables,
          dummyForCashAndEquivalents,
        ];
        break;
      case 'Cash Flow Statement':
        data = [
          dummyForNetCashFromOperation,
          dummyForNetCashFromInvesting,
          dummyForNetCashFromFinancing,
          dummyForIssuRepayDebtSecurities,
          dummyForIssuPurchaseEquityShares,
          dummyForPaymentDivAndCashDistributions,
        ];
        break;
      default:
        break;
    }
    setChartData(data);

    const getTotalData = async () => {
      const res = await getFinancialTotalData(symbol.value);
      let columns = ["BreakDown", "TTM"];
      let rows = [];
      res.results.map((item) => {
        const calendarDateKey = item['calendarDate'];
        if (!columns.includes(calendarDateKey)) {
          columns.push(calendarDateKey);
        }

        const keys = Object.keys(item);
        keys.map((key, index) => {
          if (!(index in rows)) {
            rows[index] = {}
          }
          rows[index]["BreakDown"] = key;
          rows[index]["TTM"] = "1000000";
          rows[index][calendarDateKey] = item[key];
        });
      });

      rows = [rows, rows, rows];
      setDataTable({
        columns,
        rows
      });
    }
    getTotalData();

    const getNewsFinancials = async () => {
      const res = await getNewsFinancialData()
      console.log("res???", res)
      setFinancialStatements({
        columns: ['id', 'time', 'title'],
        rows: res.result
      })
    }
    getNewsFinancials()
  }, [selectedHeaderNav, symbol]);

  return (
    <>
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
      {selectedHeaderNav !== 'All Financial Statements' && (
        <GraphTypes
          selectedGraphType={selectedGraphType}
          setSelectedGraphType={setSelectedGraphType}
          selectedAggregationType={selectedAggregationType}
          setSelectedAggregationType={setSelectedAggregationType}
        />
      )}
      {
      selectedHeaderNav === 'Data Table' ? (
        <FinancialDataTable
          data={datatable}
          symbols={optionsSymbol}
        />
      ) : 
      selectedHeaderNav === 'All Financial Statements' ? (
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
                  <GroupBarChart data={data} chartData={chartData} />
                </div>
              ))}
          </div>
        </div>
      )
    }
    </>
  );
};

export default FinancialDashboard;
