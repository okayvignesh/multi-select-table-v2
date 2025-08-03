// CalendarComponent.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarComponent = ({
    selectRange = false,
    value,
    enabledDates = [],
    setValue,
    minDate,
    maxDate,
    dateOptions
}) => {
    const [view, setView] = useState('month');
    const [calendarKey, setCalendarKey] = useState(0);

    const handleViewChange = ({ view }) => {
        setView(view);
    };

    const tileDisabled = ({ date, view }) => {
        if (view !== 'month') return false;
        if (enabledDates.length === 0) return false;
        return !enabledDates.some(d => d.toDateString() === date.toDateString());
    };

    const handleDateChange = (val) => {
        const formatDate = (date) => {
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
        };

        if (Array.isArray(val)) {
            const [start, end] = val;
            const formatted = [formatDate(start), formatDate(end)];
            setValue(formatted);
        } else {
            const formatted = formatDate(val);
            setValue(formatted);
        }
    };

    const goToLatestDate = () => {
        if (!dateOptions || dateOptions.length === 0) return;

        const latest = dateOptions.reduce((max, curr) =>
            new Date(curr.value) > new Date(max.value) ? curr : max
        );

        const latestDate = new Date(latest.value);
        handleDateChange(latestDate);
        setCalendarKey(prev => prev + 1);
    };

    return (
        <>
            <div className='calendar-container'>
                <Calendar key={calendarKey}
                    calendarType="gregory" // Starts week on Sunday
                    showWeekNumbers={true}
                    next2Label={null} // Hide next double arrow
                    prev2Label={null}  // Hide prev arrow
                    selectRange={false}
                    value={value}
                    onChange={handleDateChange}
                    tileDisabled={tileDisabled}
                    showNeighboringMonth={false}
                    onViewChange={handleViewChange}
                    minDate={minDate}
                    maxDate={maxDate}
                />
                {
                    view && view == 'month' && (
                        <>
                            <div className="week-div-calendar">
                                <span>W</span>
                                <span>W</span>
                                <span>W</span>
                                <span>W</span>
                                <span>W</span>
                                <span>W</span>
                            </div>
                            <div className="week-div-empty"></div>
                        </>
                    )
                }
            </div>
        </>
    );
};

export default CalendarComponent;
