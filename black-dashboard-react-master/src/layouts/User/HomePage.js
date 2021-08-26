/*!

=========================================================
* Black Dashboard React v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Button
} from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// core components
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";
import HeiknStockChart from "components/HeiknStockChart"

var ps;

function HomePage(props) {
  const [isShowSidebar, setShowSidebar] = React.useState(false);
  const [selectedInstance, setSelectedInstance] = React.useState('forward_test');
  const location = useLocation();
  const mainPanelRef = React.useRef(null);
  
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanelRef.current, {
        suppressScrollX: true,
      });
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  });
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
  }, [location]);
  
  
  const handleSidebarChange = () => {
    setShowSidebar(!isShowSidebar);
  };

  const handleInstanceChange = (instance) => {
    setSelectedInstance(instance)
  }
  
  return (
    <BackgroundColorContext.Consumer>
      {({ color, changeColor }) => (
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
                routes={routes}
                selectedInstance={selectedInstance}
                handleSidebarChange={handleSidebarChange}
                handleInstanceChange={handleInstanceChange}
              />
            )}
            <div className={`main-panel ${!isShowSidebar ? 'full-width' : ''}`} ref={mainPanelRef} data={color}>
              <HeiknStockChart selectedInstance={selectedInstance} />
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default HomePage;
