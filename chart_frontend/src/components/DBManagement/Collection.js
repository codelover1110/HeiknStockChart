import React, { useState } from 'react';
import { MDBLink, MDBIcon } from 'mdbreact';
import { useThemeColors } from 'contexts/ThemeContext'
import { apiExportCollection } from "api/Api"

function DBCollection(props) {
  const colors = useThemeColors()
  const dbName = props.dbname
  const collectionName = props.name

  const buttonStyle = {
    color: colors.actionButtonColor,
    backgroundColor: colors.actionButtonBg,
  }

  const textStyle = {
    color: colors.tableTextColor,
  }

  const rowStyle = {
    backgroundColor: colors.white,
  }

  const [isBackupRunning, setBackupRunning] = useState(false)

  const exportCollection = () => {
    setBackupRunning(true)
    apiExportCollection(dbName, collectionName).then((response) => {
      console.log('apiExportCollection::response')
      console.log(response)
      setBackupRunning(false)
    })
  }


  return (
    <>
      <tr style={rowStyle}>
        <td><span style={textStyle}>{props.index}.</span></td>
        <td><span style={textStyle}>{props.name}</span></td>
        <td>
          <div class="d-flex align-items-center">
            <MDBLink disabled={isBackupRunning} onClick={(e) => {e.preventDefault(); props.onDeleteClick(); }} style={{...buttonStyle, color: colors.red}}><MDBIcon icon="trash" /></MDBLink>
            <MDBLink disabled={isBackupRunning} onClick={(e) => {e.preventDefault(); exportCollection(); }} style={buttonStyle}><MDBIcon icon="file-export" /></MDBLink>
            {isBackupRunning && <span class="ml-1 spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>}
          </div>
        </td>
      </tr>
    </>
  )
}

export default DBCollection;