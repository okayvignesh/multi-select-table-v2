import { useEffect, useState } from 'react';

function TillDateDropdown({ options }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [appliedItems, setAppliedItems] = useState([]);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleItemClick = (date) => {
        const newSelectedItems = selectedItems.includes(date)
            ? selectedItems.filter(item => item !== date)
            : [...selectedItems, date];
        setSelectedItems(newSelectedItems);
    };
    const handleApply = () => {
        setAppliedItems(selectedItems);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setSelectedItems(appliedItems);
        setIsOpen(false);
    };


    useEffect(() => {
        if (options.length > 0) {
            setSelectedItems([options[0].date]);
        }
    }, [options]);

    return (
        <>
            <div className="dropdown tilldate-dp">
                <button
                    className="dropdown-toggle"
                    onClick={toggleDropdown}
                    type="button"
                >
                    {options.length > 0 ? options[0].label : 'No Data'}
                </button>

                {
                    options && options.length > 0 && (
                        <div className={`dropdown-menu custom-end ${isOpen ? 'show' : ''}`}>
                            {options.map(option => (
                                <div key={option.id} className="dropdown-item">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`check-${option.date}`}
                                            checked={selectedItems.includes(option.date)}
                                            onChange={() => handleItemClick(option.date)}
                                        />
                                        <p>{option.label}</p>
                                        <p className="text-muted small-text">{option.date}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="d-flex justify-content-around p-2">
                                <button className="btn btn-primary btn-sm px-3" onClick={handleApply}>Apply</button>
                                <button className="btn btn-secondary btn-sm px-3" onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}

export default TillDateDropdown;