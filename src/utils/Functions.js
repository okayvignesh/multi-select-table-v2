import { v4 as uuidv4 } from 'uuid';
import ExcelJS from "exceljs";
import { bagStatuses } from './Data';
import { saveAs } from "file-saver";

export function formatDate(d) {
    const date = new Date(d);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}


export const extractData = (data, setCountries, setWaysToBuy, setDateOptions) => {
    const countries = new Set();
    const waysToBuy = new Set();
    const dateOptions = new Set()

    data.forEach((item) => {
        countries.add(JSON.stringify({ id: item.Country.split(':')[0], label: item.Country.split(':')[1] }));
        waysToBuy.add(JSON.stringify({ id: item.Ways_To_Buy.split(':')[0], label: item.Ways_To_Buy.split(':')[1] }));
        dateOptions.add(JSON.stringify({ value: formatDate(item.As_of_Date), label: formatDate(item.As_of_Date) }));
    });

    setCountries([...countries].map(item => JSON.parse(item)));
    setWaysToBuy([...waysToBuy].map(item => JSON.parse(item)));
    setDateOptions([...dateOptions].map(item => JSON.parse(item)));
}


export function getFilterLabel(filter, fullList) {
    if (filter.length === fullList.length) return 'All';
    if (filter.length > 1) return 'Multiple';
    return fullList.find(item => item.id === filter[0])?.label || '';
}


export function getTillDates(dateOptions) {
    const dates = [];
    const startDate = dateOptions[0].value;
    const totalDays = dateOptions.length;

    dateOptions.slice().reverse().forEach((item, index) => {
        const labelIndex = totalDays - index;
        const currentEndDate = item.value;

        dates.push({
            label: `Till Day - ${labelIndex} (EOD)`,
            date: `(${startDate} - ${currentEndDate})`,
        });
    });

    return dates;
}


export const transformBagData = ({ data, setFilteredData, setTotalData, setTillDateOptions, setSummaryWTB, setDynamicHeaderMap }) => {
    const waysToBuy = new Set();
    const comboOrder = [];
    const seenCombos = new Set();

    const toCamelCase = (str) => {
        return str
            .split(' ')
            .map((word, index) => {
                const lower = word.toLowerCase();
                if (index === 0) return lower;
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            })
            .join('');
    };

    const bagStatusMap = {};
    const headerStatusesSet = new Set();
    const childStatusesSet = new Set();

    data.forEach(item => {
        if (item.Bag_Header_Status) {
            const key = toCamelCase(item.Bag_Header_Status);
            bagStatusMap[item.Bag_Header_Status] = key;
            headerStatusesSet.add(item.Bag_Header_Status);
        }
        if (item.Bag_Status) {
            const key = toCamelCase(item.Bag_Status);
            bagStatusMap[item.Bag_Status] = key;
            childStatusesSet.add(item.Bag_Status);
        }
    });

    const dynamicBagStatuses = Array.from(new Set([
        ...headerStatusesSet,
        ...childStatusesSet
    ])).map(status => ({
        key: toCamelCase(status),
        name: status,
        className: ""
    }));

    const dynamicHeaderToChildren = {};
    const dateGroups = {};
    const comboHeaderMap = {};
    const comboStatusMap = {};

    data.forEach(item => {
        const [_, endDate] = item.Day_Range.split(" - ");
        const formattedDate = endDate.trim();
        const countryKey = item.Country;
        const waysKey = item.Ways_To_Buy;
        const groupKey = `${countryKey}__${waysKey}`;
        const headerKey = bagStatusMap[item.Bag_Header_Status];
        let statusKey = bagStatusMap[item.Bag_Status];

        if (!headerKey) return;
        if (!statusKey && headerKey == 'openBags') statusKey = "openBags";

        if (!seenCombos.has(groupKey)) {
            seenCombos.add(groupKey);
            comboOrder.push(groupKey);
        }

        if (!dynamicHeaderToChildren[headerKey]) dynamicHeaderToChildren[headerKey] = new Set();
        dynamicHeaderToChildren[headerKey].add(statusKey);

        if (!comboHeaderMap[groupKey]) comboHeaderMap[groupKey] = new Set();
        comboHeaderMap[groupKey].add(headerKey);

        const comboHeaderKey = `${groupKey}__${headerKey}`;
        if (!comboStatusMap[comboHeaderKey]) comboStatusMap[comboHeaderKey] = new Set();
        comboStatusMap[comboHeaderKey].add(statusKey);

        if (!dateGroups[formattedDate]) dateGroups[formattedDate] = {};
        if (!dateGroups[formattedDate][groupKey]) {
            dateGroups[formattedDate][groupKey] = {
                id: uuidv4(),
                country: countryKey,
                ways_to_buy: waysKey,
                fsi_status: item.FSI_Flag,
                _raw: {}
            };
        }

        if (!dateGroups[formattedDate][groupKey]._raw[headerKey]) {
            dateGroups[formattedDate][groupKey]._raw[headerKey] = {};
        }

        let fsiValue = item.FSI_Cnt;
        if (item?.FSI_Flag === "N" && item?.FSI_Cnt === '') {
            fsiValue = 'Null';
        }

        dateGroups[formattedDate][groupKey]._raw[headerKey][statusKey] = {
            gbi: item.GBI_Cnt,
            aos: item.AOS_Cnt,
            fsi: fsiValue,
        };
    });

    Object.keys(dateGroups).forEach(date => {
        const groupData = dateGroups[date];

        comboOrder.forEach(combo => {
            const [country, ways_to_buy] = combo.split("__");
            if (!groupData[combo]) {
                groupData[combo] = {
                    id: uuidv4(),
                    country,
                    ways_to_buy,
                    _raw: {}
                };
            }

            const item = groupData[combo];
            const _raw = item._raw;

            const flattened = {
                id: item.id,
                country: item.country,
                ways_to_buy: item.ways_to_buy,
                fsi_status: item.fsi_status
            };

            dynamicBagStatuses.forEach(({ key }) => {
                let directData = (_raw[key] && _raw[key][key]) || null;

                if (directData) {
                    flattened[key] = {
                        gbi: parseInt(directData.gbi || 0),
                        aos: parseInt(directData.aos || 0),
                        fsi: parseInt(directData.fsi || 0)
                    };
                } else if (dynamicHeaderToChildren[key]) {
                    dynamicHeaderToChildren[key].forEach(childKey => {
                        if (childKey === key) return;
                        const data = (_raw[key] && _raw[key][childKey]) || { gbi: 0, aos: 0, fsi: 0 };
                        flattened[childKey] = {
                            gbi: parseInt(data.gbi || 0),
                            aos: parseInt(data.aos || 0),
                            fsi: parseInt(data.fsi || 0)
                        };
                    });

                    flattened[key] = { gbi: 0, aos: 0, fsi: 0 };
                } else {
                    let found = null;
                    Object.keys(_raw).forEach(h => {
                        if (_raw[h][key]) found = _raw[h][key];
                    });
                    flattened[key] = found
                        ? {
                            gbi: parseInt(found.gbi || 0),
                            aos: parseInt(found.aos || 0),
                            fsi: parseInt(found.fsi || 0)
                        }
                        : { gbi: 0, aos: 0, fsi: 0 };
                }
            });


            groupData[combo] = flattened;
        });
    });

    const finalResult = Object.entries(dateGroups).map(([date, groupData]) => ({
        date,
        data: comboOrder.map(combo => groupData[combo])
    }));

    setFilteredData(finalResult);
    setDynamicHeaderMap(dynamicHeaderToChildren);
    pushTillDateOptions({ dates: Object.keys(dateGroups), setTillDateOptions });
    calculateTotals({ data: finalResult, setTotalData, setSummaryWTB, dynamicHeaderMap: dynamicHeaderToChildren });
};


const pushTillDateOptions = ({ dates, setTillDateOptions }) => {
    const options = [];
    dates.forEach((date, index) => {
        options.push({
            value: date,
            date: date
        });
    });
    setTillDateOptions(options);
};


export const calculateTotals = ({
    data,
    setTotalData,
    setSummaryWTB,
    dynamicHeaderMap
}) => {
    const newTotalData = {
        all: {},
        selective: {}
    };
    const waysToBuy = [];

    const safeNumber = (v) => (typeof v === 'number' ? v : 0);

    const orderedKeys = [];
    const added = new Set();

    Object.keys(dynamicHeaderMap).forEach(parent => {
        if (!added.has(parent)) {
            orderedKeys.push(parent);
            added.add(parent);
        }
        dynamicHeaderMap[parent].forEach(child => {
            if (!added.has(child)) {
                orderedKeys.push(child);
                added.add(child);
            }
        });
    });

    data[0]?.data?.forEach(item => {
        Object.keys(item).forEach(key => {
            if (!['id', 'country', 'ways_to_buy', '_raw', 'fsi_status'].includes(key) && !added.has(key)) {
                orderedKeys.push(key);
                added.add(key);
            }
        });
    });

    data.forEach(item => {
        const allTotals = {};
        const selectiveTotals = {};

        orderedKeys.forEach(key => {
            allTotals[key] = { gbi: 0, aos: 0, fsi: 0 };
            selectiveTotals[key] = { gbi: 0, aos: 0, fsi: 0 };
        });

        let hasYorN = false;
        let hasY = false;

        item.data.forEach(e => {
            const fsiStatus = e?.fsi_status;

            orderedKeys.forEach(key => {
                const current = e?.[key];
                if (current) {
                    allTotals[key].gbi += safeNumber(current.gbi);
                    allTotals[key].aos += safeNumber(current.aos);
                    allTotals[key].fsi += safeNumber(current.fsi);

                    if (fsiStatus === 'Y') {
                        if (!waysToBuy.includes(e.ways_to_buy)) {
                            waysToBuy.push(e.ways_to_buy);
                        }
                        selectiveTotals[key].gbi += safeNumber(current.gbi);
                        selectiveTotals[key].aos += safeNumber(current.aos);
                        selectiveTotals[key].fsi += safeNumber(current.fsi);
                    }
                }
            });

            if (fsiStatus === 'Y' || fsiStatus === 'N') hasYorN = true;
            if (fsiStatus === 'Y') hasY = true;
        });

        if (hasYorN) {
            newTotalData.all[item.date] = allTotals;
        }
        if (hasY) {
            newTotalData.selective[item.date] = selectiveTotals;
        }
    });

    setSummaryWTB(waysToBuy);
    setTotalData(newTotalData);
};


export const exportToExcel = async ({
    filteredData,
    showDiff,
    aos,
    fsi,
    gbi,
    tillDates,
    dynamicHeaderMap
}) => {
    const gbiEnabled = gbi;
    const aosEnabled = aos;
    const fsiEnabled = fsi;


    const toTitleCase = (camelCase) => {
        return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    const filteredExportData = filteredData
        .filter(i => tillDates.some(obj => {
            const secondDate = obj.date.split('-')[1].replace(')', '').trim();
            return secondDate === i.date;
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Detailed Excel Report");

    const safeValue = (val) =>
        val === undefined || val === null || val === "" ? "-" : val;

    const parseOrDash = (val) => {
        if (val === "-" || val === undefined || val === null || val === "") return "-";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "-" : parsed;
    };

    const dates = [...new Set(filteredExportData.map(entry => entry.date))]
        .sort((a, b) => new Date(b) - new Date(a));

    const headerRow1 = [" ", " ", " "];
    const headerRow3 = ["Country", "Ways to Buy", "Bag Status"];

    dates.forEach((_, index) => {
        const labelIndex = dates.length - index;
        const spans = [];
        if (gbiEnabled) spans.push("GBI");
        if (showDiff && aosEnabled && gbiEnabled) spans.push("AOS - GBI");
        if (aosEnabled) spans.push("AOS");
        if (showDiff && aosEnabled && fsiEnabled) spans.push("AOS - FSI");
        if (fsiEnabled) spans.push("FSI");

        headerRow1.push(`Till Day ${labelIndex} EOD`);
        for (let i = 1; i < spans.length; i++) headerRow1.push(null);

        spans.forEach(colName => headerRow3.push(colName));
    });

    worksheet.addRow(headerRow1);
    worksheet.addRow(headerRow3);

    // Merge header cells
    let colIndexForMerge = 4;
    dates.forEach(() => {
        const span =
            (gbiEnabled ? 1 : 0) +
            ((showDiff && aosEnabled && gbiEnabled) ? 1 : 0) +
            (aosEnabled ? 1 : 0) +
            ((showDiff && aosEnabled && fsiEnabled) ? 1 : 0) +
            (fsiEnabled ? 1 : 0);

        if (span > 0) {
            worksheet.mergeCells(1, colIndexForMerge, 1, colIndexForMerge + span - 1);
        }
        colIndexForMerge += span;
    });

    worksheet.getRow(1).eachCell((cell, colNumber) => {
        if (colNumber <= 3) {
            cell.font = { bold: true, color: { argb: "000000" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } };
        } else {
            cell.font = { bold: true, color: { argb: "FFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "283b51" } };
        }
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    worksheet.getRow(2).eachCell(cell => {
        cell.font = { bold: true, color: { argb: "000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    const rowMap = new Map();
    filteredExportData.forEach(({ date, data }) => {
        data.forEach(entry => {
            const key = `${entry.country}||${entry.ways_to_buy}`;
            if (!rowMap.has(key)) rowMap.set(key, {});
            const bags = rowMap.get(key);
            bags[date] = bags[date] || {};
            bags[date]['fsi_status'] = entry.fsi_status;

            Object.keys(entry).forEach(statusKey => {
                if (['id', 'country', 'ways_to_buy', '_raw', 'fsi_status'].includes(statusKey)) return;
                bags[date][statusKey] = entry[statusKey] || { aos: "-", fsi: "-", gbi: "-" };
            });
        });
    });

    rowMap.forEach((dateData, key) => {
        const [country, way] = key.split("||");

        const cleanedHeaderMap = {};

        Object.entries(dynamicHeaderMap).forEach(([key, set]) => {
            const newSet = new Set([...set].filter(item => item !== key));
            cleanedHeaderMap[key] = newSet;
            if (key == 'openBags') cleanedHeaderMap[key] = new Set(['openBags']);
        });

        Object.keys(cleanedHeaderMap).forEach(parentKey => {
            const children = Array.from(cleanedHeaderMap[parentKey] || []);

            let parentHasData = false;
            for (const date of dates) {
                const s = dateData[date]?.[parentKey];
                if (s && (s.gbi !== "-" || s.aos !== "-" || s.fsi !== "-")) {
                    parentHasData = true;
                    break;
                }
            }
            if (parentHasData) {
                const row = [country, way, toTitleCase(parentKey)];
                dates.forEach(date => {
                    const statusData = dateData[date]?.[parentKey];
                    const fsiFlag = dateData[date]?.fsi_status;
                    const gbi = parseOrDash(statusData?.gbi);
                    const aos = parseOrDash(statusData?.aos);
                    let fsi = statusData?.fsi;
                    if (fsiFlag === "N") fsi = "Null"; else fsi = parseOrDash(fsi);

                    if (gbiEnabled) row.push(safeValue(gbi));
                    if (showDiff && aosEnabled && gbiEnabled) {
                        const diffAosGbi = (typeof aos === "number" && typeof gbi === "number") ? aos - gbi : "-";
                        row.push(safeValue(diffAosGbi));
                    }
                    if (aosEnabled) row.push(safeValue(aos));
                    if (showDiff && aosEnabled && fsiEnabled) {
                        const diffAosFsi = (typeof aos === "number" && typeof fsi === "number") ? aos - fsi : "-";
                        row.push(safeValue(diffAosFsi));
                    }
                    if (fsiEnabled) row.push(safeValue(fsi));
                });

                const newRow = worksheet.addRow(row);
                newRow.eachCell((cell, colNumber) => {
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                    if (colNumber > 2) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE8E8ED' }
                        };
                    }
                });

            }

            children.forEach(childKey => {
                if (childKey === 'openBags') return;
                let hasData = false;
                for (const date of dates) {
                    const s = dateData[date]?.[childKey];
                    if (s && (s.gbi !== "-" || s.aos !== "-" || s.fsi !== "-")) {
                        hasData = true;
                        break;
                    }
                }
                if (!hasData) return;

                const row = [country, way, toTitleCase(childKey)];
                dates.forEach(date => {
                    const statusData = dateData[date]?.[childKey];
                    const fsiFlag = dateData[date]?.fsi_status;
                    const gbi = parseOrDash(statusData?.gbi);
                    const aos = parseOrDash(statusData?.aos);
                    let fsi = statusData?.fsi;
                    if (fsiFlag === "N") fsi = "Null"; else fsi = parseOrDash(fsi);

                    if (gbiEnabled) row.push(safeValue(gbi));
                    if (showDiff && aosEnabled && gbiEnabled) {
                        const diffAosGbi = (typeof aos === "number" && typeof gbi === "number") ? aos - gbi : "-";
                        row.push(safeValue(diffAosGbi));
                    }
                    if (aosEnabled) row.push(safeValue(aos));
                    if (showDiff && aosEnabled && fsiEnabled) {
                        const diffAosFsi = (typeof aos === "number" && typeof fsi === "number") ? aos - fsi : "-";
                        row.push(safeValue(diffAosFsi));
                    }
                    if (fsiEnabled) row.push(safeValue(fsi));
                });

                const newRow = worksheet.addRow(row);
                newRow.eachCell(cell => {
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                });
            });
        });
    });

    worksheet.columns.forEach((column, index) => {
        column.width = index < 3 ? 20 : 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .replace(/\..+/, '');
    saveAs(blob, `Detailed_report_${timestamp}.xlsx`);
};


export const exportToSummaryExcel = async ({ filteredData, totalData, showDiff, summaryWTB, aos, fsi, gbi, tillDates }) => {
    const gbiEnabled = gbi;
    const aosEnabled = aos;
    const fsiEnabled = fsi;

    const filteredExportData = filteredData
        .filter(i => tillDates.some(obj => {
            const secondDate = obj.date.split('-')[1].replace(')', '').trim();
            return secondDate === i.date;
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));


    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Detailed Excel Report");

    const safeValue = (val) =>
        val === undefined || val === null || val === "" ? "-" : val;

    const parseOrDash = (val) => {
        if (val === "-" || val === undefined || val === null || val === "") return "-";
        const parsed = parseFloat(val);
        return isNaN(parsed) ? "-" : parsed;
    };

    const dates = [...new Set(filteredExportData.map(entry => entry.date))]
        .sort((a, b) => new Date(b) - new Date(a));

    const createHeaderRows = (startRowIdx) => {
        const headerRow1 = [" "];
        dates.forEach((_, index) => {
            const labelIndex = dates.length - index;
            headerRow1.push(`Till Day ${labelIndex} EOD`);
            const extraCells =
                gbiEnabled +
                (showDiff && aosEnabled && gbiEnabled) +
                aosEnabled +
                (showDiff && aosEnabled && fsiEnabled) +
                fsiEnabled - 1;
            for (let i = 0; i < extraCells; i++) {
                headerRow1.push(null);
            }
        });

        const headerRow3 = ["Bag Status"];
        dates.forEach(() => {
            if (gbiEnabled) headerRow3.push("GBI");
            if (showDiff && aosEnabled && gbiEnabled) headerRow3.push("AOS - GBI");
            if (aosEnabled) headerRow3.push("AOS");
            if (showDiff && aosEnabled && fsiEnabled) headerRow3.push("AOS - FSI");
            if (fsiEnabled) headerRow3.push("FSI");
        });

        worksheet.insertRow(startRowIdx, headerRow1);
        worksheet.insertRow(startRowIdx + 1, headerRow3);

        worksheet.getRow(startRowIdx).eachCell((cell, colNumber) => {
            if (colNumber === 1) {
                cell.font = { bold: true, color: { argb: "000000" } };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } };
            } else {
                cell.font = { bold: true, color: { argb: "FFFFFF" } };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0070C0" } };
            }
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        worksheet.getRow(startRowIdx + 1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: "000000" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "d3d3d3" } };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        let colIndexForMerge = 2;
        dates.forEach(() => {
            const span =
                gbiEnabled +
                (showDiff && aosEnabled && gbiEnabled) +
                aosEnabled +
                (showDiff && aosEnabled && fsiEnabled) +
                fsiEnabled;
            worksheet.mergeCells(startRowIdx, colIndexForMerge, startRowIdx, colIndexForMerge + span - 1);
            colIndexForMerge += span;
        });

        return startRowIdx + 2;
    };

    const addDataRows = (blockData, startRowIdx) => {
        bagStatuses.forEach(({ key: statusKey, name }) => {
            let hasData = false;
            for (const date of dates) {
                const s = blockData[date]?.[statusKey];
                if (s && (s.gbi !== "-" || s.aos !== "-" || s.fsi !== "-")) {
                    hasData = true;
                    break;
                }
            }
            if (!hasData) return;

            const row = [name];
            dates.forEach(date => {
                const statusData = blockData[date]?.[statusKey] || {};
                const gbi = parseOrDash(statusData?.gbi);
                const aos = parseOrDash(statusData?.aos);
                let fsi = parseOrDash(statusData?.fsi);
                if (statusData?.FSI_Flag === "N" && statusData?.FSI_Cnt === '') {
                    fsi = "Null";
                }

                if (gbiEnabled) row.push(safeValue(gbi));
                if (showDiff && aosEnabled && gbiEnabled) {
                    const diffAosGbi = (typeof aos === "number" && typeof gbi === "number") ? aos - gbi : "-";
                    row.push(safeValue(diffAosGbi));
                }
                if (aosEnabled) row.push(safeValue(aos));
                if (showDiff && aosEnabled && fsiEnabled) {
                    const diffAosFsi = (typeof aos === "number" && typeof fsi === "number") ? aos - fsi : "-";
                    row.push(safeValue(diffAosFsi));
                }
                if (fsiEnabled) row.push(safeValue(fsi));
            });

            const newRow = worksheet.insertRow(startRowIdx++, row);
            newRow.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });
        });

        return startRowIdx;
    };

    const addSectionHeading = (text, startRowIdx, totalCols) => {
        worksheet.mergeCells(startRowIdx, 1, startRowIdx, totalCols);
        const cell = worksheet.getRow(startRowIdx).getCell(1);
        cell.value = text;
        cell.font = { bold: true, size: 14 };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" }
        };

        worksheet.insertRow(startRowIdx + 1, []);
        return startRowIdx + 2;
    };


    const clearedWTB = summaryWTB && summaryWTB.length ? summaryWTB.map(text => text.replace(/\s*\(.*?\)/g, '')).join(', ') : '';
    let totalCols =
        1 + dates.length * (
            gbiEnabled +
            (showDiff && aosEnabled && gbiEnabled) +
            aosEnabled +
            (showDiff && aosEnabled && fsiEnabled) +
            fsiEnabled
        );

    let nextRow = 1;
    nextRow = addSectionHeading(`Ways to Buy (${clearedWTB})`, nextRow, totalCols);
    nextRow = createHeaderRows(nextRow);
    nextRow = addDataRows(totalData["selective"], nextRow);


    nextRow += 3;
    nextRow = addSectionHeading("Ways to Buy (All ways to buy)", nextRow, totalCols);
    nextRow = createHeaderRows(nextRow);
    nextRow = addDataRows(totalData["all"], nextRow);


    worksheet.columns.forEach((column, index) => {
        column.width = index === 0 ? 20 : 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .replace(/\..+/, '');
    saveAs(blob, `Summary_report_${timestamp}.xlsx`);
};