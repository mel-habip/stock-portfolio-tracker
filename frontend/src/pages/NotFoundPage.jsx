import React, { useState, useContext } from 'react';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import ThemeContext from '../contexts/ThemeContext';
import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

import NavMenu from '../components/NavMenu';

import centerpiece from '../crying.jpg';


function NotFoundPage() {
  const { isLoggedIn, firstName } = useContext(IsLoggedInContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      {isLoggedIn && <NavMenu first_name={firstName}></NavMenu>}
      {!isLoggedIn && <Button
        css={{ width: '4rem', minWidth: '1rem', background: isDark ? 'lightgray' : 'black', color: isDark ? 'black' : 'white', position: 'fixed', left: '0%', top: '0%', margin: '1rem' }}
        onPress={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></Button>}
      <h1>Oopsie-daisie!</h1>
      <h2>You stumbled here but there is nothing to see!</h2>
      <h6>(this is a 404 error)</h6>
      <img src={centerpiece} alt="welcome" width="500" style={{ 'border-radius': '15px', filter: `drop-shadow(0 -10px 4.5rem ${isDark ? 'blue' :'orange'})` }} />
      <br></br>
      <Link to='/' className='nav-links'>
        Let's go home...
      </Link>
    </>
  )
}

export default NotFoundPage;