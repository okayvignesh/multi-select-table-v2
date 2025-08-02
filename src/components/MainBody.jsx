import { useState, useEffect } from 'react'
import Summary from './Summary'
import Detailed from './Detailed'

function MainBody({ activeTab, appliedFilters, loading, filteredData, totalData, tillDates, summaryWTB, differenceToggle, setDifferenceToggle, countries, waysToBuy, aos, fsi, gbi, setAos, setFsi, setGbi, dynamicHeaderMap }) {
    useEffect(() => {
        const checkedCount = [aos, fsi, gbi].filter(Boolean).length
        if (checkedCount < 2 && differenceToggle) {
            setDifferenceToggle(false)
        }
    }, [aos, fsi, gbi, differenceToggle])

    const handleToggle = () => {
        const checkedCount = [aos, fsi, gbi].filter(Boolean).length
        if (checkedCount >= 2) {
            setDifferenceToggle(prev => !prev)
        }
    }

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target
        const currentState = { aos, fsi, gbi }
        const checkedCount = Object.values(currentState).filter(Boolean).length
        if (!checked && checkedCount === 1) {
            return
        }
        if (name === 'aos') {
            setAos(checked)
        } else if (name === 'fsi') {
            setFsi(checked)
        } else if (name === 'gbi') {
            setGbi(checked)
        }
    }

    return (
        <>
            <div className="main-body">
                {activeTab === 'summary' ? (
                    <Summary
                        appliedFilters={appliedFilters}
                        totalData={totalData}
                        loading={loading}
                        filteredData={filteredData}
                        tillDates={tillDates}
                        summaryWTB={summaryWTB}
                        aos={aos}
                        fsi={fsi}
                        gbi={gbi}
                        dynamicHeaderMap={dynamicHeaderMap}
                        differenceToggle={differenceToggle}
                        handleCheckboxChange={handleCheckboxChange}
                        handleToggle={handleToggle}
                    />
                ) : (
                    <Detailed
                        appliedFilters={appliedFilters}
                        loading={loading}
                        filteredData={filteredData}
                        tillDates={tillDates}
                        aos={aos}
                        fsi={fsi}
                        gbi={gbi}
                        dynamicHeaderMap={dynamicHeaderMap}
                        differenceToggle={differenceToggle}
                        handleCheckboxChange={handleCheckboxChange}
                        handleToggle={handleToggle}
                    />
                )}
            </div>
        </>
    )
}

export default MainBody
