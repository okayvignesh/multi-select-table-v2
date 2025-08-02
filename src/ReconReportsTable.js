import './ReconReportsTable.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainBody from './components/MainBody';
import SecondaryHeader from './components/SecondaryHeader';
import { transformBagData } from "./utils/Functions"
// import ServiceCallsUtil from './util/ServiceCallsUtil';
// import Constants from './util/Constants';

function ReconReportsTable() {
  const [activeTab, setActiveTab] = useState('summary');
  const [dateOptions, setDateOptions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [waysToBuy, setWaysToBuy] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState([]);
  const [summaryWTB, setSummaryWTB] = useState([]);
  const [tillDates, setTillDates] = useState([]);
  const [tillDateOptions, setTillDateOptions] = useState([]);
  const [differenceToggle, setDifferenceToggle] = useState(false);
  const [appliedItems, setAppliedItems] = useState([]);
  const [aos, setAos] = useState(true)
  const [fsi, setFsi] = useState(true)
  const [gbi, setGbi] = useState(true)
  const [dynamicHeaderMap, setDynamicHeaderMap] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({
    filter1: ["ALL"],
    filter2: "17/07/2025",
    filter3: ["ALL"]
  });


  const fetchRowData = () => {


    //console.log("sk filters", appliedFilters, activeTab,Constants.REPORT_PAGE_AS_OF_DATE, dateOptions );
    setLoading(true)
    let filter3 = [];
    if (appliedFilters.filter3.length == waysToBuy.length) {
      filter3 = ['ALL']
    } else filter3 = appliedFilters.filter3;
    // GET REQUEST FOR CHECKING 

    let serviceCalls = [];
    serviceCalls = [{
      'serviceName': activeTab !== "summary" ? 'Reports_Detail_Row_Level_Data' : 'Reports_Summary_Data',
      'method': 'POST',
      'serviceRequest': {
        'Country': appliedFilters.filter1,
        'Ways To Buy': filter3,
        'As Of': [appliedFilters.filter2]
      }
    }]
    // ServiceCallsUtil.fireServiceCalls(serviceCalls, (responses) => {
    //                 //const result = responses[0].response;
    //                 //transformBagData(responses[0].response);
    //                 transformBagData({ data: responses[0].response, setFilteredData, setTotalData, setTillDateOptions, setSummaryWTB, setDynamicHeaderMap })
    //                 //console.log("sk as response",responses[0].response);
    //                 //decrementLoading()
    //                 setLoading(false)
    // });

    axios.get('https://ryr9j.wiremockapi.cloud/rowdata')
      .then(response => transformBagData({ data: response.data.result, setFilteredData, setTotalData, setTillDateOptions, setSummaryWTB, setDynamicHeaderMap, appliedItems }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRowData();
  }, [activeTab])


  useEffect(() => {
    fetchRowData();
  }, [appliedFilters.filter2])

  return (
    <div>
      <div className="position-sticky" style={{ top: '0', zIndex: '3', backgroundColor: 'white' }}>
        <Header dateOptions={dateOptions} setDateOptions={setDateOptions}
          appliedFilters={appliedFilters} setAppliedFilters={setAppliedFilters}
          countries={countries} setCountries={setCountries}
          waysToBuy={waysToBuy} setWaysToBuy={setWaysToBuy}
          fetchRowData={fetchRowData}
        />
        <SecondaryHeader activeTab={activeTab} setActiveTab={setActiveTab} tillDateOptions={tillDateOptions} tillDates={tillDates} setTillDates={setTillDates} appliedItems={appliedItems} setAppliedItems={setAppliedItems} />
      </div>
      <MainBody activeTab={activeTab} dateOptions={dateOptions} loading={loading} filteredData={filteredData} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} setAos={setAos} setFsi={setFsi} setGbi={setGbi}
        appliedFilters={appliedFilters} countries={countries} waysToBuy={waysToBuy} totalData={totalData} tillDates={tillDates} differenceToggle={differenceToggle} setDifferenceToggle={setDifferenceToggle} dynamicHeaderMap={dynamicHeaderMap} />
      <Footer filteredData={filteredData} differenceToggle={differenceToggle} activeTab={activeTab} totalData={totalData} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} tillDates={tillDates} dynamicHeaderMap={dynamicHeaderMap} />
    </div>
  );
}

export default ReconReportsTable;
