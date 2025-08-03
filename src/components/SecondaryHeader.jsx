import TillDateDropdown from './TillDateDropdown';

function SecondaryHeader({ setActiveTab, activeTab, tillDateOptions, setTillDates, appliedItems, setAppliedItems, dayDescMap }) {
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    }

    return (
        <div className="secondary-header">
            <p className="title">Get Ready - Bag Reconciliation Report</p>

            <ul className="nav nav-underline">
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                        onClick={() => handleTabClick('summary')}
                        style={{ cursor: 'pointer' }}
                    >
                        Summary
                    </a>
                </li>
                <li className="nav-item">
                    <a
                        className={`nav-link ${activeTab === 'detailed' ? 'active' : ''}`}
                        onClick={() => handleTabClick('detailed')}
                        style={{ cursor: 'pointer' }}
                    >
                        Detailed Report
                    </a>
                </li>
            </ul>

            <div className="mb-3">
                <label htmlFor="exampleFormControlInput1" className="form-label">Data</label>
                <TillDateDropdown setTillDates={setTillDates} tillDateOptions={tillDateOptions} appliedItems={appliedItems} setAppliedItems={setAppliedItems} dayDescMap={dayDescMap} />
            </div>
        </div>
    )
}

export default SecondaryHeader;