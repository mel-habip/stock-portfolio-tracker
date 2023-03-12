import React, { useState, useContext, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getYear = (date) => new Date(date).getFullYear();
const getMonth = (date) => new Date(date).getMonth();
const getDay = (date) => new Date(date).getDay();
const isWeekday = (date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6;
};
const range = (start, end, increment=1) => { let t = [start]; while (true) { start=start+increment; t.push(start); if (start >= end) break; }; return t; };

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function CustomDatePicker(props) {
    const years = range((props.minYear || 2000), getYear(new Date()) + 1, 1);
    console.log('props', props);
    return (
        <DatePicker
            {...props}
            filterDate={props.weekDayOnly ? isWeekday : () => true}
            dateFormat="yyyy-MM-dd"
            showIcon
            renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
            }) => (
                <div
                    style={{
                        margin: 10,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        {"<"}
                    </button>
                    <select
                        value={getYear(date)}
                        onChange={({ target: { value } }) => changeYear(value)}
                    >
                        {years.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select
                        value={months[getMonth(date)]}
                        onChange={({ target: { value } }) =>
                            changeMonth(months.indexOf(value))
                        }
                    >
                        {months.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        {">"}
                    </button>
                </div>
            )}
        />
    );
};