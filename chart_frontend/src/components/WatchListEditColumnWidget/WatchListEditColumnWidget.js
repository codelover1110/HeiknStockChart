import React, { useEffect, useState } from 'react';

import Widget from './components/modal/Widget';

import { getStockModalData } from 'api/Api';

const WatchListEditColumnWidget = (props) => {
  const [totalNodes, setTotalNodes] = useState([]);
  const [currentNodes, setCurrentNodes] = useState(props.selectedColumns);
  
  const handleCurrentNodesChanged = (nodes) => {
    setCurrentNodes(nodes);
    props.setColumns(nodes)
  };

  const handleVisible = (visibleStatus) => {
    props.handleModalClose()
  };

  useEffect(() => {
    let nodes = [];
    let childNodes = [];

    const getModalData = async () => {
      let res = await getStockModalData();
      if (res.result) {
        const stockFinancialsData = res.result.stock_financials;
        const indicators = res.result.indicators;
        const tickerNews = res.result.ticker_news;
        const tickerDetails = res.result.ticker_details;

        // Stock Financials Fields
        childNodes = [];
        stockFinancialsData.total.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_1_' + (index + 1),
            default: stockFinancialsData.defaults.includes(node) ? true : false,
          });
        });

        if (childNodes.length > 0) {
          nodes.push({
            label: 'Stock Financials',
            value: 'parent_value_1',
            children: childNodes,
            default: true,
          });
        } else {
          nodes.push({
            label: 'Stock Financials',
            value: 'parent_value_1',
            default: false,
          });
        }

        // Indicators
        childNodes = [];
        indicators.total.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_2_' + (index + 1),
            default: indicators.defaults.includes(node) ? true : false,
          });
        });

        if (childNodes.length > 0) {
          nodes.push({
            label: 'Indicators',
            value: 'parent_value_2',
            children: childNodes,
            default: true,
          });
        } else {
          nodes.push({
            label: 'Indicators',
            value: 'parent_value_2',
            default: false,
          });
        }

        // Ticker News
        // childNodes = [];
        // tickerNews.total.map((node, index) => {
        //   childNodes.push({
        //     label: node,
        //     value: 'child_value_3_' + (index + 1),
        //     default: tickerNews.defaults.includes(node) ? true : false,
        //   });
        // });

        // if (childNodes.length > 0) {
        //   nodes.push({
        //     label: 'Ticker News',
        //     value: 'parent_value_3',
        //     children: childNodes,
        //     default: true,
        //   });
        // } else {
        //   nodes.push({
        //     label: 'Ticker News',
        //     value: 'parent_value_3',
        //     default: false,
        //   });
        // }

        // Ticker Details
        childNodes = [];
        tickerDetails.total.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_4_' + (index + 1),
            default: tickerDetails.defaults.includes(node) ? true : false,
          });
        });

        if (childNodes.length > 0) {
          nodes.push({
            label: 'Ticker Details',
            value: 'parent_value_4',
            children: childNodes,
            default: true,
          });
        } else {
          nodes.push({
            label: 'Ticker Details',
            value: 'parent_value_4',
            default: false,
          });
        }

        nodes.push({
          label: "Ticker Prices",
          value: "parent_value_5",
          children: [
              {
                  label: "o",
                  value: "child_value_5_1",
                  default: true
              },
              {
                  label: "h",
                  value: "child_value_5_2",
                  default: true
              },    
              {
                  label: "l",
                  value: "child_value_5_3",
                  default: true
              },    
              {
                  label: "c",
                  value: "child_value_5_4",
                  default: true
              },    
              {
                  label: "v",
                  value: "child_value_5_5",
                  default: true
              },    
              {
                  label: "mark",
                  value: "child_value_5_6",
                  default: true
              }    
          ]
        })
      }
      setTotalNodes(nodes);
    };
    getModalData();
  }, []);

  return (
    <div className="watch-list-edit-column-widget">
      {totalNodes.length > 0 && (
        <Widget
          totalNodes={totalNodes}
          currentNodes={currentNodes}
          handleCurrentNodesChanged={handleCurrentNodesChanged}
          handleVisible={handleVisible}
        />
      )}
    </div>
  );
};

export default WatchListEditColumnWidget;
