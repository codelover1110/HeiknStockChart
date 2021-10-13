import React from "react";
import {
  Button
} from "reactstrap";

import Sidebar from "components/Sidebar/Sidebar.js";
import OptimizationChartPage from "components/optimization-chart/OptimizationChartPage"
import { routes } from "routes.js";
import { BackgroundColorContext } from "contexts/BackgroundColorContext";

function Optimization() {
  const [isShowSidebar, setShowSidebar] = React.useState(false);
  const [selectedInstance, setSelectedInstance] = React.useState('market_watch');

  const handleSidebarChange = () => {
    setShowSidebar(!isShowSidebar);
  };

  const handleInstanceChange = (instance) => {
    setSelectedInstance(instance)
  }

  return (
    <BackgroundColorContext.Consumer>
      {({ color }) => (
        <React.Fragment>
          <div className="wrapper hunter-wrapper">
          {!isShowSidebar && (
            <Button
              className ={"show-sidebar-toggle-area show-sidebar-icon"}
              onClick={handleSidebarChange}
            >
              <i className="tim-icons icon-align-left-2"/>
            </Button>
          )}
          {isShowSidebar && (
            <Sidebar
              isAdminPage={false}
              routes={routes}
              selectedInstance={selectedInstance}
              handleSidebarChange={handleSidebarChange}
              handleInstanceChange={handleInstanceChange}
            />
            )}
            <div className="col-sm-12 hunter-watch-list-area">
              <OptimizationChartPage />
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default Optimization;