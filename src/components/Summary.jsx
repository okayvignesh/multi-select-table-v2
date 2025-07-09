import AllWays from "./allWays"

function Summary({ appliedFilters, totalData, loading, filteredData, tillDates, summaryWTB }) {
  return (
    <div className="summary">
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={false} summaryWTB={summaryWTB} />
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={true} />
    </div>
  )
}

export default Summary