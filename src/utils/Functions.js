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


export function getTillDates(dateOptions, showDiff = false) {
    const dates = [];
    dateOptions.forEach((_, index) => {
        const labelIndex = dateOptions.length - index;
        const currentDate = dateOptions[index].value;
        const maxDate = dateOptions[dateOptions.length - 1].value;
        dates.push({
            label: `Till Day - ${labelIndex} (EOD)`,
            date: `(${maxDate} - ${currentDate})`,
        });
    });
    return dates;
}