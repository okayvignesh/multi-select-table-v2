import AllWays from "./allWays"

function Summary({ appliedFilters, totalData, loading, filteredData, tillDates, summaryWTB, aos, fsi, gbi, differenceToggle, dynamicHeaderMap, apiStatus }) {
  return (
    <div className="summary">
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={false} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} dynamicHeaderMap={dynamicHeaderMap} apiStatus={apiStatus} />
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={true} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} dynamicHeaderMap={dynamicHeaderMap} apiStatus={apiStatus} />
    </div>
  )
}

export default Summary