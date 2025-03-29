import BookingForm from '../components/BookingForm'
import DateSelector from '../components/DateSelector'
import { useState } from 'react'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('')

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        backgroundImage: 'url(/images/5.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* 👉 ESTE ES EL ÚNICO CONTENEDOR */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
          borderRadius: '18px',
          padding: '2rem',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#F9FAFB',
        }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#FACC15',
          }}
        >
          Ramadan Banquet Booking
        </h1>

        {/* Están todos unificados acá */}
        <DateSelector onDateChange={setSelectedDate} />
        <BookingForm selectedDate={selectedDate} />
      </div>
    </div>
  )
}
