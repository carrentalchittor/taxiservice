import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Users,
  Fuel,
  Gauge,
} from "lucide-react";
import "./home.css";
import API, { asset } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/cars")
      .then((res) => setCars(res.data))
      .catch((err) => console.error(err));
  }, []);

  const call = () => {
    window.location.href = `tel:${
      import.meta.env.VITE_CALL_NUMBER || "6367697913"
    }`;
  };

  const book = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      const payload = Object.fromEntries(formData);

      payload.car = selected._id;

      const { data } = await API.post("/bookings", payload);

      const whatsappNumber =
        import.meta.env.VITE_WHATSAPP_NUMBER ||
        "6378162396";

      const message = `
New Vehicle Booking

Name: ${user.name}
Phone: ${user.phone}
Vehicle: ${selected.name}
Pickup: ${payload.pickupDate}
Return: ${payload.returnDate}
Location: ${payload.pickupLocation}
Booking ID: ${data._id}

Please approve my booking.
      `;

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );

      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <main>
      <section className="hero">
        <div>
          <h1>
  Best Taxi, Car and Bike Rental Service in Chittorgarh
</h1>
         <span className="eyebrow">
  24×7 Bike, Car & Taxi Rental
</span>
          <p>
  Book affordable taxis, self-drive cars, cars with drivers
  and bikes on rent in Chittorgarh for local travel,
  sightseeing, tourism and outstation trips.
</p>
          <p>10, Nimbahera Rd, Railway Colony, Chittorgarh, Rajasthan 312001</p>

          <div className="actions">
            <a href="#cars">View Vehicles</a>

            <button type="button" onClick={call}>
              <Phone size={18} />
              Call 6378162396
            </button>
          </div>
          
        </div>

      
      </section>

      <section className="section" id="cars">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              Available Rides
            </span>

            <h2>Choose Bike or Taxi</h2>
          </div>
        </div>

        <div className="fleetFilters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "bike" ? "active" : ""} onClick={() => setFilter("bike")}>Bikes</button>
          <button className={filter === "taxi" ? "active" : ""} onClick={() => setFilter("taxi")}>Taxis</button>
        </div>

        <div className="grid">
          {cars.filter((car) => filter === "all" || car.vehicleType === filter).map((car) => (
            <article className="car" key={car._id}>
              <img
                src={asset(car.image)}
                alt={car.name}
              />

              <div className="carBody">
                <h3>{car.name}</h3>

                <p>{car.description}</p>

                <div className="specs">
                  <span>
                    <Users size={16} />
                    {car.seats} Seats
                  </span>

                  <span>
                    <Fuel size={16} />
                    {car.fuel}
                  </span>

                  <span>
                    <Gauge size={16} />
                    {car.transmission}
                  </span>
                </div>

                <div className="price">
                  ₹{car.pricePerDay}
                  <small>/day</small>
                </div>

                <div className="cardActions">
                  <button
                    type="button"
                    onClick={() => setSelected(car)}
                  >
                    <MessageCircle size={18} />
                    Book Now
                  </button>

                  <button
                    type="button"
                    className="light"
                    onClick={call}
                  >
                    <Phone size={18} />
                    Call
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && (
        <div className="modal">
          <form
            className="modalBox"
            onSubmit={book}
          >
            <button
              type="button"
              className="close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <h2>
              Book {selected.name}
            </h2>

            <label>
              Pickup Date
              <input
                type="date"
                name="pickupDate"
                required
              />
            </label>

            <label>
              Return Date
              <input
                type="date"
                name="returnDate"
                required
              />
            </label>

            <label>
              Pickup Location
              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter pickup address"
                required
              />
            </label>

            <label>
              Drop Location
              <input type="text" name="dropLocation" placeholder="Enter destination" required />
            </label>

            <label>
              Trip Type
              <select name="tripType" defaultValue="local">
                <option value="local">Local</option>
                <option value="one-way">One Way</option>
                <option value="round-trip">Round Trip</option>
                <option value="outstation">Outstation</option>
              </select>
            </label>

            <label>
              Note
              <textarea
                name="note"
                placeholder="Timing, vehicle requirement etc."
              />
            </label>

            <button
              type="submit"
              className="primary"
            >
              Continue on WhatsApp
            </button>
          </form>
        </div>
      )}

    </main>
  );
}