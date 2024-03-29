import React, {useState, useContext} from 'react'

const ApiChartContext = React.createContext()

export const useApiChartContext = () => {
  return useContext(ApiChartContext)
}

export const ApiChartProvider = ({children}) => {
  const [error, setError] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [sym, setSym] = useState("BTC-USD")
  const [time, setTime] = useState("1")
  const [timeType, setTimeType] = useState("ho")
  const [bar, setBar] = useState("150")
  const [close, setClose] = useState("false")
  const [ext, setExt] = useState("true")

  return (
    <ApiChartContext.Provider value={{
      chartData: chartData,
      setChartData: setChartData,
      isLoading: isLoading,
      setLoading: setLoading,
      sym: sym,
      setSym: setSym,
      time: time,
      setTime: setTime,
      timeType: timeType,
      setTimeType: setTimeType,
      bar: bar,
      setBar: setBar,
      close: close,
      setClose: setClose,
      ext: ext,
      setExt: setExt,
      error: error,
      setError: setError,
    }}>
        {children}
    </ApiChartContext.Provider>
  );
}
