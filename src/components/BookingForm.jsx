import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from './BookingForm.module.css'

export default function BookingForm({ selectedDate, refreshData }) {
  const [name, setName] = useState('')
  const [peopleCount, setPeopleCount] = useState(1)
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('people_count')
      .eq('date', selectedDate)

    const totalPeople = bookings?.reduce((acc, b) => acc + b.people_count, 0) || 0

    if (totalPeople + parseInt(peopleCount) > 288) {
      alert('This date is fully booked! Please choose another date.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('bookings').insert([
      {
        customer_name: name,
        date: selectedDate,
        people_count: parseInt(peopleCount),
        phone,
        allergies
      },
    ])

    if (insertError) {
      alert('Error saving booking')
    } else {
      alert('Booking confirmed!')
      setName('')
      setPhone('')
      setAllergies('')
      setPeopleCount(1)
      refreshData()
    }

    setLoading(false)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
    </form>
  )
}
