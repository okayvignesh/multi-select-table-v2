import { v4 as uuidv4 } from 'uuid';


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


export const transformBagData = ({ data, setFilteredData, setTotalData, setTillDateOptions, setSummaryWTB }) => {
    const waysToBuy = new Set();
    const comboOrder = [];
    const seenCombos = new Set();
    const comboStatusMap = {};
    const bagStatusMap = {
        "Bags Approved": "bagsApproved",
        "Bags Declined": "bagsDeclined",
        "Bags Deleted": "bagsDeleted",
        "Bags Ordered": "bagsOrdered",
        "Bags Pending": "bagsPending",
        "Mass Deleted": "massDeleted",
        "": "openBags",
        "Payments Failed": "paymentsFailed",
        "Total Bags Created": "totalBagsCreated",
        "Total Bags Deleted": "totalBagsDeleted",
        "Total Bags Ordered": "totalBagsOrdered",
    };

    const dateGroups = {};

    data.forEach(item => {
        waysToBuy.add(JSON.stringify({ id: item.Ways_To_Buy, label: item.Ways_To_Buy }));

        const [_, endDate] = item.Day_Range.split(" - ");
        const formattedDate = endDate.trim();
        const countryKey = item.Country;
        const waysKey = item.Ways_To_Buy;
        const groupKey = `${countryKey}__${waysKey}`;
        const statusKey = bagStatusMap[item.Bag_Status];

        if (!seenCombos.has(groupKey)) {
            seenCombos.add(groupKey);
            comboOrder.push(groupKey);
        }

        if (!comboStatusMap[groupKey]) comboStatusMap[groupKey] = new Set();
        if (statusKey) comboStatusMap[groupKey].add(statusKey);

        if (!dateGroups[formattedDate]) {
            dateGroups[formattedDate] = {};
        }

        if (!dateGroups[formattedDate][groupKey]) {
            dateGroups[formattedDate][groupKey] = {
                id: uuidv4(),
                country: countryKey,
                ways_to_buy: waysKey,
                fsi_status: item.FSI_Flag,
            };
        }

        if (statusKey) {
            let fsiValue = item.FSI_Cnt;
            if (item?.FSI_Flag === "N" && item?.FSI_Cnt === '') {
                fsiValue = 'Null';
            }

            // Simply store statusKey directly on the group object
            dateGroups[formattedDate][groupKey][statusKey] = {
                gbi: item.GBI_Cnt,
                aos: item.AOS_Cnt,
                fsi: fsiValue,
            };
        }
    });

    // Fill missing statuses
    Object.keys(dateGroups).forEach(date => {
        const groupData = dateGroups[date];

        comboOrder.forEach(combo => {
            const [country, ways_to_buy] = combo.split("__");

            if (!groupData[combo]) {
                groupData[combo] = {
                    id: uuidv4(),
                    country,
                    ways_to_buy,
                };
            }

            const requiredStatuses = comboStatusMap[combo];
            requiredStatuses.forEach(status => {
                if (!groupData[combo][status]) {
                    groupData[combo][status] = {
                        gbi: '-',
                        aos: '-',
                        fsi: '-',
                    };
                }
            });
        });
    });

    const finalResult = Object.entries(dateGroups).map(([date, groupData]) => ({
        date,
        data: comboOrder.map(combo => groupData[combo]),
    }));

    setFilteredData(finalResult);
    console.log(finalResult)
    pushTillDateOptions({ dates: Object.keys(dateGroups), setTillDateOptions })
    calculateTotals({ data: finalResult, setTotalData, setSummaryWTB });
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


export const calculateTotals = ({ data, setTotalData, setSummaryWTB }) => {
    const newTotalData = {
        all: {},
        selective: {}
    };
    const waysToBuy = [];

    const safeNumber = (v) => (typeof v === 'number' ? v : 0);

    data.forEach(item => {
        const allTotals = {};
        const selectiveTotals = {};

        const initTotals = () => ({
            "bagsApproved": { "gbi": 0, "aos": 0, "fsi": 0 },
            "bagsPending": { "gbi": 0, "aos": 0, "fsi": 0 },
            "bagsDeclined": { "gbi": 0, "aos": 0, "fsi": 0 },
            "totalBagsCreated": { "gbi": 0, "aos": 0, "fsi": 0 },
            "bagsDeleted": { "gbi": 0, "aos": 0, "fsi": 0 },
            "massDeleted": { "gbi": 0, "aos": 0, "fsi": 0 },
            "totalBagsDeleted": { "gbi": 0, "aos": 0, "fsi": 0 },
            "bagsOrdered": { "gbi": 0, "aos": 0, "fsi": 0 },
            "paymentsFailed": { "gbi": 0, "aos": 0, "fsi": 0 },
            "totalBagsOrdered": { "gbi": 0, "aos": 0, "fsi": 0 },
            "openBags": { "gbi": 0, "aos": 0, "fsi": 0 },
        });

        let hasYorN = false;
        let hasY = false;

        Object.assign(allTotals, initTotals());
        Object.assign(selectiveTotals, initTotals());

        item.data.forEach(e => {
            const fsiStatus = e?.fsi_status;

            Object.keys(allTotals).forEach(key => {
                const current = e?.[key];
                if (current) {
                    Object.keys(allTotals[key]).forEach(subKey => {
                        allTotals[key][subKey] += safeNumber(current[subKey]);
                        if (fsiStatus === 'Y') {
                            if (!waysToBuy.includes(e.ways_to_buy)) {
                                waysToBuy.push(e.ways_to_buy);
                            }
                            selectiveTotals[key][subKey] += safeNumber(current[subKey]);
                        }
                    });
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


