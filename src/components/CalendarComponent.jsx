import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarComponent = ({ onDateChange, selectedDate }) => {
  const [date, setDate] = useState(selectedDate || null);

  const handleChange = (newDate) => {
    setDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div className="p-4 bg-[#141414] border border-[#262626] rounded-xl shadow-lg text-white">
      <h5 className="text-sm font-semibold mb-2 text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF8A00]"></span>
        Select a Date
      </h5>
      <DatePicker
        selected={date}
        onChange={handleChange}
        inline
        className="w-full text-white"
      />
    </div>
  );
};

export default CalendarComponent;
