import BookingForm from '../components/BookingForm'
import DateSelector from '../components/DateSelector'
import { useState } from 'react'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('')

  return (
    <div style={{
      backgroundColor: '#111827',
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#F9FAFB',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Ramadan Banquet Booking
      </h1>

      <DateSelector onDateChange={setSelectedDate} />

      <BookingForm selectedDate={selectedDate} />

    </div>
  )
}
