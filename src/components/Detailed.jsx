import DetailedReport from "./DetailedReport"

function Detailed({ appliedFilters, loading, filteredData, tillDates, aos, fsi, gbi, differenceToggle }) {
    return (
        <div className="detailed">
            <DetailedReport appliedFilters={appliedFilters} loading={loading} filteredData={filteredData} tillDates={tillDates} aos={aos} fsi={fsi} gbi={gbi} differenceToggle={differenceToggle} />
        </div>
    )
}

export default Detailed