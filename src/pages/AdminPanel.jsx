import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminPanel.module.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_URL = 'https://ramadanbooking.duckdns.org';

export default function AdminPanel() {
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [phone, setPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [showBookings, setShowBookings] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/bookings`;
      if (searchQuery.trim()) {
        url = `${API_URL}/bookings/search?q=${encodeURIComponent(searchQuery)}`;
      } else if (selectedDate) {
        url = `${API_URL}/bookings?date=${selectedDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setBookings(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error('Error fetching bookings', error);
      setBookings([]);
      setFilteredBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, searchQuery]);

  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!name || count <= 0 || !selectedDate) return;

    const sameDatePeople = bookings
      .filter((b) => b.date === selectedDate)
      .reduce((sum, b) => sum + b.people_count, 0);

    if (sameDatePeople + parseInt(count) > 288) {
      alert('Capacity exceeded for this date');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          date: selectedDate,
          people_count: parseInt(count),
          phone,
          allergies,
        }),
      });

      if (!res.ok) throw new Error('Failed to add booking');

      setName('');
      setCount(1);
      setPhone('');
      setAllergies('');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert('Error adding booking');
    }
  };

  const exportToExcel = () => {
    if (filteredBookings.length === 0) return alert('No bookings to export!');

    const data = filteredBookings.map((b) => ({
      Date: b.date,
      Name: b.customer_name,
      Guests: b.people_count,
      Phone: b.phone || '',
      Allergies: b.allergies || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Reservations');

    const filename = searchQuery
      ? `search-results-${searchQuery}.xlsx`
      : `reservations-${selectedDate}.xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const exportRangeToExcel = async () => {
    if (!exportStart || !exportEnd) return alert('Select both start and end dates');

    try {
      const res = await fetch(`${API_URL}/bookings/range?start=${exportStart}&end=${exportEnd}`);
      const data = await res.json();

      if (!data.length) return alert('No bookings found in range');

      const formatted = data.map((b) => ({
        Date: b.date,
        Name: b.customer_name,
        Guests: b.people_count,
        Phone: b.phone || '',
        Allergies: b.allergies || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Range Reservations');

      const fileName = `reservations-${exportStart}_to_${exportEnd}.xlsx`;
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, fileName);
    } catch (error) {
      console.error(error);
      alert('Export failed');
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Hostess Panel</h1>

      <label className={styles.label}>
        Select Date:
        <input
          type="date"
          min="2025-01-01"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.input}
        />
      </label>

      <input
        type="text"
        placeholder="Search by name or phone (global)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.input}
      />

      <motion.button
        onClick={() => setShowBookings(!showBookings)}
        className={styles.accordionToggle}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
      >
        {showBookings ? 'Hide' : 'Show'} Results ({filteredBookings.length})
      </motion.button>

      <AnimatePresence>
        {showBookings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            {loading ? (
              <p>Loading...</p>
            ) : filteredBookings.length === 0 ? (
              <p>No bookings found</p>
            ) : (
              <ul className={styles.list}>
                {filteredBookings.map((b) => (
                  <li key={b.id}>
                    {b.customer_name} – {b.people_count} guests – {b.phone} – {b.allergies} – {b.date}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={exportToExcel}
        className={styles.exportButton}
        whileHover={{ scale: 1.01 }}
      >
        Export to Excel
      </motion.button>

      <div className={styles.exportRange}>
        <input
          type="date"
          value={exportStart}
          onChange={(e) => setExportStart(e.target.value)}
          className={styles.input}
        />
        <input
          type="date"
          value={exportEnd}
          onChange={(e) => setExportEnd(e.target.value)}
          className={styles.input}
        />
        <motion.button
          onClick={exportRangeToExcel}
          className={styles.exportButton}
          whileHover={{ scale: 1.01 }}
        >
          Export Range to Excel
        </motion.button>
      </div>

      <form onSubmit={handleAddBooking} className={styles.form}>
        <h3>Add Manual Booking</h3>

        <input
          type="text"
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="number"
          min="1"
          max="288"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Allergies (e.g. gluten)"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          className={styles.input}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          className={styles.input}
        />
        <motion.button
          type="submit"
          className={styles.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Add Booking
        </motion.button>
      </form>
    </motion.div>
  );
}
