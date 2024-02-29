import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './navbar.scss';
interface NavBarProps { }

const NavBar: React.FC<NavBarProps> = () => {
  return (
    <div className="c-navbar">
      <nav>
        <div className="logo">
          <img src={logo} />
        </div>
        <ul className="nav-links">
          <li><NavLink to="/vans">Vans</NavLink></li>
          <li><NavLink to="/alerts">Alerts</NavLink></li>
          <li><NavLink to="/routes">Routes</NavLink></li>
          <li><NavLink to="/ridership">Ridership</NavLink></li>
          <li><NavLink to="/accommodations">Accommodations</NavLink></li>
          <li><NavLink to="/login">Log In</NavLink></li>
        </ul>
      </nav>
      <div className='divider'></div>
    </div>
  );
};

export default NavBar;
