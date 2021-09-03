import "../App.css";

import DataTable, { createTheme } from 'react-data-table-component';
import styled from "styled-components";

const StyledCell = styled.div`
  &.above {
    background: green !important;
    text-align: center;
    width: 100%;
    height: 100%;
    line-height: 50px;
    font-size: 20px;
  }
  &.below {
    background: red;
    text-align: center;
    line-height: 50px;
    width: 100%;
    height: 100%;
    font-size: 20px;
  }
  &.aboveText {
    color: green;
    font-size: 20px;
  }
  &.belowText {
    color: red;
    font-size: 20px;
  }
`;

function getOverUnderBoxClass(value) {
    var rawNum = parseFloat(value);
    if (rawNum < 0) return "below";
    else if (rawNum >= 0) return "above";
    return "above";
  }

  function getOverUnderTextClass(value) {
    var rawNum = parseFloat(value);
    if (rawNum < 0) return "belowText";
    else if (rawNum >= 0) return "aboveText";
    return "aboveText";
  }

const columns = [
    {
        name: 'Symbol',
        selector: row => row.symbol,
        sortable: true,
        cell: (row) => (
            <StyledCell className={getOverUnderTextClass(row.change)}>
              {row.symbol}
            </StyledCell>),
    },
    {
        name: 'Description',
        selector: row => row.description,
        style: {
            color: '#ffffff',
            fontSize: '20px',
		},
    },
    {
        name: '%change',
        selector: row => row.change,
        sortable: true,
        cell: (row) => (
            <StyledCell className={getOverUnderBoxClass(row.change)}>
              {row.change}
            </StyledCell>),
        style: {
            color: '#ffffff'
        },
    },
    {
        name: 'RSI',
        selector: row => row.rsi,
        cell: (row) => (
            <StyledCell className={getOverUnderBoxClass(row.rsi)}>
              {row.rsi}
            </StyledCell>
            ),
        style: {
            color: '#ffffff'
        },
    },
];

const data = [
    {
        id: 1,
        symbol: 'AAPL',
        description: 'Apple computing corporation',
        change: '+5%',
        rsi: '70',
    },
    {
        id: 2,
        symbol: 'GOOG',
        description: 'Google',
        change: '-5%',
        rsi: '30',
    },
    {
        id: 3,
        symbol: 'AMD',
        description: 'Advanced micro devices',
        change: '+2%',
        rsi: '55',
    },
]

const customStyles = {
	cells: {
		style: {
			backgroundColor: '#303030',
            borderStyle: 'none',
		},
	},
    rows: {
        style: {
            backgroundColor: '#303030',
            borderStyle: 'none',
        }
    },
    header: {
		style: {
			backgroundColor: '#303030',
            color: '#ffffff'
		},
	},
    headRow: {
		style: {
			backgroundColor: '#303030',
		},
	},
    headCells: {
		style: {
			color: '#ffffff',
            fontSize: '24px',
            highlightOnHoverStyle: {
                backgroundColor: '#FFFFFF',
                borderBottomColor: '#FFFFFF',
                borderRadius: '25px',
                outline: '1px solid #FFFFFF',
            },
		},
	},
    sortFocus: {
		default: '#2aa198',
	},
    divider: {
		default: '#fff',
	},
};

createTheme('whiteHeaders', {
	text: {
		primary: '#fff',
	},
	sortFocus: {
		default: '#fff',
	},
});

function Scanner() {
    return (
    <div style={{height:"100vh",backgroundColor:"#303030"}}>
        <DataTable
            title="Equity Scanner"
            columns={columns}
            data={data}
            customStyles={customStyles}
            theme="whiteHeaders"
        />
    </div>
    );
};

export default Scanner;