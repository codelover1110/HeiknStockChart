import React, { useMemo, useState } from "react";
import { Route, useLocation } from "react-router-dom";
import Select from 'react-select'
import {
  Button
} from "reactstrap";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import { adminRoutes } from "routes.js";

import { BackgroundColorContext } from "contexts/BackgroundColorContext";
import { MDBBtn, MDBTable, MDBTableBody, MDBTableHead  } from 'mdbreact';
import Modal from 'react-bootstrap/Modal'
import { createSignUpLink, sendSignUpLink } from 'api/Api'
import { validateEmail } from 'utils/helper'

var ps;

function LinkManage() {
  const [roles, setRoles] = useState([])
  const [isShowSendModal, setIsShowSendModal] = useState(false)
  const [isShowCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [isShowSidebar, setShowSidebar] = React.useState(true);
  const location = useLocation();
  const mainPanelRef = React.useRef(null);
  const [sidebarOpened, setsidebarOpened] = React.useState(
    document.documentElement.className.indexOf("nav-open") !== -1
  );
  const [selectedInstance, setSelectedInstance] = React.useState('linkmanage');
  const [toEmail, setToEmail] = useState('')
  const [link, setLink] = useState('')
  const [email, setEmail] = useState('')
  
  const optionsRole = [
    { value: 'forward_test', label: 'Forward Test' },
    { value: 'stress_test', label: 'Stress Test' },
    { value: 'optimization', label: 'Optimization' },
    { value: 'live_trade', label: 'Live Trade' },
  ]
  
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
  // this function opens and closes the sidebar on small devices
  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setsidebarOpened(!sidebarOpened);
  };
  
  const handleSidebarChange = () => {
    setShowSidebar(!isShowSidebar);
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  const getBrandText = (path) => {
    for (let i = 0; i < adminRoutes.length; i++) {
      if (location.pathname.indexOf(adminRoutes[i].layout + adminRoutes[i].path) !== -1) {
        return adminRoutes[i].name;
      }
    }
    return "Brand";
  };

  const handleInstanceChange = (instance) => {
    setSelectedInstance(instance)
  }

  const handleCreateLinkModalClose = () => {
    setRoles([])
    setShowCreateLinkModal(false)  
  }

  const handleCreateLinkClick = () => {
    setShowCreateLinkModal(true)
  }

  const handleRolesChange = (options) => {
    setRoles(options);
  }

  const handleLinkCreate = async () => {
    const roleValues = roles.map(role => role.value )
    await createSignUpLink(roleValues);
  }
  
  const showSendEmailModal = async () => {
    setIsShowSendModal(true);
  }

  const handleSendEmailModalClose = async () => {
    setIsShowSendModal(false);
  }

  const handleLinkToEmailSend = async () => {
    if (!validateEmail(email)) {
      alert('Email is invalid')
      return
    }

    await sendSignUpLink(email, link);
  }

  const columns= [
    {
      label: '#',
      field: 'id',
    },
    {
      label: 'Link',
      field: 'link',
    },
    {
      label: 'Roles',
      field: 'roles',
    },
    {
      label: 'Action',
      field: 'action',
    }
  ];
  
  const links = [
    {
      'id': 1,
      'link': 'http://localhost:3000/signup/admin123456789',
      'roles': 'Forward Test',
      'action': <MDBBtn color="blue" size="sm" onClick={() => {showSendEmailModal()}}>Send</MDBBtn>
    },
  ]

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
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
                isAdminPage={true}
                routes={adminRoutes}
                handleSidebarChange={handleSidebarChange}
                selectedInstance={selectedInstance}
                handleInstanceChange={handleInstanceChange}
              />
            )}
            <Modal show={isShowCreateLinkModal} className="hunter-modal" onHide={handleCreateLinkModalClose}>
              <Modal.Header closeButton>
                <Modal.Title>Create Sign Up link for users</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="select-multi-option">
                  <Select
                    name="filters"
                    placeholder="Roles"
                    value={roles}
                    onChange={handleRolesChange}
                    options={optionsRole}
                    isMulti={true}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className="hunter-modal-footer">
                <Button variant="primary" onClick={handleLinkCreate}>
                  Create Link
                </Button>
              </Modal.Footer>
            </Modal>
            <Modal show={isShowSendModal} className="hunter-modal" onHide={handleSendEmailModalClose}>
              <Modal.Header closeButton>
                <Modal.Title>Send the link</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control hunter-form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { handleEmailChange(e)} }
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className="hunter-modal-footer">
                <Button variant="primary" onClick={handleLinkToEmailSend}>
                  Send
                </Button>
              </Modal.Footer>
            </Modal>
            <div className={`main-panel ${!isShowSidebar ? 'full-width' : ''}`} ref={mainPanelRef} data={color}>
              <AdminNavbar
                brandText={getBrandText(location.pathname)}
                toggleSidebar={toggleSidebar}
                sidebarOpened={sidebarOpened}
              />
              <div className="hunter-page-container">
                <div className="hunter-page-title">
                  <h3>Link Manage</h3>
                </div>
                <div className="col-sm-6 hunter-mdb-table-container">
                  <div className="create-button-bar">
                    <MDBBtn color="blue" size="md" onClick={handleCreateLinkClick}>Create</MDBBtn>                    
                  </div>
                  <MDBTable btn>
                    <MDBTableHead columns={columns} color="dark"/>
                    <MDBTableBody rows={links} className="hunter-mdb-table-body"/>
                  </MDBTable>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default LinkManage;