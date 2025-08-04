import { useEffect, useRef, useState } from 'react';
import { getTillDates } from "../utils/Functions";

function TillDateDropdown({ tillDateOptions, setTillDates, appliedItems, setAppliedItems, dayDescMap }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [disableApply, setDisableApply] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleItemClick = (date) => {
        if (selectedItems.length === 0 && date) {
            setDisableApply(false);
        }
        if (selectedItems.includes(date)) {
            if (selectedItems.length > 1) {/*
                const newSelectedItems = selectedItems.includes(date)
                ? selectedItems.filter(item => item !== date)
                : [...selectedItems, date];
                setSelectedItems(newSelectedItems);*/
                setSelectedItems(selectedItems.filter(item => item !== date));
            }
        }
        else {
            setSelectedItems([...selectedItems, date]);
        }
    };

    const handleApply = () => {
        setAppliedItems(selectedItems);
        setTillDates(options.filter(opt => selectedItems.includes(opt.date)));
        setIsOpen(false);
    };

    const toggleSelect = () => {
        if (selectedItems.length === options.length) {
            setSelectedItems([]);
            setDisableApply(true);
        } else {
            setSelectedItems(options.map(opt => opt.date));
            setDisableApply(false);
        }
    }

    const handleCancel = () => {
        setSelectedItems(appliedItems);
        setIsOpen(false);
    };

    useEffect(() => {
        if (tillDateOptions.length > 0) {
            const processedOptions = getTillDates(tillDateOptions, dayDescMap);
            setOptions(processedOptions);
            let appliedDates = [];
            let tillAppliedDates = [];


            if (appliedItems && appliedItems.length) {
                appliedDates = processedOptions.filter(option => appliedItems.includes(option.date)).map(option => option.date);
                tillAppliedDates = processedOptions.filter(option => appliedItems.includes(option.date));
            } else {
                appliedDates = processedOptions.map(option => option.date);
                tillAppliedDates = processedOptions;
            }

            setAppliedItems(appliedDates);
            setSelectedItems(appliedDates);
            setTillDates(tillAppliedDates);
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
                    <div style={{ maxHeight: "400px", overflowY: 'scroll', height: 'fit-content' }}>
                        <button className='select-all' onClick={toggleSelect}>{selectedItems.length === options.length ? 'Deselect' : 'Select'} All</button>
                        {options.map(option => (
                            <div key={option.date} className="dropdown-item">
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
                            <button className="btn btn-primary btn-sm px-3" onClick={handleApply} disabled={disableApply}>Apply</button>
                            <button className="btn btn-secondary btn-sm px-3" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TillDateDropdown;
