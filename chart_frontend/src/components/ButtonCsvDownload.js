import { CSVLink } from "react-csv"
import { useCsvDownload } from "contexts/CsvDownloadContext"

const ButtonCsvDownload = (props) => {
  const dataset = useCsvDownload()
  return (
    <div className={"d-flex align-items-center pt-2"}>
      <CSVLink data={dataset} filename={props.filename} className={"btn btn-primary py-2"}>Csv Download</CSVLink>
    </div>
  )
}

export default ButtonCsvDownload