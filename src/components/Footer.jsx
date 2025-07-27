import { useState } from 'react'
import { useEffect, useRef } from 'react';
import { MdRefresh, MdOutlineFileDownload } from "react-icons/md";
import { exportToExcel, exportToSummaryExcel } from '../utils/Functions';
import ErrorModal from './ErrorModal';
import axios from 'axios';

function Footer({ filteredData, differenceToggle, activeTab, totalData, summaryWTB, aos, fsi, gbi, tillDates, dynamicHeaderMap, fetchRowData, setApiStatus, showModal, apiStatus }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);


    const calculateTimeAgo = (timestamp) => {
        if (!timestamp) return '';

        let parts = timestamp.split(' ');
        if (parts.length === 3) {
            parts.shift();
        }
        const [datePart, timePart] = parts;

        const [day, month, year] = datePart.split('-');

        const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
            'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
        };

        const monthNum = monthMap[month];
        const [hours, minutes, seconds] = timePart.split(':');

        const snapshotDate = new Date(Date.UTC(year, monthNum, day, hours, minutes, seconds));
        snapshotDate.setHours(snapshotDate.getHours() + getPSTOffset());

        const currentDate = new Date();
        const pstOffset = getPSTOffset();
        const currentDatePST = new Date(currentDate.getTime() + (pstOffset * 60 * 60 * 1000));

        const diffTime = Math.abs(currentDatePST - snapshotDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

        if (diffDays > 0) {
            return `(${diffDays} days ago)`;
        } else if (diffHours > 0) {
            return `(${diffHours} hours ago)`;
        } else {
            return `(${diffMinutes} minutes ago)`;
        }
    };

    function getPSTOffset() {
        const now = new Date();
        const pstDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            timeZoneName: 'short'
        }).formatToParts(now);

        const tz = pstDate.find(p => p.type === 'timeZoneName')?.value;
        return tz?.includes('PDT') ? -7 : -8;
    }

    useEffect(() => {
        setLoading(true);
        axios.get('https://ryr9j.wiremockapi.cloud/timestamp', { timeout: 8000 })
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
                                    <p className="muted">{data?.Last_Refresh_Time} {calculateTimeAgo(data?.Last_Refresh_Time)}</p>
                            }
                        </div>
                        <div className='footer-box'>
                            <p>AOS Last Snapshot Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.AOS_Last_Snapshot_Time} {calculateTimeAgo(data?.AOS_Last_Snapshot_Time)}</p>
                            }
                        </div>
                        <div className='footer-box'>
                            <p>GBI Last Snapshot Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.GBI_Last_Snapshot_Time} {calculateTimeAgo(data?.GBI_Last_Snapshot_Time)}</p>
                            }
                        </div>
                        <div className='footer-box'>
                            <p>FSI Last Snapshot Time</p>
                            {
                                apiStatus && apiStatus.timestamp ?
                                    <p className="muted">No data to show</p>
                                    :
                                    <p className="muted">{data?.FSI_Last_Snapshot_Time} {calculateTimeAgo(data?.FSI_Last_Snapshot_Time)}</p>
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
                                    <a className="dropdown-item" href="#"
                                        onClick={() => handleExcelExport()}>
                                        <span> Excel</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#"
                                        onClick={() => handleDownloadPDF()}>
                                        <span> PDF</span>
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