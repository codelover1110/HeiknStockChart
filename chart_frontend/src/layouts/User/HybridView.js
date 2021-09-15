import React from 'react'
import {
  Button
} from "reactstrap";
import Sidebar from "components/Sidebar/Sidebar.js";
import { routes } from "routes.js";
import { BackgroundColorContext } from "contexts/BackgroundColorContext";
import HybridViewChartTable from "components/HybridViewChartTable/HybridViewChartTable";

const HybridView = () => {
  const [isShowSidebar, setShowSidebar] = React.useState(false);
  const [selectedInstance, setSelectedInstance] = React.useState('hybrid_view');
  
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
              subInstance={'tradedatatable'}
              selectedInstance={selectedInstance}
              handleSidebarChange={handleSidebarChange}
              handleInstanceChange={handleInstanceChange}
            />
            )}
            <div className="col-sm-12">
              <HybridViewChartTable selectedInstance={selectedInstance} />                
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
    );
}

export default HybridView