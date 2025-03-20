import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../supabaseClient";  // No uses "@/supabaseClient"


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingForm = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const selectedDate = watch("bookingDate");
  const [blockedDates, setBlockedDates] = useState([]);

  // Obtener fechas bloqueadas desde Supabase
  useEffect(() => {
    const fetchBlockedDates = async () => {
      const { data, error } = await supabase.from("unavailable_dates").select("blocked_date");
      if (error) {
        console.error("Error fetching blocked dates:", error);
      } else {
        setBlockedDates(data.map(d => new Date(d.blocked_date)));
      }
    };
    fetchBlockedDates();
  }, []);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    const formattedDate = data.bookingDate.toISOString().split("T")[0];

    // Verificar si la fecha está bloqueada
    if (blockedDates.some(date => date.toISOString().split("T")[0] === formattedDate)) {
      toast.error("This date is unavailable. Please select another date.");
      return;
    }

    // Enviar reserva a Supabase
    const { error } = await supabase.from("reservations").insert([
      {
        booking_date: formattedDate,
        voucher_number: data.voucherNumber,
        full_name: data.fullName,
        guests: data.guests,
        kids: data.kids,
        special_requests: data.specialRequests,
        phone_number: data.phoneNumber
      }
    ]);

    if (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Error submitting reservation. Try again.");
    } else {
      toast.success("Reservation submitted successfully!");
    }
  };

  return (
    <div className="container">
      <h2>At Suhail Suhoor Reservation</h2>
      <p>Please fill in all the required details to complete your Suhoor reservation.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Booking Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setValue("bookingDate", date)}
            dateFormat="yyyy-MM-dd"
            className="input"
            excludeDates={blockedDates} // Bloquear fechas ocupadas
          />
          {errors.bookingDate && <span className="error">Date is required</span>}
        </div>

        <div className="form-group">
          <label>Voucher Number</label>
          <input type="text" {...register("voucherNumber", { required: true })} className="input" />
          {errors.voucherNumber && <span className="error">Voucher Number is required</span>}
        </div>

        <label>Full Name</label>
        <input type="text" {...register("fullName", { required: true })} className="input" />
        {errors.fullName && <span className="error">Full Name is required</span>}

        <label>Number of Guests</label>
        <input type="number" {...register("guests", { required: true, min: 1 })} className="input" />
        {errors.guests && <span className="error">At least one guest is required</span>}

        <label>Kids</label>
        <select {...register("kids")} className="input">
          <option value="6-12">Age 6 to 12</option>
          <option value="0-6">Age 0 to 6</option>
          <option value="none">No Kids</option>
        </select>

        <label>Any Food Allergies or Special Requests?</label>
        <textarea {...register("specialRequests")} className="input"></textarea>

        <label>Contact Phone Number</label>
        <input type="tel" {...register("phoneNumber", { required: true })} className="input" />
        {errors.phoneNumber && <span className="error">Phone number is required</span>}

        <button type="submit">Submit Reservation</button>
      </form>
    </div>
  );
};

export default BookingForm;
