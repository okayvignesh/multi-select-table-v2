import { bagStatuses } from "../utils/Data";
import { TbDelta } from "react-icons/tb";

function AllWays({ totalData, filteredData, loading, tillDates, allFlag, summaryWTB }) {
    const showDiff = false;

    const clearedWTB = summaryWTB && summaryWTB.length ? summaryWTB.map(text => text.replace(/\s*\(.*?\)/g, '')).join(', ') : '';

    console.log('totalData', totalData);

    return (
        <div className="all-ways">
            <p className="title">Ways to Buy &nbsp;
                {
                    allFlag ?
                        <span>(All Ways to Buy)</span>
                        : <span>({clearedWTB})</span>
                }
            </p>
            <div className="card-container">
                <div className="table-container py-0">
                    {
                        loading ? <p>Loading....</p>
                            :
                            <>
                                <div className="col-2 left-parent">
                                    <div className="empty-row"></div>
                                    <table className="table left-table">
                                        <thead>
                                            <tr>
                                                <th className="fixed-height-header corner-left-right" style={{ width: "30%" }}>Bag Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                filteredData && filteredData.every(item => item.data.length > 1) && (
                                                    <>
                                                        <div className='gap-div'></div>
                                                        <tr>
                                                            <td style={{ width: "30%", borderTop: 'none' }} className='td-parent' >
                                                                {
                                                                    bagStatuses.map((item) => (
                                                                        <div key={item.name} className={`td-div corner-left-right ${item.className}`}>
                                                                            {item.name}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </td>
                                                        </tr>
                                                    </>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-10 right-table" >
                                    {
                                        filteredData && filteredData
                                            .filter(i => tillDates.some(obj => {
                                                const secondDate = obj.date.split('-')[1].replace(')', '').trim();
                                                return secondDate === i.date;
                                            }))
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((i) => {
                                                const tillDateObj = tillDates.find(obj => {
                                                    const secondDate = obj.date.split('-')[1].replace(')', '').trim();
                                                    return secondDate === i.date;
                                                });

                                                return (
                                                    <div className={`${showDiff ? 'col-6' : 'col-4'}`} key={i.date}>
                                                        <table className="table">
                                                            <thead>
                                                                <tr className="till-day-class">
                                                                    <th style={{ width: "30%" }}>
                                                                        <div className="d-flex px-2">
                                                                            <p>{tillDateObj?.label || ''}</p>
                                                                            {/* <span>{formatDate(new Date(dateOptions[dateOptions.length - 1]['value']))} - {i.date}</span> */}
                                                                        </div>
                                                                    </th>
                                                                </tr>
                                                                <tr className='blue'>
                                                                    <th className='right-parent-th fixed-height-header'>
                                                                        <div className={`right-th fixed-height-header ${showDiff ? 'col-2' : 'col-4'}`}>GBI</div>
                                                                        {
                                                                            showDiff &&
                                                                            <div className='right-th fixed-height-header col-3'><TbDelta /> (AOS - GBI)</div>
                                                                        }
                                                                        <div className={`right-th fixed-height-header ${showDiff ? 'col-2' : 'col-4'}`}>AOS</div>
                                                                        {
                                                                            showDiff &&
                                                                            <div className='right-th fixed-height-header col-3'><TbDelta /> (AOS - FSI)</div>
                                                                        }
                                                                        <div className={`right-th fixed-height-header ${showDiff ? 'col-2' : 'col-4'}`}>FSI</div>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    filteredData && filteredData.every(item => item.data.length > 1) && (
                                                                        <>
                                                                            <div className='gap-div'></div>
                                                                            <tr>
                                                                                {
                                                                                    (allFlag ? totalData.all[i.date] : totalData.selective[i.date]) && Object.keys((allFlag ? totalData.all[i.date] : totalData.selective[i.date])).map((item, key) => {
                                                                                        const subKeys = (allFlag ? totalData.all[i.date] : totalData.selective[i.date])[item];

                                                                                        return (
                                                                                            <td key={key} className='right-parent-th'>
                                                                                                {
                                                                                                    subKeys && (() => {
                                                                                                        const keys = Object.keys(subKeys);

                                                                                                        let orderedKeys = [
                                                                                                            { key: keys[0], className: 'col-4', value: subKeys[keys[0]] },
                                                                                                            { key: keys[1], className: 'col-4', value: subKeys[keys[1]] },
                                                                                                            { key: keys[2], className: 'col-4', value: subKeys[keys[2]] },
                                                                                                        ];


                                                                                                        const safeSubtract = (a, b) => {
                                                                                                            const numA = Number(a);
                                                                                                            const numB = Number(b);
                                                                                                            return isNaN(numA) || isNaN(numB) ? '-' : numB - numA;
                                                                                                        };

                                                                                                        if (showDiff) {
                                                                                                            orderedKeys = [
                                                                                                                { key: keys[0], className: 'col-2', value: subKeys[keys[0]] },
                                                                                                                { key: `${keys[0]} - ${keys[1]}`, className: 'col-3', value: safeSubtract(subKeys[keys[1]], subKeys[keys[0]]) },
                                                                                                                { key: keys[1], className: 'col-2', value: subKeys[keys[1]] },
                                                                                                                { key: `${keys[1]} - ${keys[2]}`, className: 'col-3', value: safeSubtract(subKeys[keys[1]], subKeys[keys[2]]) },
                                                                                                                { key: keys[2], className: 'col-2', value: subKeys[keys[2]] },
                                                                                                            ];
                                                                                                        }

                                                                                                        return orderedKeys.map((item, index) => (
                                                                                                            <div key={index} className={`right-th right-th-body ${item.className}`} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                                                                {item.value}
                                                                                                            </div>
                                                                                                        ));
                                                                                                    })()
                                                                                                }
                                                                                            </td>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </tr>
                                                                        </>
                                                                    )
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )
                                            })
                                    }
                                </div>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default AllWays;