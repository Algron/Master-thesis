import React from 'react';
import logo from './Logo.png';
import './Navbar.css';

// Navbar component that takes onSearchChange and onSearchClick functions as props
const Navbar = ({ onSearchChange, onSearchClick }) => {
  return (
    <div className="navbar">
      <img src={logo} alt="Logo" />
      <div className="title-container">
        <h1>HISTORICAL NEWS</h1>
        <h3>A PLACE WHERE THE PAST COMES ALIVE</h3>
      </div>
      <div className="search-container">
        <input type="text" onChange={onSearchChange} />
        <button onClick={onSearchClick}>Search</button>
      </div>
    </div>
  );
};

export default Navbar;
