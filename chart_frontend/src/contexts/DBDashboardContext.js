import React, {useState, useEffect, useContext} from 'react'
import { useLocation, useHistory } from "react-router-dom";
import { apiGetDatabases, apiDeleteDatabase, apiExportDatabase } from "api/Api"

export const DBDashboardContext = React.createContext()
export const DBDashboardUpdateContext = React.createContext()
export const DBDashboardLoadingContext = React.createContext()
export const DBDatabaseExportContext = React.createContext()
export const DBDatabaseDeleteContext = React.createContext()


export function useDBDashboard() {
  return useContext(DBDashboardContext)
}

export function useDBDashboardUpdate() {
  return useContext(DBDashboardUpdateContext)
}

export function useDBDashboardLoading() {
  return useContext(DBDashboardLoadingContext)
}

export const useActiveDatabase = () => {
  const {hash} = useLocation()
  const activeDatabase = hash.substring(1)

  return activeDatabase
}

export const useExportDatabase = () => {
  return useContext(DBDatabaseExportContext)
}

export const useDeleteDatabase = () => {
  return useContext(DBDatabaseDeleteContext)
}

export function DBDashboardProvider({children}) {
  const [isLoading, setLoading] = useState(false)
  const [databases, setDatabases] = useState([])

  useEffect(() => {
    setLoading(true)
    apiGetDatabases().then((response) => {
      setDatabases(response.data)
      setLoading(false)
    })
  }, [setDatabases])

  const history = useHistory()

  const updateDatabases = function(data) {
    setDatabases(data)
  }

  const deleteDatabase = (databaseName) => {
    const confirmed = window.confirm(`Are you sure to delete the database "${databaseName}"?`);

    if (confirmed) {
      apiDeleteDatabase(databaseName).then((response) => {
        const updatedDatabases = databases.filter((filteredDatabase) => {
          return filteredDatabase != databaseName
        });
        setDatabases(updatedDatabases)
        history.push('/db_management')
      })
    }
  }

  const exportDatabase = (databaseName) => {

    apiExportDatabase(databaseName).then((response) => {
      console.log('apiExportDatabase::response')
      console.log(response)
    })
  }

  return (
    <DBDashboardLoadingContext.Provider value={isLoading}>
      <DBDashboardContext.Provider value={databases}>
        <DBDashboardUpdateContext.Provider value={updateDatabases}>
          <DBDatabaseExportContext.Provider value={exportDatabase}>
            <DBDatabaseDeleteContext.Provider value={deleteDatabase}>
              {children}
            </DBDatabaseDeleteContext.Provider>
          </DBDatabaseExportContext.Provider>
        </DBDashboardUpdateContext.Provider>
      </DBDashboardContext.Provider>
    </DBDashboardLoadingContext.Provider>
  )
}