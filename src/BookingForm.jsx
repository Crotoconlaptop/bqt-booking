import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingForm = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const selectedDate = watch("bookingDate");
  const [blockedDates, setBlockedDates] = useState([]);

  // Función para obtener las fechas bloqueadas desde Make
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await fetch("https://hook.eu2.make.com/7e3bhpfk2qkmgffcnyf48b2r5qv2cdmb");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.blockedDates || !Array.isArray(data.blockedDates)) {
          throw new Error("Invalid JSON format received");
        }

        // Convertir fechas a objetos Date en la zona horaria local sin alterar la fecha
        setBlockedDates(
          data.blockedDates.map(dateStr => {
            const parts = dateStr.split("-");
            return new Date(parts[0], parts[1] - 1, parts[2]); // Año, Mes (0-index), Día
          })
        );

      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };

    fetchBlockedDates();
  }, []);

  // Función para formatear la fecha como yyyy-MM-dd
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Enviar datos del formulario
  const onSubmit = async (data) => {
    try {
      // Asegurar que la fecha se envíe en formato "yyyy-MM-dd"
      data.bookingDate = formatDate(selectedDate);
  
      const response = await fetch("https://hook.eu2.make.com/4owwf263k87mgnng9yhoeqofbbozqeki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      // **Verificación de la respuesta antes de convertirla a JSON**
      const textResponse = await response.text();
      let result;
      
      try {
        result = JSON.parse(textResponse); // Intentar convertir a JSON
      } catch (jsonError) {
        console.error("Invalid JSON response:", textResponse);
        throw new Error("Invalid JSON response from server");
      }
  
      // **Manejo de fechas no disponibles**
      if (result.status === "unavailable") {
        setBlockedDates(result.blockedDates.map(dateStr => {
          const parts = dateStr.split("-");
          return new Date(parts[0], parts[1] - 1, parts[2]); // Año, Mes (0-index), Día
        }));
        toast.error("This date is unavailable. Please select another date.");
        return;
      }
  
      // **Confirmación de reserva**
      if (response.ok) {
        toast.success("Reservation submitted successfully!");
      } else {
        toast.error("Error submitting reservation.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error. Try again.");
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
            excludeDates={blockedDates} // Bloquear fechas obtenidas de Make
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
