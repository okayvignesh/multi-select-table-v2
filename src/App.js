import './App.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainBody from './components/MainBody';
import SecondaryHeader from './components/SecondaryHeader';
import { transformBagData } from "./utils/Functions";

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
  const [appliedFilters, setAppliedFilters] = useState({
    filter1: [],
    filter2: null,
    filter3: []
  });


  const fetchRowData = () => {
    setLoading(true)
    // GET REQUEST FOR CHECKING 
    axios.get('https://ryr9j.wiremockapi.cloud/rowdata')
      .then(response => transformBagData({ data: response.data.result, setFilteredData, setTotalData, setTillDateOptions, setSummaryWTB }))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRowData();
  }, [])


  return (
    <div>
      <Header dateOptions={dateOptions} setDateOptions={setDateOptions}
        appliedFilters={appliedFilters} setAppliedFilters={setAppliedFilters}
        countries={countries} setCountries={setCountries}
        waysToBuy={waysToBuy} setWaysToBuy={setWaysToBuy}
        fetchRowData={fetchRowData}
      />
      <SecondaryHeader activeTab={activeTab} setActiveTab={setActiveTab} tillDateOptions={tillDateOptions} tillDates={tillDates} setTillDates={setTillDates} /> 
      <MainBody activeTab={activeTab} dateOptions={dateOptions} loading={loading} filteredData={filteredData} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} setAos={setAos} setFsi={setFsi} setGbi={setGbi}
        appliedFilters={appliedFilters} countries={countries} waysToBuy={waysToBuy} totalData={totalData} tillDates={tillDates} differenceToggle={differenceToggle} setDifferenceToggle={setDifferenceToggle} />
      <Footer filteredData={filteredData} differenceToggle={differenceToggle} activeTab={activeTab} totalData={totalData} summaryWTB={summaryWTB} aos={aos} fsi={fsi} gbi={gbi} tillDates={tillDates} />
    </div>
  );
}

export default App;
