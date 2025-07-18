import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";


function DetailedReport({ appliedFilters, loading, filteredData, tillDates, aos, fsi, gbi, differenceToggle, dynamicHeaderMap }) {

    const toTitleCase = (camelCase) => {
        return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    const [expandedHeaders, setExpandedHeaders] = useState({});

    return (
        <div className="all-ways">
            <p className="title">Ways to Buy &nbsp;<span>(All Ways to Buy)</span></p>
            <div className="card-container">
                <div className="table-container py-0">
                    {
                        loading ? <p>Loading....</p>
                            :
                            <>
                                <div className="col-5 left-parent">
                                    <div className="empty-row"></div>
                                    <table className="table left-table">
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
                                                                                            <span>{match[2].trim()}</span>
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
                                                                            .filter(key => !['id', 'country', 'ways_to_buy', '_raw', 'fsi_status'].includes(key))
                                                                            .map((key) => {
                                                                                const isParent = dynamicHeaderMap[key];
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
                                                                                                {toTitleCase(key)}
                                                                                            </div>
                                                                                            {
                                                                                                expandedHeaders[toggleKey] &&
                                                                                                [...dynamicHeaderMap[key]].map(childKey => (
                                                                                                    <div key={childKey} className="td-div child">
                                                                                                        {toTitleCase(childKey)}
                                                                                                    </div>
                                                                                                ))
                                                                                            }
                                                                                        </div>
                                                                                    );
                                                                                } else if (!Object.values(dynamicHeaderMap).some(children => children.has(key))) {
                                                                                    return (
                                                                                        <div key={key} className="td-div">
                                                                                            {toTitleCase(key)}
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            })
                                                                    }
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-7 right-table" >
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
                                                                                    Object.keys(e).map(key => {
                                                                                        if (['id', 'country', 'ways_to_buy'].includes(key)) return null;

                                                                                        const subKeys = e[key];
                                                                                        const parent = Object.keys(dynamicHeaderMap).find(parentKey =>
                                                                                            dynamicHeaderMap[parentKey].has(key)
                                                                                        );

                                                                                        const toggleKey = `${e.country}|${e.ways_to_buy}|${parent}`;
                                                                                        const isChild = parent !== undefined;
                                                                                        const isParent = dynamicHeaderMap[key] !== undefined;


                                                                                        if (parent && !expandedHeaders[toggleKey]) {
                                                                                            return null;
                                                                                        }

                                                                                        if (typeof subKeys === 'object' && subKeys !== null) {
                                                                                            let orderedKeys = [];
                                                                                            const safeSubtract = (a, b) => {
                                                                                                const numA = Number(a);
                                                                                                const numB = Number(b);
                                                                                                return isNaN(numA) || isNaN(numB) ? '-' : numB - numA;
                                                                                            };
                                                                                            if (differenceToggle) {
                                                                                                if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-2', value: subKeys['gbi'] });
                                                                                                if (gbi && aos) orderedKeys.push({ key: 'gbi-aos', className: 'col-3', value: safeSubtract(subKeys['aos'], subKeys['gbi']) });
                                                                                                if (aos) orderedKeys.push({ key: 'aos', className: 'col-2', value: subKeys['aos'] });
                                                                                                if (aos && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: safeSubtract(subKeys['aos'], subKeys['fsi']) });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-2', value: subKeys['fsi'] });
                                                                                            } else {
                                                                                                if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-4', value: subKeys['gbi'] });
                                                                                                if (aos) orderedKeys.push({ key: 'aos', className: 'col-4', value: subKeys['aos'] });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-4', value: subKeys['fsi'] });
                                                                                            }

                                                                                            return (
                                                                                                <td key={key} className={`right-parent-th ${isParent ? 'parent' : isChild ? 'child' : ''}`}>
                                                                                                    {orderedKeys.map((item, index) => (
                                                                                                        <div key={index} className={`right-th right-th-body ${item.className}`}>
                                                                                                            {item.value}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </td>
                                                                                            );
                                                                                        }

                                                                                        return null;
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