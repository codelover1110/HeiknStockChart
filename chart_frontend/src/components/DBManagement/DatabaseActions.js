import { MDBBtn, MDBLink, MDBIcon } from 'mdbreact'
import React from 'react'
import {useThemeColors} from 'contexts/ThemeContext'
import { useActiveDatabase, useDBDashboardUpdate, useDBDashboard, useDeleteDatabase, useExportDatabase } from 'contexts/DBDashboardContext'
import { useHistory } from 'react-router'

export default function DBDatabaseActions() {
  const dbName = useActiveDatabase()
  const colors = useThemeColors()

  const handleDelete = useDeleteDatabase()
  const handleBackup = useExportDatabase()

  return (
    <>
      {dbName &&
      <div class="d-flex">
        <MDBBtn color="white" onClick={(e) => {e.preventDefault(); handleDelete(dbName); }}><MDBIcon icon="trash" style={{color: colors.white}} /></MDBBtn>
        <MDBBtn color="primary" onClick={(e) => {e.preventDefault(); handleBackup(dbName); }}><MDBIcon icon="file-export" style={{color: colors.white}} /> Backup</MDBBtn>
      </div>}
    </>
  )
}
