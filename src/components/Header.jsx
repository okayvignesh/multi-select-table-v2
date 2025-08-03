import axios from 'axios';
import { extractData, getFilterLabel } from '../utils/Functions';
import { useEffect, useRef, useState } from 'react';
import HeaderDropdown from './HeaderDropdown';
import CalendarComponent from './Calendar';

// import ServiceCallsUtil from '../util/ServiceCallsUtil';

// import Constants from '../util/Constants';

function Header({ dateOptions, setDateOptions, appliedFilters, setAppliedFilters, countries, setCountries, waysToBuy, setWaysToBuy, fetchRowData }) {
  const [loading, setLoading] = useState(false);
  const [filter1, setFilter1] = useState([]);
  const [filter3, setFilter3] = useState([]);
  const [filter2, setFilter2] = useState(null);
  const dropdownRef = useRef(null);




  // API CALL FOR GEO DROPDOWN
  const fetchGeoDropdownData = () => {
    setLoading(true);


    let serviceCalls = [];
    serviceCalls = [{
      'serviceName': 'Reports_Geo_Dropdown',
      'method': 'GET'
    }];
    // ServiceCallsUtil.fireServiceCalls(serviceCalls, (responses) => {
    //                 //const result = responses[0].response;

    //                 //console.log("sk as response",responses);
    //                 extractData(responses[0].response, setCountries, setWaysToBuy, setDateOptions);
    //                 setLoading(false);
    // });
    axios.get('https://7kyd3.wiremockapi.cloud/geo')
      .then(response => extractData(response.data.result, setCountries, setWaysToBuy, setDateOptions))
      .catch(console.error)
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    fetchGeoDropdownData();
  }, []);


  useEffect(() => {
    if (countries.length === 0 || waysToBuy.length === 0) return;
    setFilter1(countries.map((i) => i.id));
    setFilter3(waysToBuy.map((i) => i.id));
    setFilter2(dateOptions.reduce((max, curr) =>
      new Date(curr.value) > new Date(max.value) ? curr : max
    ).label)
    // Constants.REPORT_PAGE_AS_OF_DATE = dateOptions.reduce((max, curr) =>
    //   new Date(curr.value) > new Date(max.value) ? curr : max
    // ).label;
    setAppliedFilters(prev => ({
      ...prev,
      filter1: countries.map((i) => i.id),
      filter2: dateOptions.reduce((max, curr) =>
        new Date(curr.value) > new Date(max.value) ? curr : max
      ).label,
      filter3: waysToBuy.map((i) => i.id),
    }));
  }, [countries, waysToBuy]);


  const handleAsofDateChange = (date) => {
    setFilter2(date.label);
  };

  const handleApply = () => {
    setAppliedFilters({ filter1, filter2, filter3 });
    fetchRowData();
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove('show');
    }
  };

  const handleReset = () => {
    setFilter1(countries.map((i) => i.id));
    setFilter3(waysToBuy.map((i) => i.id));
    setFilter2(dateOptions.reduce((max, curr) =>
      new Date(curr.value) > new Date(max.value) ? curr : max
    ).label);
    setAppliedFilters({
      filter1: countries.map((i) => i.id),
      filter2: dateOptions.reduce((max, curr) =>
        new Date(curr.value) > new Date(max.value) ? curr : max
      ).label,
      filter3: waysToBuy.map((i) => i.id),
    });
  }

  const enabledDates = dateOptions.map(({ value }) => {
    const [month, day, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  });

  const getMinMaxDates = (range) => {
    let startYear, endYear;

    if (Array.isArray(range)) {
      const [start, end] = range;
      startYear = start?.getFullYear?.();
      endYear = end?.getFullYear?.();
    } else {
      startYear = endYear = range?.getFullYear?.();
    }

    if (!startYear || !endYear) {
      return {
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2025, 11, 31),
      };
    }

    return {
      minDate: new Date(startYear - 1, 0, 1),
      maxDate: new Date(endYear, 11, 31),
    };
  };

  const { minDate, maxDate } = getMinMaxDates(filter2);

  return (
    <>
      {
        loading ? <div className="header loading-spinner">Loading...</div>
          :
          (
            <div className="header">
              <div className="dropdown">
                <div className="dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                  <div className="header-grp">
                    <p>As of: </p>
                    <span>{filter2}</span>
                  </div>
                  <div className="header-grp">
                    <p>Country: </p>
                    <span>{getFilterLabel(filter1, countries)}</span>
                  </div>
                  <div className="header-grp">
                    <p>Ways to Buy: </p>
                    <span>{getFilterLabel(filter3, waysToBuy)}</span>
                  </div>
                </div>
                <ul className="dropdown-menu header-dropdown-menu" ref={dropdownRef}>
                  <div className="d-flex flex-column justify-content-between dropdown-height">
                    <div className="header-dropdown-body">
                      <div className="col-5">
                        {/* <p className="column-text">As of Date</p> */}
                        {/* <div className="header-column">
                          {
                            loading ? <p>Loading...</p> :
                              dateOptions.sort((a, b) => new Date(b.value) - new Date(a.value)).map((date, index) => (
                                <li
                                  key={index}
                                  className={filter2 === date.label ? 'selected' : ''}
                                  onClick={() => handleAsofDateChange(date)}
                                >
                                  {date.label}
                                </li>
                              ))
                          }
                        </div> */}
                        <p className="column-text">As of Date</p>
                        <CalendarComponent
                          selectRange={true}
                          value={filter2}
                          setValue={setFilter2}
                          enabledDates={enabledDates}
                          minDate={minDate}
                          maxDate={maxDate}
                          dateOptions={dateOptions}
                        />
                      </div>
                      <div className="col-3">
                        <p className="column-text">Country</p>
                        <HeaderDropdown
                          loading={loading}
                          data={countries}
                          appliedFilters={appliedFilters}
                          setAppliedFilters={setAppliedFilters}
                          setFilter={setFilter1}
                          filterType="filter1"
                        />
                      </div>
                      <div className="col-3">
                        <p className="column-text">Ways to Buy</p>
                        <HeaderDropdown
                          loading={loading}
                          data={waysToBuy}
                          appliedFilters={appliedFilters}
                          setAppliedFilters={setAppliedFilters}
                          setFilter={setFilter3}
                          filterType="filter3"
                        />
                      </div>
                    </div>
                    <div className="header-dropdown-footer">
                      <button className="reset-button" onClick={() => handleReset()}>reset</button>
                      <button className="apply-button" onClick={() => handleApply()}>apply</button>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
          )
      }
    </>
  )
}

export default Header