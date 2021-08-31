/*eslint-disable*/
import React from "react";
import { NavLink, Link, useLocation, useHistory } from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";

// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// reactstrap components
import { Nav, NavLink as ReactstrapNavLink } from "reactstrap";
import {
  BackgroundColorContext,
  backgroundColors,
} from "contexts/BackgroundColorContext";

var ps;

function Sidebar(props) {
  const history = useHistory();
  const sidebarRef = React.useRef(null);
  // verifies if routeName is the one active (in browser input)
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebarRef.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });
  
  const { isAdminPage, routes, selectedInstance, handleSidebarChange, handleInstanceChange } = props;
  
  return (
    <BackgroundColorContext.Consumer>
      {({ color }) => (
        <div className="sidebar hunter-sidebar" data={color}>
          <div className="sidebar-wrapper" ref={sidebarRef}>
            <div className="show-sidebar-button-area">
              <div className="show-sidebar-icon">
                <i className="tim-icons icon-align-left-2" onClick={handleSidebarChange}/>
              </div>
            </div>
            {isAdminPage ? (
              <Nav>
                {routes.map((prop, key) => {
                  return (
                    <li
                      className={
                        prop.instance === selectedInstance ? "active-instance hunter-select-instance" : "hunter-select-instance"
                      }
                      key={key}
                      onClick={() => {
                        handleInstanceChange(prop.instance)
                        if (prop.pathname) {
                          history.push({
                            pathname: prop.pathname
                          })
                        }
                      }}
                    >
                      <div
                        className="nav-link"
                      >
                        <i className={prop.icon} />
                        <p>{prop.name}</p>
                      </div>
                    </li>
                  );
                })}
              </Nav>  
            ) : (
              <Nav>
                {routes.map((prop, key) => {
                  return (
                    <li
                      className={
                        prop.instance === selectedInstance ? "active-instance hunter-select-instance" : "hunter-select-instance"
                      }
                      key={key}
                      onClick={() => {
                        handleInstanceChange(prop.instance)
                        const locationState = {
                          initInstance: prop.instance
                        }
                        if (prop.pathname) {
                          history.push({
                            pathname: prop.pathname,
                            state: prop.instance === 'stress_test'
                            || prop.instance === 'optimization'
                            || prop.instance === 'live_trading'
                            ?  locationState: null
                          })
                        }
                      }}
                    >
                      <div
                        className="nav-link"
                      >
                        <i className={prop.icon} />
                        <p>{prop.name}</p>
                      </div>
                    </li>
                  );
                })}
              </Nav>
            )}
          </div>
        </div>
      )}
    </BackgroundColorContext.Consumer>
  );
}

Sidebar.defaultProps = {
  rtlActive: false,
  routes: [{}],
};

Sidebar.propTypes = {
  // if true, then instead of the routes[i].name, routes[i].rtlName will be rendered
  // insde the links of this component
  rtlActive: PropTypes.bool,
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the text of the logo
    text: PropTypes.node,
    // the image src of the logo
    imgSrc: PropTypes.string,
  }),
};

export default Sidebar;
