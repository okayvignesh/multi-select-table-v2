import { bagStatuses } from "../utils/Data";

function AllWays({ totalData, filteredData, loading, tillDates, allFlag, summaryWTB, aos, fsi, gbi, differenceToggle }) {

    const clearedWTB = summaryWTB && summaryWTB.length ? summaryWTB.map(text => text.replace(/\s*\(.*?\)/g, '')).join(', ') : '';

    console.log(tillDates)
    return (
        <div className="all-ways">
            <p className="title">Ways to Buy &nbsp;
                {
                    allFlag ?
                        <span>( All Ways to Buy )</span>
                        : <span>( {clearedWTB} )</span>
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
                                                    <div className={`${differenceToggle ? 'col-6' : 'col-4'}`} key={i.date}>
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
                                                                        {
                                                                            gbi &&
                                                                            <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>GBI</div>
                                                                        }
                                                                        {
                                                                            differenceToggle && aos && gbi &&
                                                                            <div className='right-th fixed-height-header col-3'> AOS - GBI</div>
                                                                        }
                                                                        {
                                                                            aos &&
                                                                            <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>AOS</div>
                                                                        }
                                                                        {
                                                                            differenceToggle && aos && fsi &&
                                                                            <div className='right-th fixed-height-header col-3'> AOS - FSI</div>
                                                                        }
                                                                        {
                                                                            fsi &&
                                                                            <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>FSI</div>
                                                                        }
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

                                                                                                        const safeSubtract = (a, b) => {
                                                                                                            const numA = Number(a);
                                                                                                            const numB = Number(b);
                                                                                                            return isNaN(numA) || isNaN(numB) ? '-' : numB - numA;
                                                                                                        };


                                                                                                        let orderedKeys = [];
                                                                                                        if (differenceToggle) {
                                                                                                            if (gbi) {
                                                                                                                orderedKeys.push({ key: 'gbi', className: 'col-2', value: subKeys['gbi'] });
                                                                                                            }
                                                                                                            if (gbi && aos) {
                                                                                                                orderedKeys.push({ key: 'gbi-aos', className: 'col-3', value: safeSubtract(subKeys['aos'], subKeys['gbi']) });
                                                                                                            }
                                                                                                            if (aos) {
                                                                                                                orderedKeys.push({ key: 'aos', className: 'col-2', value: subKeys['aos'] });
                                                                                                            }
                                                                                                            if (aos && fsi) {
                                                                                                                orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: safeSubtract(subKeys['aos'], subKeys['fsi']) });
                                                                                                            }
                                                                                                            if (fsi) {
                                                                                                                orderedKeys.push({ key: 'fsi', className: 'col-2', value: subKeys['fsi'] });
                                                                                                            }
                                                                                                        } else {
                                                                                                            if (gbi) {
                                                                                                                orderedKeys.push({ key: 'gbi', className: 'col-4', value: subKeys['gbi'] });
                                                                                                            }
                                                                                                            if (aos) {
                                                                                                                orderedKeys.push({ key: 'aos', className: 'col-4', value: subKeys['aos'] });
                                                                                                            }
                                                                                                            if (fsi) {
                                                                                                                orderedKeys.push({ key: 'fsi', className: 'col-4', value: subKeys['fsi'] });
                                                                                                            }
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