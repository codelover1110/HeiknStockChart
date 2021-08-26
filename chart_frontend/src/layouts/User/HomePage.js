import React from "react";
import { useLocation } from "react-router-dom";
import {
  Button
} from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";
import HeiknStockChart from "components/HeiknStockChart"
import HeiknStockChartItem from "components/ItemChart"

var ps;

function HomePage() {
  const [isHomePage, setIsHomePage] = React.useState(true);
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

  const handleChartRedirect = (flag) => {
    setIsHomePage(flag);
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
                routes={routes}
                selectedInstance={selectedInstance}
                handleSidebarChange={handleSidebarChange}
                handleInstanceChange={handleInstanceChange}
              />
            )}
            {isHomePage
             ? (
              <div className={`main-panel ${!isShowSidebar ? 'full-width' : ''}`} ref={mainPanelRef} data={color}>
                <HeiknStockChart selectedInstance={selectedInstance} handleChartRedirect={handleChartRedirect}/>
              </div>
              )
              : (
                <div className={`main-panel ${!isShowSidebar ? 'full-width' : ''}`} ref={mainPanelRef} data={color}>
                 <HeiknStockChartItem selectedInstance={selectedInstance} handleChartRedirect={handleChartRedirect}/>
                </div>
              )
            }
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default HomePage;