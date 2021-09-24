import React from "react";
import {
  Button
} from "reactstrap";

import Sidebar from "components/Sidebar/Sidebar.js";
import WatchList from "components/WatchList"

import { routes } from "routes.js";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";

function TradeScanner() {
  const [isShowSidebar, setShowSidebar] = React.useState(false);
  const [selectedInstance, setSelectedInstance] = React.useState('scanner');
  
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
            <div className="col-sm-12">
                <WatchList />
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default TradeScanner;