import React, { useState } from 'react';

import NavMenu from '../components/NavMenu';

import logo from '../logo.gif';


function Portal(is_logged_in = true) {

  return (
    <>
      <NavMenu first_name="John"></NavMenu>
      <img src={logo} alt="welcome" width="300"/>
      <h1>Dashboard coming soon! </h1>
    </>
  )
}

export default Portal;