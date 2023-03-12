import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CustomButton } from '../fields/CustomButton';
import { Link } from 'react-router-dom';
import ThemeContext from '../contexts/ThemeContext';
import IsLoggedInContext from '../contexts/IsLoggedInContext';
import { Row } from '@nextui-org/react';

// import './NavMenu.css';

function NavMenu() {

    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { setIsLoggedIn, firstName } = useContext(IsLoggedInContext);

    const [NavMenuOpen, setNavMenuOpen] = useState(false);

    // useEffect(() => {
    //     setNavMenuClicked(true);
    // }, []);

    const openNavMenu = () => setNavMenuOpen(true);
    const toggleNavMenu = () => setNavMenuOpen(!NavMenuOpen);
    const closeNavMenu = () => setNavMenuOpen(false);

    document.addEventListener("mousedown", (event) => {
        if (!NavMenuOpen) return;
        const concernedElement = document.querySelector(".nav-menu");
        if (!concernedElement?.contains(event.target)) {
            closeNavMenu();
        }
    });

    const Toggle = (props) => <div className='nav-menu-toggle'><CustomButton onClick={toggleNavMenu}><i className={NavMenuOpen ? 'fas fa-times' : 'fas fa-bars'} /></CustomButton> </div>

    return (
        <>
            <Toggle></Toggle>
            <nav className={NavMenuOpen ? 'nav-menu active' : 'nav-menu'}>

                <Row
                    justify='space-evenly'
                    align="center"
                    gap={1}
                >

                    <div style={{ width: '40px' }}></div>

                    <CustomButton onClick={toggleTheme}><i className={isDark ? "fa-regular fa-moon" : "fa-regular fa-sun"}></i></CustomButton>

                    <CustomButton
                        tooltip="log out"
                        onClick={() => localStorage.removeItem('access_token') || setIsLoggedIn(false)}><i className="fa-solid fa-person-through-window"></i></CustomButton>

                </Row>

                <Link to='/' className='nav-menu-logo' onClick={closeNavMenu}>
                    {firstName ? `${firstName}'s` : 'Your'} Portfolio Tracker&nbsp;
                    <i className="fa-solid fa-user-secret"></i>
                </Link>


                <ul className="nav-list">
                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={closeNavMenu}>
                            Home
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/positions'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Positions&nbsp; <i className="fa-solid fa-money-bill-trend-up" style={{ color: 'green' }}></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/workspaces'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Workspaces&nbsp; <i className="fa-regular fa-building" ></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/alerts'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Alerts&nbsp; <i className="fa-regular fa-bell"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/todos'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            To-Do's&nbsp; <i className="fa-solid fa-list-check"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/calculator'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Financial Calculator&nbsp; <i className="fa-solid fa-square-root-variable"></i>
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            to='/settings'
                            className='nav-links'
                            onClick={closeNavMenu}
                        >
                            Settings&nbsp; <i className="fa-solid fa-wrench"></i>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default NavMenu;