import React from 'react'
import AdminNavbar from "components/Navbars/AdminNavbar";
import { routes } from "routes.js";
import Sidebar from "components/Sidebar/Sidebar";
import TextEditor from 'components/TextEditor/Editor';
import {
  Button
} from "reactstrap";
export default function FileManager(){
  const [isShowSidebar, setShowSidebar] = React.useState(true);
  const [selectedInstance, setSelectedInstance] = React.useState('forward_test');
  const handleSidebarChange = () => {
    setShowSidebar(!isShowSidebar);
  };
  const handleInstanceChange = (instance) => {
    setSelectedInstance(instance)
}

  return(
    <React.Fragment>        
      <AdminNavbar/>
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
              subInstance={'systemfilemanager'}
              handleSidebarChange={handleSidebarChange}
              selectedInstance={selectedInstance}
              handleInstanceChange={handleInstanceChange}
            />
          )}
          <TextEditor/>
        </div>
    </React.Fragment>
  );  
}