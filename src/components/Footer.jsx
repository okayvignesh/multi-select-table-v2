import { useState } from 'react'
import { useEffect, useRef } from 'react';
import { MdRefresh, MdOutlineFileDownload } from "react-icons/md";
import { exportToExcel, exportToSummaryExcel } from '../utils/Functions';
import axios from 'axios';
// import ServiceCallsUtil from '../util/ServiceCallsUtil';

function Footer({ filteredData, differenceToggle, activeTab, totalData, summaryWTB, aos, fsi, gbi, tillDates, dynamicHeaderMap, fetchRowData, setApiStatus, showModal, apiStatus }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        let serviceCalls = [];
        serviceCalls = [{
            'serviceName': 'Reports_Refresh_Timestamp',
            'method': 'GET'
        }];
        // ServiceCallsUtil.fireServiceCalls(serviceCalls, (responses) => {
        //             //const result = responses[0].response;
        //             //console.log("sk as response",responses);
        //             setData(responses[0].response[0]);
        //             setLoading(false);
        // });
        axios.get('https://7kyd3.wiremockapi.cloud/timestamp', { timeout: 8000 })
            .then(response => {
                processData(response.data.result);
            })
            .catch(error => {
                let message = "Unknown error";

                if (error.code === 'ECONNABORTED' || error.response) {
                    message = "Timeout occurred while fetching timestamp";
                } else if (error.response) {
                    message = `Error while fetching timestamp API`;
                } else {
                    message = "Failed to fetch timestamp";
                }

                setApiStatus(prev => ({
                    ...prev,
                    timestamp: message
                }));
                showModal();
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);


    const processData = (data) => {
        if (!data.length || !data) {
            setApiStatus(prev => ({
                ...prev,
                timestamp: "Empty response from timestamp API"
            }));
        } else {
            setData(data[0]);
        }
    }


    const handleDownloadPDF = () => {
        window.print();
    }

    const handleExcelExport = () => {
        if (activeTab === 'summary') {
            exportToSummaryExcel({ filteredData, totalData, showDiff: differenceToggle, summaryWTB, aos, fsi, gbi, tillDates });
        } else {
            exportToExcel({
                filteredData,
                showDiff: differenceToggle,
                aos,
                fsi,
                gbi,
                tillDates,
                dynamicHeaderMap
            })
        }
    }

    function getTimeDifferenceFromPST(pstTimestampStr) {
        if (!pstTimestampStr) return '';
        const [day, mon, yearAndTime] = pstTimestampStr.split('-');
        const [year, timeStr] = yearAndTime.split(' ');
        const [hour, min, sec] = timeStr.split(':').map(Number);

        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };

        const month = monthMap[mon];

        const assumedPSTDate_UTC = new Date(Date.UTC(year, month, day, hour, min, sec));

        const assumedPSTDate = new Date(assumedPSTDate_UTC.getTime() + 7 * 60 * 60 * 1000);

        const nowPSTStr = new Date().toLocaleString("en-US", {
            timeZone: "America/Los_Angeles"
        });
        const nowPST = new Date(nowPSTStr);

        const diffMs = nowPST - assumedPSTDate;
        const absDiffMs = Math.abs(diffMs);
        const minutes = Math.floor(absDiffMs / (1000 * 60));
        const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
        const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

        const suffix = diffMs >= 0 ? "ago" : "from now";

        if (days >= 1) return `${days} day(s) ${suffix}`;
        if (hours >= 1) return `${hours} hour(s) ${suffix}`;
        return `${minutes} minute(s) ${suffix}`;
    }


    return (
        <footer className="footer">
            {
                loading ? <p>loading..</p>
                    :
                    <>
                        <div className='footer-box'>
                            <p>Last Refresh Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.Last_Refresh_Time} {getTimeDifferenceFromPST(data?.Last_Refresh_Time)}</p>
                            }
                        </div>
                        <div className='footer-box'>
                            <p>AOS Last Snapshot Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.AOS_Last_Snapshot_Time} {getTimeDifferenceFromPST(data?.AOS_Last_Snapshot_Time)}</p>
                            }
                        </div>
                        <div className='footer-box'>
                            <p>GBI Last Snapshot Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.GBI_Last_Snapshot_Time} {getTimeDifferenceFromPST(data?.GBI_Last_Snapshot_Time)}</p>
                            }
                        </div>
                        <div className='footer-box'>
                            <p>FSI Last Snapshot Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.FSI_Last_Snapshot_Time} {getTimeDifferenceFromPST(data?.FSI_Last_Snapshot_Time)}</p>
                            }
                        </div>
                        <button className="action-button" onClick={fetchRowData}>
                            <MdRefresh size={16} className='me-1' />Refresh
                        </button>
                        <div className='download-box dropdown'>
                            <button className="dropdown-toggle action-button" type="button" id="downloadDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <MdOutlineFileDownload size={16} className='me-1' />
                                Download
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="downloadDropdown" style={{ minWidth: '100px' }}>
                                <li>
                                    <a className="dropdown-item"
                                        onClick={() => handleExcelExport()}>
                                        <span>Excel</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item"
                                        onClick={() => handleDownloadPDF()}>
                                        <span>PDF</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </>
            }
        </footer>
    )
}

export default Footer