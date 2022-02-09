import { MDBDataTableV5 } from 'mdbreact';
import Pagination from 'react-bootstrap/Pagination'
import Spinner from 'components/Spinner'
import {useDatatableLoading, useDatatable, usePagination, usePaginationUpdate} from "contexts/DatatableContext"

const HeiknDatatable = (props) => {
  const [isLoadingData, ] = useDatatableLoading()
  const [currentPage, itemsPerPage, totalItems] = usePagination();
  const [setCurrentPage, setItemsPerPage, ] = usePaginationUpdate();
  const [datatable,] = useDatatable();

  const handleItemsPerPageChanged = (e) => {
    setItemsPerPage(parseInt(e.target.value))
  }

  const handlePrevClick = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextClick = () => {
    if (currentPage < totalItems) {
      setCurrentPage(currentPage + 1)
    }
  }


  return (
    <>
      {isLoadingData && <div className="hunter-spinner-area"><span className="mr-30">Loading ...</span><Spinner>Loading</Spinner></div>}
      {!isLoadingData && (
      // <MDBDataTableV5
      //   hover
      //   maxHeight="500px"
      //   entriesOptions={[10, 25, 50, 100]}
      //   entries={itemsPerPage}
      //   pagesAmount={itemsPerPage}
      //   data={datatable}
      //   dark={true}
      //   noBottomColumns={true}
      //   small={true}
      //   striped={true}
      //   scrollY={true}
      //   displayEntries={false}
      //   info={false}
      //   paging={false}
      // />
      <MDBDataTableV5 hover entriesOptions={[10, 15]} entries={10} pagesAmount={4} data={datatable} fullPagination  />
      )}

      {/* <div class="mdb-datatable dt-bootstrap4">
        <div class="d-flex align-items-center justify-content-end">
          <div data-test="mdb-datatable-entries" class="mdb-datatable-entries">
            <div data-test="datatable-select" class="mdb-datatable-length bs-select">
              <label>
                Rows per page:
                <select class="custom-select custom-select-sm form-control form-control-sm" style={{ marginLeft: 0.5 + 'rem' }} onChange={handleItemsPerPageChanged}>
                  <option value="10">10</option>1
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
      <Pagination>
        <Pagination.Item>{(currentPage - 1) * itemsPerPage + 1}</Pagination.Item>
        <Pagination.Item>{currentPage * itemsPerPage}</Pagination.Item>
        <Pagination.Item> of </Pagination.Item>
        <Pagination.Item> { totalItems } </Pagination.Item>
        <Pagination.Prev disabled={currentPage <= 1} onClick={() => { handlePrevClick() }}/>
        <Pagination.Next disabled={(currentPage + 1) >= totalItems / itemsPerPage} onClick={() => { handleNextClick() }}/>
      </Pagination> */}

    </>
  )
}

export default HeiknDatatable