import { DBDashboardProvider } from "contexts/DBDashboardContext"
import DBContent from "./Content"
import DBSidebar from "./Sidebar"

const { MDBContainer, MDBRow, MDBCol } = require("mdbreact")


const DBDashboard = () => {
  return (
    <DBDashboardProvider>
      <MDBContainer fluid={true}>
        <MDBRow>
          <MDBCol><div className="hunter-data-table-title">DB Management</div></MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol size="3"><DBSidebar /></MDBCol>
          <MDBCol><DBContent /></MDBCol>
        </MDBRow>
      </MDBContainer>
    </DBDashboardProvider>
  )
}

export default DBDashboard