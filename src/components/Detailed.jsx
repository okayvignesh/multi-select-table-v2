import DetailedReport from "./DetailedReport"

function Detailed({ appliedFilters, loading, filteredData, tillDates, aos, fsi, gbi, differenceToggle, dynamicHeaderMap, apiStatus, handleCheckboxChange, handleToggle }) {
    return (
        <div className="detailed">
            <DetailedReport appliedFilters={appliedFilters} loading={loading} filteredData={filteredData} tillDates={tillDates} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} dynamicHeaderMap={dynamicHeaderMap} apiStatus={apiStatus} handleCheckboxChange={handleCheckboxChange} handleToggle={handleToggle} />
        </div>
    )
}

export default Detailed