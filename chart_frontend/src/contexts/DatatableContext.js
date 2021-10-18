import React, {useState, useContext} from 'react'

const DatatableContext = React.createContext()
const DatatableLoadingContext = React.createContext()

export const useDatatableLoading = () => {
  return useContext(DatatableLoadingContext)
}

export const useDatatable = (initialData) => {
  return useContext(DatatableContext)
}


export const useDatatableValue = (initialData) => {
  const context = useContext(DatatableContext)
  const [, setDatatable] = context

  setDatatable(initialData)
  return context
}


export const useDatatableUpdate = () => {
  const [, setDatatable] = useContext(DatatableContext)

  return setDatatable
}


export const DatatableProvider = ({children}) => {
  const [isLoading, setLoading] = useState(false)
  const [datatable, setDatatable] = useState({
    columns: [],
    rows: [],
  })

  return (
    <DatatableContext.Provider value={[datatable, setDatatable]}>
      <DatatableLoadingContext.Provider value={[isLoading, setLoading]}>
          {children}
      </DatatableLoadingContext.Provider>
    </DatatableContext.Provider>
  );
}
