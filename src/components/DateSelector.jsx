import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import styles from './DateSelector.module.css';

export default function DateSelector({ onDateChange }) {
  const [disabledDates, setDisabledDates] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchDates = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('date, people_count');

      if (error) {
        console.error('Error fetching bookings', error);
        return;
      }

      const dateMap = {};

      data.forEach(({ date, people_count }) => {
        dateMap[date] = (dateMap[date] || 0) + people_count;
      });

      const fullDates = Object.entries(dateMap)
        .filter(([_, count]) => count >= 288)
        .map(([date]) => date);

      setDisabledDates(fullDates);
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
