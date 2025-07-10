import AllWays from "./allWays"

function Summary({ appliedFilters, totalData, loading, filteredData, tillDates, summaryWTB, aos, fsi, gbi, differenceToggle }) {
  return (
    <div className="summary">
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={false} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} />
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={true} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} />
    </div>
  )
}

export default Summary