import React, {useState, useContext} from 'react'

const ApiChartContext = React.createContext()

export const useApiChartContext = () => {
  return useContext(ApiChartContext)
}

export const ApiChartProvider = ({children}) => {
  const [chartData, setChartData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  return (
    <ApiChartContext.Provider value={{
      chartData: chartData,
      setChartData: setChartData,
      isLoading: isLoading,
      setLoading: setLoading,
    }}>
        {children}
    </ApiChartContext.Provider>
  );
}
