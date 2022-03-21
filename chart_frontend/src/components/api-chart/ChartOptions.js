import React, { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, Button, Input } from '@mui/material';
import { useApiChartContext } from './contexts';
import { apiGetNewChartData } from "api/Api"
import { format } from "d3-format";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import symbolListOptions from './master'

const ChartOptions = (props) => {


  const {setLoading, setChartData} = useApiChartContext()
  const {sym, setSym, time, setTime, timeType, setTimeType, bar, setBar, close, setClose, ext, setExt} = useApiChartContext()

  const loadChart = () => {
    const loadData = () => {
      setLoading(true)

      if (!sym || !time || !timeType || !bar || !close || !ext) return;

      const params = {
        symbol: sym,
        timeframe: time + timeType,
        bars: bar,
        close: close,
        extended_hours: ext,
      }

      apiGetNewChartData(params).then(data => {
        setLoading(false)

        setChartData(data)
      })
    }
    loadData()
  }

  useEffect(() =>  {
    loadChart()
  }, [])

  useEffect(() => {
    loadChart()
  }, [props.showAllClicked])

  // const symbolList = [
  //   { label: 'BTC-USD', year: 1994 },
  //   { label: 'The Godfather', year: 1972 },
  //   { label: 'The Godfather: Part II', year: 1974 },
  // ]


  const [typingValue, setTypingValue] = useState('')

  const handleShowChart = () => {
    loadChart()
  }


  return (
    <div className="d-flex align-items-end stockchart-new-api-filters">
      <div className="d-inline-flex flex-column input-container">
        <div className="text-label">Symbol</div>
        <Autocomplete
          className="stockchart-autocomplete"
          disablePortal={true}
          id={`autocomplete-`+Math.random()}
          options={symbolListOptions}
          renderInput={(params) => <TextField {...params} variant={'filled'} />}
          value={sym}
          inputValue={typingValue}
          sx={{
            width: '130px'
          }}
          onChange={(event, newValue) => {
            console.log('onChange', newValue)
            if (!newValue) return
            setSym(newValue.value)
          }}
          onInputChange={(event, newInputValue) => {
            setTypingValue(newInputValue);
          }}
        />
      </div>
      <div className="d-inline-flex flex-column input-container">
        <div className="text-label">Timeframe</div>
        <div className="d-flex">
          <input type="text" className="color-white input-timeframe" value={time} onChange={e => setTime(e.target.value)} />
          <select value={timeType} onChange={e => setTimeType(e.target.value)}>
            <option value="mi">mi</option>
            <option value="ho">ho</option>
            <option value="da">da</option>
          </select>
        </div>
      </div>
      <div className="d-inline-flex flex-column input-container">
        <div className="text-label">Bars</div>
        <div className="d-flex">
          <input className="color-white input-bar" value={bar} onChange={e => setBar(e.target.value)} />
        </div>
      </div>
      <div className="d-inline-flex flex-column input-container">
        <div className="text-label">Close</div>
        <select value={close} onChange={e => setClose(e.target.value)}>
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
      </div>
      <div className="d-inline-flex flex-column input-container">
        <div className="text-label">ExtendedHours</div>
        <select value={ext} onChange={e => setExt(e.target.value)}>
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
      </div>
      <div className="d-inline-flex flex-column input-container">
        <Button variant={'contained'} sx={{
          fontSize: '10px',
          width: '20px',
        }} onClick={handleShowChart}>Show</Button>
      </div>
    </div>
  );
};

export default ChartOptions;