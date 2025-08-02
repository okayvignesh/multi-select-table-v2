import { useState } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';

function AllWays({ totalData, filteredData, loading, tillDates, allFlag, summaryWTB, aos, fsi, gbi, differenceToggle, dynamicHeaderMap, handleCheckboxChange, handleToggle, appliedFilters }) {

    const clearedWTB = summaryWTB && summaryWTB.length ? summaryWTB.map(text => text.replace(/\s*\(.*?\)/g, '')).join(', ') : '';

    const toTitleCase = (camelCase) => {
        return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    const [expandedHeaders, setExpandedHeaders] = useState({});

    const orderedBagStatusKeys = [];
    const seen = new Set();
    const childToParentMap = {};


    const finalKeys = Object.fromEntries(
        Object.entries(dynamicHeaderMap).filter(([key, value]) => key !== value)
    );




    Object.keys(finalKeys).forEach(parent => {
        if (parent === 'openBags') {
            childToParentMap[parent] = null;
            if (!seen.has(parent)) {
                orderedBagStatusKeys.push({ key: parent, isParent: false });
                seen.add(parent);
            }
            return
        }
        if (!seen.has(parent)) {
            orderedBagStatusKeys.push({ key: parent, isParent: true });
            seen.add(parent);
        }
        dynamicHeaderMap[parent].forEach(child => {
            childToParentMap[child] = parent;
            if (!seen.has(child)) {
                orderedBagStatusKeys.push({ key: child, isParent: false });
                seen.add(child);
            }
        });
    });

    const datesToCheck = Object.keys(totalData.all || totalData.selective || {});
    for (let sampleDateKey of datesToCheck) {
        const obj = (allFlag ? totalData.all[sampleDateKey] : totalData.selective[sampleDateKey]) || {};
        Object.keys(obj).forEach(key => {
            if (key === 'openBags') {
                if (!seen.has(key)) {
                    orderedBagStatusKeys.push({ key: key, isParent: false });
                    seen.add(key);
                }
                return
            }
            if (!seen.has(key)) {
                orderedBagStatusKeys.push({ key, isParent: false });
                seen.add(key);
            }
        });
        break;
    }

    const parentKeys = new Set(
        orderedBagStatusKeys.filter(x => x.isParent).map(x => x.key)
    );

    const filteredChildToParentMap = Object.fromEntries(
        Object.entries(childToParentMap).filter(([key]) => !parentKeys.has(key))
    );
    return (
        <div className="all-ways">
            <div className="d-flex justify-content-between">
                <p className="title">Ways to Buy &nbsp;
                    {
                        allFlag ?
                            <>
                                <span>( All Ways to Buy )</span>
                                <span className='lower-table-indicate'>This section includes only GBI and AOS, as Full Price and Carrier Financing are not applicable to FSI.</span>
                            </>
                            : <span>( {clearedWTB} )</span>
                    }
                </p>
                {
                    !allFlag && (
                        <div className="quick-filter">
                            <div className="d-flex align-items-center column-gap-2" style={{ background: '#fbfbfd' }}>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={differenceToggle}
                                        onChange={handleToggle}
                                    />
                                    <span className="slider"></span>
                                </label>
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
                    )
                }
            </div>
            <div className="card-container">
                <div className="table-container py-0">
                    {
                        loading ? <p>Loading....</p>
                            :
                            <>
                                <div className="col-2 left-parent" style={{ height: 'fit-content' }}>
                                    <div className="empty-row"></div>
                                    <table className="table left-table">
                                        <thead>
                                            <tr>
                                                <th className="fixed-height-header corner-left-right" style={{ width: "30%" }}><div className='margin-div'>Bag Status</div></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                filteredData && filteredData.every(item => item.data.length >= 1) && (
                                                    <>
                                                        <div className='gap-div'></div>
                                                        <tr>
                                                            <td style={{ width: "30%", borderTop: 'none' }} className='td-parent' >
                                                                {
                                                                    orderedBagStatusKeys.map(({ key, isParent }) => {
                                                                        const parentKey = childToParentMap[key];
                                                                        if (!isParent && parentKey && !expandedHeaders[parentKey]) {
                                                                            return null; // hide child if parent collapsed
                                                                        }
                                                                        return (
                                                                            <div
                                                                                key={key}
                                                                                className={`td-div corner-left-right ${key === 'openBags' ? 'open-bags-row' : ''}`}
                                                                                style={{ backgroundColor: isParent ? '#e8e8ed' : 'transparent', paddingLeft: isParent ? '10px' : '41px', cursor: isParent ? 'pointer' : 'default' }}
                                                                                onClick={() => {
                                                                                    if (isParent) {
                                                                                        setExpandedHeaders(prev => ({
                                                                                            ...prev,
                                                                                            [key]: !prev[key]
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {isParent && (
                                                                                    expandedHeaders[key] ?
                                                                                        <IoIosArrowDown className="cursor-pointer" /> :
                                                                                        <IoIosArrowForward className="cursor-pointer" />
                                                                                )}
                                                                                {toTitleCase(key)}
                                                                            </div>
                                                                        );
                                                                    })
                                                                }
                                                            </td>
                                                        </tr>
                                                    </>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>

                                <div className="col-10 right-table" style={{ height: 'fit-content' }}>
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
                                                                            <p>{(tillDateObj?.date).replace(/[{()}]/g, '') || ''}</p>
                                                                        </div>
                                                                    </th>
                                                                </tr>
                                                                <tr className='blue'>
                                                                    <th className='right-parent-th fixed-height-header'>
                                                                        {gbi && <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>GBI</div>}
                                                                        {differenceToggle && aos && gbi && <div className='right-th fixed-height-header col-3'> GBI - AOS</div>}
                                                                        {aos && <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>AOS</div>}
                                                                        {differenceToggle && aos && fsi && <div className='right-th fixed-height-header col-3'> AOS - FSI</div>}
                                                                        {fsi && <div className={`right-th fixed-height-header ${differenceToggle ? 'col-2' : 'col-4'}`}>FSI</div>}
                                                                        {differenceToggle && gbi && fsi && <div className='right-th fixed-height-header col-3'> GBI - FSI</div>}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    filteredData && filteredData.every(item => item.data.length >= 1) && (
                                                                        <>
                                                                            <div className='gap-div'></div>
                                                                            <tr>
                                                                                {
                                                                                    (allFlag ? totalData.all[i.date] : totalData.selective[i.date]) &&
                                                                                    Object.keys((allFlag ? totalData.all[i.date] : totalData.selective[i.date]))
                                                                                        .filter(key => {
                                                                                            const parentKey = filteredChildToParentMap[key];
                                                                                            return !(parentKey && !expandedHeaders[parentKey]);
                                                                                        })
                                                                                        .map((item, keyIndex) => {
                                                                                            const subKeys = (allFlag ? totalData.all[i.date] : totalData.selective[i.date])[item];
                                                                                            const safeSubtract = (a, b) => {
                                                                                                const numA = Number(a);
                                                                                                const numB = Number(b);
                                                                                                return isNaN(numA) || isNaN(numB) ? '-' : numB - numA;
                                                                                            };
                                                                                            let orderedKeys = [];
                                                                                            if (differenceToggle) {
                                                                                                if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-2', value: subKeys['gbi'] });
                                                                                                if (gbi && aos) orderedKeys.push({ key: 'gbi-aos', className: 'col-3', value: safeSubtract(subKeys['aos'], subKeys['gbi']) });
                                                                                                if (aos) orderedKeys.push({ key: 'aos', className: 'col-2', value: subKeys['aos'] });
                                                                                                if (aos && fsi) orderedKeys.push({ key: 'aos-fsi', className: 'col-3', value: safeSubtract(subKeys['fsi'], subKeys['aos']) });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-2', value: subKeys['fsi'] });
                                                                                                if (gbi && fsi) orderedKeys.push({ key: 'gbi-fsi', className: 'col-3', value: safeSubtract(subKeys['fsi'], subKeys['gbi']) });
                                                                                            } else {
                                                                                                if (gbi) orderedKeys.push({ key: 'gbi', className: 'col-4', value: subKeys['gbi'] });
                                                                                                if (aos) orderedKeys.push({ key: 'aos', className: 'col-4', value: subKeys['aos'] });
                                                                                                if (fsi) orderedKeys.push({ key: 'fsi', className: 'col-4', value: subKeys['fsi'] });
                                                                                            }
                                                                                            return (
                                                                                                <td key={keyIndex} className={`right-parent-th ${parentKeys.has(item) ? 'parent' : ''} ${item === 'openBags' ? 'open-bags-row-cell' : ''}`}>
                                                                                                    {orderedKeys.map((item, index) => (
                                                                                                        <div key={index} className={`right-th right-th-body ${item.className} ${allFlag && item.key.includes('fsi') ? 'fsi-cell-bgcr' : ''}`} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                                                            {allFlag && item.key.includes('fsi') ? '' : item.value}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </td>
                                                                                            );
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