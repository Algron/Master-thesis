import React from 'react';
import './Tabs.css';

// Tabs component that takes onSelectView function as a prop
const Tabs = ({ onSelectView }) => {
  return (
    <div className="tabs">
      <button onClick={() => onSelectView('daily')}>Daily View</button>
      <button onClick={() => onSelectView('monthly')}>Monthly View</button>
      <button onClick={() => onSelectView('yearly')}>Yearly View</button>
      <button onClick={() => onSelectView('map')}>Map View</button>
    </div>
  );
};

export default Tabs;
