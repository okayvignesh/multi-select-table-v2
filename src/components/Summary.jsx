import AllWays from "./allWays"

function Summary({ appliedFilters, totalData, loading, filteredData, tillDates, summaryWTB, aos, fsi, gbi, differenceToggle, dynamicHeaderMap, apiStatus, handleCheckboxChange, handleToggle }) {
  return (
    <div className="summary">
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={false} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} dynamicHeaderMap={dynamicHeaderMap} apiStatus={apiStatus} handleCheckboxChange={handleCheckboxChange} handleToggle={handleToggle} />
      <AllWays appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} allFlag={true} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} dynamicHeaderMap={dynamicHeaderMap} apiStatus={apiStatus} handleCheckboxChange={handleCheckboxChange} handleToggle={handleToggle} />
    </div>
  )
}

export default Summary