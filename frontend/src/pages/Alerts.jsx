import React, { useState } from 'react';

import { DatePicker } from 'react-responsive-datepicker'
import 'react-responsive-datepicker/dist/index.css'

import NavMenu from '../components/NavMenu';

function Alerts() {

    const [isOpen, setIsOpen] = React.useState(false);
    const [date, setDate] = React.useState('');

    const frmt = (date) => {
        console.log(date);
        if (!date) {
            setIsOpen(false); //provides the clearing function
            return '';
        }
        let yyyy = date.getFullYear();
        let mm = date.getMonth() + 1;
        if (mm < 10) mm = `0` + mm;
        let dd = date.getDate();
        return `${yyyy}-${mm}-${dd}`
    }


    return (
        <>
            <NavMenu first_name="John"></NavMenu>
            <h1>ALERTS PAGE HERE</h1>
            <h2>
            <i className="fa-regular fa-bell"></i>
            <i className="fa-regular fa-bell"></i>
            <i className="fa-regular fa-bell"></i>
            </h2>
            <h3>coming soon ...&nbsp;<i className="fa-solid fa-hand-spock"></i> </h3>
        </>
    )
}

export default Alerts;
