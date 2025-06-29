function HeaderDropdown({ loading, data, appliedFilters, setAppliedFilters, setFilter, filterType }) {

    const handleWayToBuyClick = (way, event) => {
        setAppliedFilters(prev => {
            if (prev[filterType].length === data.length) {
                return {
                    ...prev,
                    [filterType]: [way.id]
                };
            }

            const newFilter = prev[filterType].includes(way.id)
                ? prev[filterType].filter(id => id !== way.id)
                : [...prev[filterType], way.id];

            return {
                ...prev,
                [filterType]: newFilter
            };
        });

        setFilter(prev => {
            if (prev.length === data.length) {
                return [way.id];
            }
            return prev.includes(way.id)
                ? prev.filter(id => id !== way.id)
                : [...prev, way.id];
        });
    };

    const handleAllClick = () => {
        setAppliedFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType].length === data.length ? [] : data.map(w => w.id)
        }));

        setFilter(prev => prev.length === data.length ? [] : data.map(w => w.id));
    };

    return (
        <div className="header-column">
            {!loading && (
                <li
                    className={appliedFilters[filterType].length === data.length ? 'selected' : ''}
                    onClick={handleAllClick}
                >
                    All
                </li>
            )}
            {
                loading ? <p>Loading...</p> :
                    data.map((way, index) => (
                        <li
                            key={index}
                            onClick={(event) => handleWayToBuyClick(way, event)}
                            className={appliedFilters[filterType].length === data.length ? '' : appliedFilters[filterType].includes(way.id) ? 'selected' : ''}
                        >
                            {way.label}
                        </li>
                    ))
            }
        </div>
    )
}

export default HeaderDropdown