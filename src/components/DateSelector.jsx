import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './DateSelector.module.css';

const API_URL = 'http://62.146.229.231:3100';

export default function DateSelector({ onDateChange }) {
  const [disabledDates, setDisabledDates] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await fetch(`${API_URL}/bookings/full-dates`);
        const data = await res.json();
        setDisabledDates(data);
      } catch (error) {
        console.error('Error fetching full dates', error);
      }
    };

    fetchDates();
  }, []);

  const handleChange = (e) => {
    const selected = e.target.value;
    setDate(selected);
    onDateChange(selected);
  };

  const isDisabled = (dateStr) => disabledDates.includes(dateStr);

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label className={styles.label}>
        Select a date:
        <input
          type="date"
          value={date}
          onChange={handleChange}
          min={today}
          className={styles.dateInput}
        />
      </label>
      {isDisabled(date) && (
        <motion.p
          className={styles.error}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          This date is fully booked. Please pick another.
        </motion.p>
      )}
    </motion.div>
  );
}
