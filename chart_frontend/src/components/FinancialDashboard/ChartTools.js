import React from 'react';

const ChartTools = (props) => {
  const {
    aggregationTypeForOne,
    setAggregrationTypeForOne,
    color,
  } = props;
  
  const handleAggregationForOneClicked = (aggregationType) => {
    if (aggregationTypeForOne === aggregationType) {
      setAggregrationTypeForOne("");
    } else {
      setAggregrationTypeForOne(aggregationType);
    }
  }

  return (
    <div className="dashboard-chart-tool">
      <ul className="nav justify-content-center">
        <li
          className="nav-item"
          style={aggregationTypeForOne === "YA" ? { backgroundColor: color, color: "white" } : {}}
          onClick={() => handleAggregationForOneClicked("YA")}
        >
          <span>A</span>
        </li>
        <li
          className="nav-item"
          style={aggregationTypeForOne === "QA" ? { backgroundColor: color, color: "white" } : {}}
          onClick={() => handleAggregationForOneClicked("QA")}
        >
          <span>Q</span>
        </li>
        <li
          className="nav-item"
          style={aggregationTypeForOne === "TA" ? { backgroundColor: color, color: "white" } : {}}
          onClick={() => handleAggregationForOneClicked("TA")}
        >
          <span>T</span>
        </li>
      </ul>
    </div>
  );
};

export default ChartTools;
