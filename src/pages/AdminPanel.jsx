import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from './AdminPanel.module.css'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function AdminPanel() {
  const [selectedDate, setSelectedDate] = useState('')
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [name, setName] = useState('')
  const [count, setCount] = useState(1)
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [exportStart, setExportStart] = useState('')
  const [exportEnd, setExportEnd] = useState('')
  const [showBookings, setShowBookings] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchBookings = async () => {
    setLoading(true)
    let query = supabase.from('bookings').select('*').order('date', { ascending: true })

    if (searchQuery.trim()) {
      query = query.or(
        `customer_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
      )
    }
     else if (selectedDate) {
      query = query.eq('date', selectedDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bookings', error)
      setBookings([])
      setFilteredBookings([])
    } else {
      setBookings(data)
      setFilteredBookings(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [selectedDate, searchQuery])

  const handleAddBooking = async (e) => {
    e.preventDefault()
    if (!name || count <= 0 || !selectedDate) return

    const sameDatePeople = bookings
      .filter((b) => b.date === selectedDate)
      .reduce((sum, b) => sum + b.people_count, 0)

    if (sameDatePeople + parseInt(count) > 288) {
      alert('Capacity exceeded for this date')
      return
    }

    const { error } = await supabase.from('bookings').insert([
      {
        customer_name: name,
        date: selectedDate,
        people_count: parseInt(count),
        phone,
        allergies,
      },
    ])

    if (error) {
      alert('Error adding booking')
    } else {
      setName('')
      setCount(1)
      setPhone('')
      setAllergies('')
      fetchBookings()
    }
  }

  const exportToExcel = () => {
    if (filteredBookings.length === 0) return alert('No bookings to export!')

    const data = filteredBookings.map((b) => ({
      Date: b.date,
      Name: b.customer_name,
      Guests: b.people_count,
      Phone: b.phone || '',
      Allergies: b.allergies || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Reservations')

    const filename = searchQuery
      ? `search-results-${searchQuery}.xlsx`
      : `reservations-${selectedDate}.xlsx`

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, filename)
  }

  const exportRangeToExcel = async () => {
    if (!exportStart || !exportEnd) return alert('Select both start and end dates')

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('date', exportStart)
      .lte('date', exportEnd)

    if (error || data.length === 0) {
      alert('No bookings found in range')
      return
    }

    const formatted = data.map(b => ({
      Date: b.date,
      Name: b.customer_name,
      Guests: b.people_count,
      Phone: b.phone || '',
      Allergies: b.allergies || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(formatted)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Range Reservations')

    const fileName = `reservations-${exportStart}_to_${exportEnd}.xlsx`
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, fileName)
  }

  return (
    <div className={styles.container}>
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

      <button onClick={() => setShowBookings(!showBookings)} className={styles.accordionToggle}>
        {showBookings ? 'Hide' : 'Show'} Results ({filteredBookings.length})
      </button>

      {showBookings && (
        <div>
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
        </div>
      )}

      <button onClick={exportToExcel} className={styles.exportButton}>
        Export to Excel
      </button>

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
        <button onClick={exportRangeToExcel} className={styles.exportButton}>
          Export Range to Excel
        </button>
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
          max="20"
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
        <button type="submit" className={styles.button}>
          Add Booking
        </button>
      </form>
    </div>
  )
}
