import { useState } from 'react'
import styles from './BookingForm.module.css'
import { motion } from 'framer-motion'

const API_URL = 'https://ramadanbooking.duckdns.org';

export default function BookingForm({ selectedDate, refreshData }) {
  const [name, setName] = useState('')
  const [peopleCount, setPeopleCount] = useState(1)
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/bookings/summary?date=${selectedDate}`)
      const summary = await res.json()
      const totalPeople = summary.total || 0

      if (totalPeople + parseInt(peopleCount) > 288) {
        alert('This date is fully booked! Please choose another date.')
        setLoading(false)
        return
      }

      const insertRes = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          date: selectedDate,
          people_count: parseInt(peopleCount),
          phone,
          allergies
        })
      })

      if (!insertRes.ok) {
        throw new Error('Failed to save booking')
      }

      alert('Booking confirmed!')
      setName('')
      setPhone('')
      setAllergies('')
      setPeopleCount(1)
      refreshData()
    } catch (error) {
      console.error(error)
      alert('Error saving booking')
    }

    setLoading(false)
  }

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className={styles.heading}>Book Your Spot</h2>

      <label className={styles.label}>
        Name:
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        People:
        <input
          type="number"
          min="1"
          max="288"
          required
          value={peopleCount}
          onChange={(e) => setPeopleCount(e.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        Phone:
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        Allergies:
        <input
          type="text"
          placeholder="e.g. gluten, lactose"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          className={styles.input}
        />
      </label>

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? 'Booking...' : 'Book Now'}
      </button>
    </motion.form>
  )
}
