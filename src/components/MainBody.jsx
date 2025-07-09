import Summary from './Summary'
import Detailed from './Detailed'

function MainBody({ activeTab, appliedFilters, loading, filteredData, totalData, tillDates, summaryWTB }) {
    return (
        <>
            <div className="main-body">
                {activeTab === 'summary' ? <Summary appliedFilters={appliedFilters} totalData={totalData} loading={loading} filteredData={filteredData} tillDates={tillDates} summaryWTB={summaryWTB} /> :
                    <Detailed appliedFilters={appliedFilters} loading={loading} filteredData={filteredData} tillDates={tillDates} />}
            </div>
        </>
    )
}

export default MainBody
