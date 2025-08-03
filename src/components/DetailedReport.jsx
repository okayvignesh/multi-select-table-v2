import React, { useState, useRef } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";


function DetailedReport({ appliedFilters, loading, filteredData, tillDates, aos, fsi, gbi, differenceToggle, dynamicHeaderMap, handleCheckboxChange, handleToggle }) {

    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const isSyncing = useRef(false);

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

    const handleScroll = (source, target) => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        target.scrollTop = source.scrollTop;
        isSyncing.current = false;
    };


    return (
        <div className="all-ways">
            <div className="sticky-toggle">
                <p className="title">Ways to Buy &nbsp;<span>(All Ways to Buy)</span></p>
                <div className="quick-filter">
                    <div className="d-flex align-items-center column-gap-1">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={differenceToggle}
                                onChange={handleToggle}
                            />
                            <span className="slider"></span>
                        </label>
                        <div className="label-checkbox">
                            Show Differences
                        </div>
                    </div>
                    <div className="checkboxes">
                        <label>
                            <input
                                type="checkbox"
                                name="aos"
                                checked={aos}
                                onChange={handleCheckboxChange}
                            />
                            AOS
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="fsi"
                                checked={fsi}
                                onChange={handleCheckboxChange}
                            />
                            FSI
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="gbi"
                                checked={gbi}
                                onChange={handleCheckboxChange}
                            />
                            GBI
                        </label>
                    </div>
                </div>
            </div>
            <div className="card-container">
                <div className="table-container py-0">
                    {
                        loading ? <p>Loading....</p>
                            :
                            <>
                                <div className="col-5 left-parent" ref={leftRef} onScroll={() =>
                                    handleScroll(leftRef.current, rightRef.current)
                                }>
                                    <div className="empty-row"></div>
                                    <table className="table left-table mb-0">
                                        <thead>
                                            <tr>
                                                <th className="fixed-height-header corner-left-right" style={{ width: "25%" }}><div className='margin-div'>Country</div></th>
                                                <th className="fixed-height-header corner-left-right" style={{ width: "45%" }}><div className='margin-div'>Ways to Buy</div></th>
                                                <th className="fixed-height-header corner-left-right" style={{ width: "30%" }}><div className='margin-div'>Bag Status</div></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                filteredData &&
                                                //filteredData.find((e) => e.date === appliedFilters.filter2)?.data.map((i, index) => {
                                                filteredData[0].data.map((i, index) => {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <div className='gap-div'></div>
                                                            <tr>
                                                                <td className="corner-left" style={{ width: "30%", borderTop: 'none', borderBottom: 'none' }}>{i.country}</td>
                                                                <td className="corner-left position-relative" style={{ width: "30%", borderTop: 'none', borderBottom: 'none', maxWidth: '150px' }}>
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
                                                                            .filter(key => !['id', 'country', 'ways_to_buy', '_raw', 'fsi_status'].includes(key))
                                                                            .map((key) => {
                                                                                let isParent = cleanedHeaderMap[key];
                                                                                const toggleKey = `${i.country}|${i.ways_to_buy}|${key}`;
                                                                                if (key === 'openBags') {
                                                                                    isParent = false;
                                                                                }
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
                                                                                        <div key={key} className="td-div open-bags-row">
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
                                                                    <tr key={`openBags-${index}`} style={{ height: '27px' }}>
                                                                        <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}></td>
                                                                        <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}></td>
                                                                        <td style={{ width: "30%", borderTop: 'none', borderBottom: '1px solid #ccc' }}>
                                                                            <div className="td-div open-bags">{toTitleCase("openBags")}</div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                        </React.Fragment>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-7 right-table" ref={rightRef} onScroll={() =>
                                    handleScroll(rightRef.current, leftRef.current)
                                }>
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
                                                                            <div className='right-th fixed-height-header col-3' style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}> GBI - AOS</div>
                                                                        }
                                                                        {
                                                                            aos &&
                                                                            <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>AOS</div>
                                                                        }
                                                                        {
                                                                            differenceToggle && aos && fsi &&
                                                                            <div className='right-th fixed-height-header col-3' style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}> AOS - FSI</div>
                                                                        }
                                                                        {
                                                                            fsi &&
                                                                            <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>FSI</div>
                                                                        }
                                                                        {
                                                                            differenceToggle && gbi && fsi &&
                                                                            <div className='right-th fixed-height-header col-3' style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}> GBI - FSI</div>
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
                                                                                        const subKeys = e[parentKey];
                                                                                        const isParent = true;
                                                                                        const fsiStatus = e.fsi_status;

                                                                                        if (!subKeys) return null;

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
                                                                                                if (aos && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: fsiStatus === 'N' ? '-' : safeSubtract(dataObj['fsi'], dataObj['aos']) });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-2', value: fsiStatus === 'N' ? '-' : dataObj['fsi'] });
                                                                                                if (gbi && fsi) orderedKeys.push({ key: 'fsi-gbi', className: 'col-3', value: fsiStatus === 'N' ? '-' : safeSubtract(dataObj['fsi'], dataObj['gbi']) });
                                                                                            } else {
                                                                                                if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-4', value: dataObj['gbi'] });
                                                                                                if (aos) orderedKeys.push({ key: 'aos', className: 'col-4', value: dataObj['aos'] });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-4', value: fsiStatus === 'N' ? '-' : dataObj['fsi'] });
                                                                                            }

                                                                                            const classList = [
                                                                                                "right-parent-th",
                                                                                                isParent ? "parent" : "",
                                                                                                isChild ? "child" : ""
                                                                                            ].join(" ").trim();

                                                                                            return (
                                                                                                <td className={classList} style={{ height: parentKey === 'openBags' ? '27px' : 'none' }}>
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
                                                                                                {renderCells(subKeys, true, false)}

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







                                                                                    /*
                                                                                    Object.keys(e).map(key => {
                                                                                        if (['id', 'country', 'ways_to_buy'].includes(key)) return null;

                                                                                        const subKeys = e[key];
                                                                                        const fsiStatus = e.fsi_status;
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
                                                                                                if (aos && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: fsiStatus ==='N' ? '-' : safeSubtract(subKeys['fsi'], subKeys['aos']) });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-2', value: fsiStatus ==='N' ? '-' : subKeys['fsi'] });
                                                                                                if (gbi && fsi) orderedKeys.push({ key: 'fsi-gbi', className: 'col-3', value: fsiStatus ==='N' ? '-' : safeSubtract(subKeys['fsi'], subKeys['gbi']) });
                                                                                            } else {
                                                                                                if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-4', value: subKeys['gbi'] });
                                                                                                if (aos) orderedKeys.push({ key: 'aos', className: 'col-4', value: subKeys['aos'] });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-4', value: fsiStatus ==='N' ? '-' : subKeys['fsi'] });
                                                                                            }
                                                                                            return (
                                                                                                <td key={key} className={`right-parent-th ${isParent ? 'parent' : isChild ? 'child' : ''} ${key==='openBags' ? 'open-bags-row-cell' : ''}`}>
                                                                                                    {orderedKeys.map((item, index) => (
                                                                                                        <div key={index} className={`right-th right-th-body ${item.className}`}>
                                                                                                            {item.value}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </td>
                                                                                            );
                                                                                        }

                                                                                        return null;
                                                                                    })*/
                                                                                }
                                                                            </tr>

                                                                            {/*e.openBags && (
                                                                                <tr style={{ borderTop: 'none', borderBottom: '1px solid #ccc' }}>
                                                                                    <td className="right-parent-th parent" style={{borderTop: 'none'}}>
                                                                                        {
                                                                                            (() => {
                                                                                                let orderedKeys = [];
                                                                                                const safeSubtract = (a, b) => {
                                                                                                    const numA = Number(a);
                                                                                                    const numB = Number(b);
                                                                                                    return isNaN(numA) || isNaN(numB) ? '-' : numB - numA;
                                                                                                };
                                                                                                const fsiStatus = e.fsi_status;
                                                                                                const subKeys = e.openBags;
                                                                                                if (differenceToggle) {
                                                                                                    if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-2', value: subKeys['gbi'] });
                                                                                                    if (gbi && aos) orderedKeys.push({ key: 'gbi-aos', className: 'col-3', value: safeSubtract(subKeys['aos'], subKeys['gbi']) });
                                                                                                    if (aos) orderedKeys.push({ key: 'aos', className: 'col-2', value: subKeys['aos'] });
                                                                                                    if (aos && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: fsiStatus ==='N' ? '-' : safeSubtract(subKeys['fsi'], subKeys['aos']) });
                                                                                                    if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-2', value: fsiStatus ==='N' ? '-' : subKeys['fsi']});
                                                                                                    if (gbi && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: fsiStatus ==='N' ? '-' : safeSubtract(subKeys['fsi'], subKeys['gbi']) });
                                                                                                } else {
                                                                                                    if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-4', value: subKeys['gbi'] });
                                                                                                    if (aos) orderedKeys.push({ key: 'aos', className: 'col-4', value: subKeys['aos'] });
                                                                                                    if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-4', value: fsiStatus ==='N' ? '-' : subKeys['fsi'] });
                                                                                                }

                                                                                                return orderedKeys.map((item, index) => (
                                                                                                    <div key={index} className={`right-th right-th-body ${item.className}`}>
                                                                                                        {item.value}
                                                                                                    </div>
                                                                                                ));
                                                                                            })()
                                                                                        }
                                                                                    </td>
                                                                                </tr>
                                                                            )*/}

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