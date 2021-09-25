import React, { useEffect, useState } from 'react';

import Widget from './components/modal/Widget';

import {
  getStockFinancialFields,
  getIndicatorFields,
  getTickerNewsFields,
  getTickerDetailFields,
} from 'api/Api';

const WatchListEditColumnWidget = () => {
  const [totalNodes, setTotalNodes] = useState([]);
  const [currentNodes, setCurrentNodes] = useState([]);
  const [visible, setVisible] = useState(true);

  const handleCurrentNodesChanged = (nodes) => {
    console.log('nodes', nodes);
    setCurrentNodes(nodes);
  };

  const handleVisible = (visibleStatus) => {
    setVisible(visibleStatus);
  };

  useEffect(() => {
    let nodes = [];
    let childNodes = [];

    // Stock Financials Fields
    const getModalData = async () => {
      childNodes = [];
      let res = await getStockFinancialFields();
      Array.isArray(res.results.snapshots) &&
        res.results.snapshots.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_1_' + (index + 1),
            default: res.defaults.includes(node) ? true : false,
          });
        });
      Array.isArray(res.results.others) &&
        res.results.others.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_1_' + (childNodes.length + index + 1),
            default: res.defaults.includes(node) ? true : false,
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

      childNodes = [];
      res = await getIndicatorFields();
      Array.isArray(res.results.snapshots) &&
        res.results.snapshots.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_2_' + (index + 1),
            default: res.defaults.includes(node) ? true : false,
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

      childNodes = [];
      res = await getTickerNewsFields();
      Array.isArray(res.results) &&
        res.results.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_3_' + (index + 1),
            default: res.defaults.includes(node) ? true : false,
          });
        });
      if (childNodes.length > 0) {
        nodes.push({
          label: 'Ticker News',
          value: 'parent_value_3',
          children: childNodes,
          default: true,
        });
      } else {
        nodes.push({
          label: 'Ticker News',
          value: 'parent_value_3',
          default: false,
        });
      }

      childNodes = [];
      res = await getTickerDetailFields();
      Array.isArray(res.results) &&
        res.results.map((node, index) => {
          childNodes.push({
            label: node,
            value: 'child_value_4_' + (index + 1),
            default: res.defaults.includes(node) ? true : false,
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
          visible={visible}
          handleVisible={handleVisible}
        />
      )}
    </div>
  );
};

export default WatchListEditColumnWidget;
