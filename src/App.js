import './App.scss';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainBody from './components/MainBody';
import SecondaryHeader from './components/SecondaryHeader';
import { transformBagData } from "./utils/Functions";
import ErrorModal from './components/ErrorModal';

function App() {
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
  const [aos, setAos] = useState(true)
  const [fsi, setFsi] = useState(true)
  const [gbi, setGbi] = useState(true)
  const [dynamicHeaderMap, setDynamicHeaderMap] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({
    filter1: [],
    filter2: null,
    filter3: []
  });
  const [apiStatus, setApiStatus] = useState({});
  const modalRef = useRef(null);


  const fetchRowData = () => {
    setLoading(true)
    // GET REQUEST FOR CHECKING 
    axios.get('https://ryr9j.wiremockapi.cloud/rowdata', { timeout: 8000 })
      .then(response => processData(response.data.result))
      .catch(error => {
        let message = "Unknown error";

        if (error.code === 'ECONNABORTED' || error.response) {
          message = "Timeout occurred while fetching rowdata";
        } else if (error.response) {
          message = `Error while fetching rowdata API`;
        } else {
          message = "Failed to fetch rowdata";
        }

        setApiStatus(prev => ({
          ...prev,
          rowdata: message
        }));
        showModal();
      })
      .finally(() => setLoading(false));
  };

  const processData = (data) => {
    if (data && !data.length || !data) {
      setApiStatus(prev => ({
        ...prev,
        rowdata: "Empty response from rowdata API"
      }));
    } else {
      transformBagData({ data, setFilteredData, setTotalData, setTillDateOptions, setSummaryWTB, setDynamicHeaderMap })
    }
  }

  useEffect(() => {
    fetchRowData();
  }, [])

  const showModal = () => {
    if (modalRef.current) {
      modalRef.current.click();
    }
  };

  return (
    <div>
      <div class="position-sticky" style={{ top: '0', zIndex: '3', backgroundColor: 'white' }}>
        <Header dateOptions={dateOptions} setDateOptions={setDateOptions}
          appliedFilters={appliedFilters} setAppliedFilters={setAppliedFilters}
          countries={countries} setCountries={setCountries}
          waysToBuy={waysToBuy} setWaysToBuy={setWaysToBuy}
          fetchRowData={fetchRowData}
        />
        <SecondaryHeader activeTab={activeTab} setActiveTab={setActiveTab} tillDateOptions={tillDateOptions} tillDates={tillDates} setTillDates={setTillDates} />
      </div>
      <MainBody activeTab={activeTab} dateOptions={dateOptions} loading={loading} filteredData={filteredData} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} setAos={setAos} setFsi={setFsi} setGbi={setGbi} apiStatus={apiStatus}
        appliedFilters={appliedFilters} countries={countries} waysToBuy={waysToBuy} totalData={totalData} tillDates={tillDates} differenceToggle={differenceToggle} setDifferenceToggle={setDifferenceToggle} dynamicHeaderMap={dynamicHeaderMap} />
      <Footer filteredData={filteredData} differenceToggle={differenceToggle} activeTab={activeTab} totalData={totalData} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} tillDates={tillDates} dynamicHeaderMap={dynamicHeaderMap} 
      fetchRowData={fetchRowData} setApiStatus={setApiStatus} showModal={showModal} apiStatus={apiStatus}  />
      <ErrorModal modalRef={modalRef} apiStatus={apiStatus} />

    </div>
  );
}

export default App;
