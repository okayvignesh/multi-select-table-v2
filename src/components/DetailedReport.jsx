import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";


function DetailedReport({ appliedFilters, loading, filteredData, tillDates, aos, fsi, gbi, differenceToggle, dynamicHeaderMap, apiStatus }) {

    const toTitleCase = (camelCase) => {
        return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    const [expandedHeaders, setExpandedHeaders] = useState({});

    const cleanedHeaderMap = {};

    Object.entries(dynamicHeaderMap).forEach(([key, set]) => {
        const newSet = new Set([...set].filter(item => item !== key));
        cleanedHeaderMap[key] = newSet;
        if (key == 'openBags') cleanedHeaderMap[key] = new Set(['openBags']);
    });

    console.log(cleanedHeaderMap)

    return (
        <div className="all-ways">
            <p className="title">Ways to Buy &nbsp;<span>(All Ways to Buy)</span></p>
            <div className="card-container">
                <div className="table-container py-0">
                    {
                        loading ? <p>Loading....</p>
                            : apiStatus && apiStatus.rowdata ? <p>No data to show</p>
                                :
                                <>
                                    <div className="col-6 left-parent">
                                        <div className="empty-row"></div>
                                        <table className="table left-table" style={{tableLayout: 'fixed'}}>
                                            <thead>
                                                <tr>
                                                    <th className="fixed-height-header corner-left-right" style={{ width: "30%" }}>Country</th>
                                                    <th className="fixed-height-header corner-left-right" style={{ width: "40%" }}>Ways to Buy</th>
                                                    <th className="fixed-height-header corner-left-right" style={{ width: "30%" }}>Bag Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    filteredData &&
                                                    filteredData.find((e) => e.date === appliedFilters.filter2)?.data.map((i, index) => {
                                                        return (
                                                            <React.Fragment key={index}>
                                                                <div className='gap-div'></div>
                                                                <tr>
                                                                    <td className="corner-left" style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}>{i.country}</td>
                                                                    <td className="corner-left" style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}>
                                                                        {
                                                                            (() => {
                                                                                const match = i.ways_to_buy.match(/^([^\(]+)(\(.+\))?$/);
                                                                                return match ? (
                                                                                    <>
                                                                                        {match[1].trim()}
                                                                                        {match[2] && (
                                                                                            <>
                                                                                                <br />
                                                                                                <span className="position-absolute">{match[2].trim()}</span>
                                                                                            </>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    i.ways_to_buy
                                                                                );
                                                                            })()
                                                                        }
                                                                    </td>
                                                                    <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }} className='td-parent'>
                                                                        {
                                                                            Object.keys(i)
                                                                                .filter(key => !['id', 'country', 'ways_to_buy', '_raw', 'fsi_status', 'openBags'].includes(key))
                                                                                .map((key) => {
                                                                                    const isParent = cleanedHeaderMap[key];
                                                                                    const toggleKey = `${i.country}|${i.ways_to_buy}|${key}`;

                                                                                    if (isParent) {
                                                                                        return (
                                                                                            <div key={key}>
                                                                                                <div
                                                                                                    className="td-div parent"
                                                                                                    onClick={() =>
                                                                                                        setExpandedHeaders(prev => ({
                                                                                                            ...prev,
                                                                                                            [toggleKey]: !prev[toggleKey]
                                                                                                        }))
                                                                                                    }
                                                                                                >
                                                                                                    {expandedHeaders[toggleKey] ? <IoIosArrowDown className="cursor-pointer" />
                                                                                                        : <IoIosArrowForward className="cursor-pointer" />
                                                                                                    }
                                                                                                    <span className="overflow-status">{toTitleCase(key)}</span>
                                                                                                </div>
                                                                                                {
                                                                                                    expandedHeaders[toggleKey] &&
                                                                                                    [...cleanedHeaderMap[key]].map(childKey => (
                                                                                                        <div key={childKey} className="td-div child">
                                                                                                            <span className="overflow-status">{toTitleCase(childKey)}</span>
                                                                                                        </div>
                                                                                                    ))
                                                                                                }
                                                                                            </div>
                                                                                        );
                                                                                    } else if (!Object.values(cleanedHeaderMap).some(children => children.has(key))) {
                                                                                        return (
                                                                                            <div key={key} className="td-div">
                                                                                                <span className="overflow-status">{toTitleCase(key)}</span>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    return null;
                                                                                })
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                {
                                                                    i.openBags && (
                                                                        <tr key={`openBags-${index}`}>
                                                                            <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}></td>
                                                                            <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}></td>
                                                                            <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}>
                                                                                <div className="td-div open-bags">{toTitleCase("openBags")}</div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                }
                                                            </React.Fragment>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-6 right-table" >
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
                                                                        i.data && i.data.map((e, rowIndex) => (
                                                                            <React.Fragment key={rowIndex}>
                                                                                <div className='gap-div'></div>
                                                                                <tr style={{ borderTop: 'none', borderBottom: '1px solid #ccc' }}>
                                                                                    {
                                                                                        Object.keys(cleanedHeaderMap).map((parentKey) => {
                                                                                            const toggleKey = `${e.country}|${e.ways_to_buy}|${parentKey}`;
                                                                                            const parentData = e[parentKey];
                                                                                            const isParent = true;

                                                                                            if (!parentData) return null;

                                                                                            const safeSubtract = (a, b) => {
                                                                                                const numA = Number(a);
                                                                                                const numB = Number(b);
                                                                                                return isNaN(numA) || isNaN(numB) ? '-' : numB - numA;
                                                                                            };

                                                                                            const renderCells = (dataObj, isParent = false, isChild = false) => {
                                                                                                const orderedKeys = [];

                                                                                                if (differenceToggle) {
                                                                                                    if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-2', value: dataObj['gbi'] });
                                                                                                    if (gbi && aos) orderedKeys.push({ key: 'gbi-aos', className: 'col-3', value: safeSubtract(dataObj['aos'], dataObj['gbi']) });
                                                                                                    if (aos) orderedKeys.push({ key: 'aos', className: 'col-2', value: dataObj['aos'] });
                                                                                                    if (aos && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: safeSubtract(dataObj['aos'], dataObj['fsi']) });
                                                                                                    if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-2', value: dataObj['fsi'] });
                                                                                                } else {
                                                                                                    if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-4', value: dataObj['gbi'] });
                                                                                                    if (aos) orderedKeys.push({ key: 'aos', className: 'col-4', value: dataObj['aos'] });
                                                                                                    if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-4', value: dataObj['fsi'] });
                                                                                                }

                                                                                                const classList = [
                                                                                                    "right-parent-th",
                                                                                                    isParent ? "parent" : "",
                                                                                                    isChild ? "child" : ""
                                                                                                ].join(" ").trim();

                                                                                                return (
                                                                                                    <td className={classList}>
                                                                                                        {orderedKeys.map((item, index) => (
                                                                                                            <div key={index} className={`right-th right-th-body ${item.className}`}>
                                                                                                                {item.value}
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </td>
                                                                                                );
                                                                                            };

                                                                                            return (
                                                                                                <React.Fragment key={parentKey}>
                                                                                                    {renderCells(parentData, true, false)}

                                                                                                    {
                                                                                                        expandedHeaders[toggleKey] &&
                                                                                                        [...cleanedHeaderMap[parentKey]].map(childKey => {
                                                                                                            const childData = e[childKey];
                                                                                                            if (!childData) return null;
                                                                                                            return renderCells(childData, false, true);
                                                                                                        })
                                                                                                    }
                                                                                                </React.Fragment>
                                                                                            );
                                                                                        })

                                                                                    }
                                                                                </tr>
                                                                            </React.Fragment>
                                                                        ))
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

export default DetailedReport