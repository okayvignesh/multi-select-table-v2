import './App.scss';
import { useState } from 'react';
import Header from './components/Header';
import MainBody from './components/MainBody';
import SecondaryHeader from './components/SecondaryHeader';

function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [dateOptions, setDateOptions] = useState([]);

  return (
    <div>
      <Header dateOptions={dateOptions} setDateOptions={setDateOptions} />
      <SecondaryHeader activeTab={activeTab} setActiveTab={setActiveTab} dateOptions={dateOptions} />
      <MainBody activeTab={activeTab} />
    </div>
  );
}

export default App;
