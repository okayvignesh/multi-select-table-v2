import { useEffect, useRef, useState } from 'react';
import { getTillDates } from "../utils/Functions";

function TillDateDropdown({ tillDateOptions, setTillDates }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [appliedItems, setAppliedItems] = useState([]);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // const handleItemClick = (date) => {
    //     const newSelectedItems = selectedItems.includes(date)
    //         ? selectedItems.filter(item => item !== date)
    //         : [...selectedItems, date];
    //     setSelectedItems(newSelectedItems);
    // };

    const handleItemClick = (date) => {
        if (selectedItems.includes(date)) {
            if (selectedItems.length > 1) {
                setSelectedItems(selectedItems.filter(item => item !== date));
            }
        } else {
            setSelectedItems([...selectedItems, date]);
        }
    };

    const handleApply = () => {
        setAppliedItems(selectedItems);
        setTillDates(options.filter(opt => selectedItems.includes(opt.date)));
        setIsOpen(false);
    };

    const handleCancel = () => {
        setSelectedItems(appliedItems);
        setIsOpen(false);
    };

    useEffect(() => {
        if (tillDateOptions.length > 0) {
            const processedOptions = getTillDates(tillDateOptions, true);
            setOptions(processedOptions);

            const allDates = processedOptions.map(option => option.date);
            setSelectedItems(allDates);
            setAppliedItems(allDates);
            setTillDates(processedOptions);
        }
    }, [tillDateOptions]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="dropdown tilldate-dp" ref={dropdownRef}>
            <button
                className="dropdown-toggle"
                onClick={toggleDropdown}
                type="button"
            >
                {appliedItems.length > 0
                    ? options.find(o => o.date === appliedItems[0])?.label || 'Select'
                    : 'No Data'}
            </button>

            {options.length > 0 && (
                <div className={`dropdown-menu custom-end ${isOpen ? 'show' : ''}`}>
                    <div style={{ height: "400px", overflowY: 'scroll' }}>
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
                    </div>
                    <div className="border-top border-bottom bg-white" style={{ position: 'sticky', bottom: 0 }}>
                        <div className="d-flex justify-content-around p-2">
                            <button className="btn btn-primary btn-sm px-3" onClick={handleApply}>Apply</button>
                            <button className="btn btn-secondary btn-sm px-3" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TillDateDropdown;
