import DetailedReport from "./DetailedReport"

function Detailed({ appliedFilters, loading, filteredData, tillDates}) {
    return (
        <div className="detailed">
            <DetailedReport appliedFilters={appliedFilters} loading={loading} filteredData={filteredData} tillDates={tillDates} />
        </div>
    )
}

export default Detailed