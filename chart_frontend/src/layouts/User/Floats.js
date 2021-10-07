import React from "react";
import {
  Button
} from "reactstrap";

import Sidebar from "components/Sidebar/Sidebar.js";
import FloatsComponent from 'components/Floats/FloatsComponent.js'

import { routes } from "routes.js";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";

function Floats() {
  const [isShowSidebar, setShowSidebar] = React.useState(false);
  const [selectedInstance, setSelectedInstance] = React.useState('floats');
  
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
                <FloatsComponent />
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default Floats;