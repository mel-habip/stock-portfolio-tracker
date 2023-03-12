// import logo from './logo.gif';
// import './App.css';
import React, { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Portal from './pages/Portal.jsx';
import Positions from './pages/Positions.jsx';
import Alerts from './pages/Alerts.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ThemeContext from './contexts/ThemeContext';
import IsLoggedInContext from './contexts/IsLoggedInContext';
import { NextUIProvider } from '@nextui-org/react';

function App() {
  const browserDarkPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const localTheme = localStorage.getItem('theme');
  let isDarkInitial = false; //proves persistence, sets State based on localStorage
  if (localTheme === 'dark') {
    isDarkInitial = true;
  } else if (localTheme === 'light') {
    isDarkInitial = false;
  } else if (browserDarkPreference) {
    isDarkInitial = true;
  }
  const [isDark, setDark] = useState(isDarkInitial);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const toggleTheme = () => {
    setDark(!isDark);
  }

  useEffect(() => { //provides the persistence, makes doc attribute update when StateLoads
    console.log('isDarkState', isDark);
    document.documentElement.setAttribute("data-theme", isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const localAccessToken = localStorage.getItem('access_token');
  //pre_logged_in_module
  useEffect(() => {
    const localUserId = localStorage.getItem('user_id');
    if (!localUserId) return;
    if (localAccessToken) { setAccessToken(localAccessToken); setUserId(parseInt(localUserId)); setIsLoggedIn(true); }
  }, [localAccessToken]);

  return (
    <NextUIProvider theme={isDark ? 'dark' : 'light'}>
      <IsLoggedInContext.Provider value={{ isLoggedIn, setIsLoggedIn, userId, setUserId, firstName, setFirstName, accessToken, setAccessToken }}>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
          <div className="App" style={{ height: "100vh" }}>
            <Router >
              <Routes>
                <Route path='/' element={isLoggedIn ? <Portal /> : <LoginPage />} exact />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/positions' element={isLoggedIn ? <Positions /> : <LoginPage />} exact />
                <Route path='/alerts' element={isLoggedIn ? <Alerts /> : <LoginPage />} exact />
                <Route path='/*' element={<NotFoundPage />} />
              </Routes>
            </Router>
          </div>
        </ThemeContext.Provider >
      </IsLoggedInContext.Provider >
    </NextUIProvider>
  );
}

export default App;
