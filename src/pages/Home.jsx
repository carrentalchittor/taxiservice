import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Phone,
  MessageCircle,
  Users,
  Fuel,
  Gauge,
  MapPin,
  CalendarDays,
} from "lucide-react";

import "./home.css";

import API, { asset } from "../api";
import { useAuth } from "../context/AuthContext";

const VEHICLE_CACHE_KEY =
  "ridego_public_vehicles";

const VEHICLE_CACHE_TIME_KEY =
  "ridego_public_vehicles_time";

const CACHE_DURATION =
  5 * 60 * 1000; // 5 minutes

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function VehicleSkeleton() {
  return (
    <article className="car skeletonCard">
      <div className="skeleton skeletonImage" />

      <div className="carBody">
        <div className="skeleton skeletonTitle" />

        <div className="skeleton skeletonText" />
        <div className="skeleton skeletonText short" />

        <div className="skeleton skeletonSpecs" />

        <div className="skeleton skeletonPrice" />

        <div className="skeletonButtons">
          <div className="skeleton skeletonButton" />
          <div className="skeleton skeletonButton" />
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [cars, setCars] = useState([]);
  const [selected, setSelected] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controller =
      new AbortController();

    let cachedCars = [];

    try {
      const storedCars =
        sessionStorage.getItem(
          VEHICLE_CACHE_KEY
        );

      const storedTime = Number(
        sessionStorage.getItem(
          VEHICLE_CACHE_TIME_KEY
        ) || 0
      );

      if (storedCars) {
        const parsedCars =
          JSON.parse(storedCars);

        if (Array.isArray(parsedCars)) {
          cachedCars = parsedCars;
          setCars(parsedCars);
          setLoading(false);
        }
      }

      const cacheIsFresh =
        cachedCars.length > 0 &&
        Date.now() - storedTime <
          CACHE_DURATION;

      /*
       * Cache fresh hai to data turant dikhao.
       * Phir bhi background me latest data fetch hoga.
       */
      if (cacheIsFresh) {
        setLoading(false);
      }
    } catch (cacheError) {
      console.error(
        "Vehicle cache read error:",
        cacheError
      );

      sessionStorage.removeItem(
        VEHICLE_CACHE_KEY
      );

      sessionStorage.removeItem(
        VEHICLE_CACHE_TIME_KEY
      );
    }

    async function loadCars() {
      try {
        setError("");

        const response = await API.get(
          "/cars",
          {
            signal: controller.signal,
          }
        );

        const vehicleData =
          Array.isArray(response.data)
            ? response.data
            : [];

        setCars(vehicleData);

        sessionStorage.setItem(
          VEHICLE_CACHE_KEY,
          JSON.stringify(vehicleData)
        );

        sessionStorage.setItem(
          VEHICLE_CACHE_TIME_KEY,
          String(Date.now())
        );
      } catch (requestError) {
        if (
          requestError.code ===
            "ERR_CANCELED" ||
          requestError.name ===
            "CanceledError"
        ) {
          return;
        }

        console.error(
          "Vehicle loading error:",
          requestError
        );

        if (cachedCars.length === 0) {
          setError(
            requestError.response?.data
              ?.message ||
              "Vehicles load nahi ho paaye. Please refresh karein."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadCars();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredCars = useMemo(() => {
    if (filter === "all") {
      return cars;
    }

    if (filter === "taxi") {
      return cars.filter(
        (car) =>
          car.vehicleType === "car" ||
          car.vehicleType === "taxi"
      );
    }

    if (filter === "bike") {
      return cars.filter(
        (car) =>
          car.vehicleType === "bike" ||
          car.vehicleType === "scooty"
      );
    }

    return cars;
  }, [cars, filter]);

  const call = () => {
    const callNumber =
      import.meta.env.VITE_CALL_NUMBER ||
      "6378162396";

    window.location.href =
      `tel:${callNumber}`;
  };

  const openBooking = (car) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/",
          message:
            "Vehicle book karne ke liye login karein.",
        },
      });

      return;
    }

    setSelected(car);
  };

  const closeBooking = () => {
    setSelected(null);
  };

  const book = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!selected?._id) {
      alert("Please select a vehicle");
      return;
    }

    const form =
      event.currentTarget;

    const submitButton =
      form.querySelector(
        'button[type="submit"]'
      );

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          "Booking...";
      }

      const formData =
        new FormData(form);

      const payload =
        Object.fromEntries(
          formData.entries()
        );

      payload.car = selected._id;

      const { data } =
        await API.post(
          "/bookings",
          payload
        );

      const whatsappNumber =
        import.meta.env
          .VITE_WHATSAPP_NUMBER ||
        "916378162396";

      const message = [
        "New Vehicle Booking",
        "",
        `Name: ${user.name || ""}`,
        `Phone: ${user.phone || ""}`,
        `Vehicle: ${selected.name}`,
        `Pickup: ${payload.pickupDate}`,
        `Return: ${payload.returnDate}`,
        `Pickup Location: ${payload.pickupLocation}`,
        `Drop Location: ${payload.dropLocation}`,
        `Trip Type: ${payload.tripType}`,
        payload.note
          ? `Note: ${payload.note}`
          : "",
        `Booking ID: ${data._id}`,
        "",
        "Please approve my booking.",
      ]
        .filter(Boolean)
        .join("\n");

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}` +
        `?text=${encodeURIComponent(
          message
        )}`;

      setSelected(null);
      form.reset();

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (requestError) {
      console.error(
        "Booking error:",
        requestError
      );

      alert(
        requestError.response?.data
          ?.message ||
          "Booking failed. Please try again."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          "Continue on WhatsApp";
      }
    }
  };

  const today = getTodayDate();

  return (
    <main>
      <section className="hero">
        <div className="heroContent">
          <span className="eyebrow">
            24×7 Bike, Car & Taxi Rental
          </span>

          <h1>
            Best Taxi, Car and Bike Rental
            Service in Chittorgarh
          </h1>

          <p>
            Book affordable taxis,
            self-drive cars, cars with
            drivers and bikes on rent in
            Chittorgarh for local travel,
            sightseeing, tourism and
            outstation trips.
          </p>

          <p className="heroLocation">
            <MapPin size={18} />

            10, Nimbahera Rd, Railway
            Colony, Chittorgarh,
            Rajasthan 312001
          </p>

          <div className="actions">
            <a href="#cars">
              View Vehicles
            </a>

            <button
              type="button"
              onClick={call}
            >
              <Phone size={18} />
              Call 6378162396
            </button>
          </div>
        </div>
      </section>

      <section
        className="section"
        id="cars"
      >
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              Available Rides
            </span>

            <h2>
              Choose Bike or Taxi
            </h2>
          </div>
        </div>

        <div className="fleetFilters">
          <button
            type="button"
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              filter === "bike"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("bike")
            }
          >
            Bikes
          </button>

          <button
            type="button"
            className={
              filter === "taxi"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("taxi")
            }
          >
            Taxis
          </button>
        </div>

        {error && (
          <div className="homeError">
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        )}

        <div className="grid">
          {loading &&
            cars.length === 0 &&
            Array.from({
              length: 6,
            }).map((_, index) => (
              <VehicleSkeleton
                key={`vehicle-skeleton-${index}`}
              />
            ))}

          {!loading &&
            !error &&
            filteredCars.length === 0 && (
              <div className="emptyFleet">
                <h3>
                  No vehicles available
                </h3>

                <p>
                  Is category me abhi koi
                  vehicle available nahi hai.
                </p>
              </div>
            )}

          {filteredCars.map((car) => (
            <article
              className="car"
              key={car._id}
            >
              <div className="carImageWrap">
                <img
                  src={asset(
                    car.image,
                    700
                  )}
                  alt={`${car.name} on rent in Chittorgarh`}
                  loading="lazy"
                  decoding="async"
                  width="700"
                  height="450"
                  onError={(event) => {
                    event.currentTarget.src =
                      "/vehicle-placeholder.webp";
                  }}
                />

                <span className="vehicleBadge">
                  {car.vehicleType ===
                    "car" ||
                  car.vehicleType ===
                    "taxi"
                    ? "Taxi"
                    : car.vehicleType ===
                        "scooty"
                      ? "Scooty"
                      : "Bike"}
                </span>
              </div>

              <div className="carBody">
                <h3>{car.name}</h3>

                {car.description && (
                  <p>
                    {car.description}
                  </p>
                )}

                <div className="specs">
                  <span>
                    <Users size={16} />
                    {car.seats || 1} Seats
                  </span>

                  {car.fuel && (
                    <span>
                      <Fuel size={16} />
                      {car.fuel}
                    </span>
                  )}

                  {car.transmission && (
                    <span>
                      <Gauge size={16} />
                      {car.transmission}
                    </span>
                  )}
                </div>

                <div className="price">
                  ₹{car.pricePerDay}

                  <small>/day</small>
                </div>

                <div className="cardActions">
                  <button
                    type="button"
                    onClick={() =>
                      openBooking(car)
                    }
                  >
                    <MessageCircle
                      size={18}
                    />
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
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeBooking();
            }
          }}
        >
          <form
            className="modalBox"
            onSubmit={book}
          >
            <button
              type="button"
              className="close"
              onClick={closeBooking}
              aria-label="Close booking form"
            >
              ×
            </button>

            <span className="modalEyebrow">
              <CalendarDays size={18} />
              Vehicle Booking
            </span>

            <h2 id="booking-title">
              Book {selected.name}
            </h2>

            <label>
              Pickup Date

              <input
                type="date"
                name="pickupDate"
                min={today}
                required
              />
            </label>

            <label>
              Return Date

              <input
                type="date"
                name="returnDate"
                min={today}
                required
              />
            </label>

            <label>
              Pickup Location

              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter pickup address"
                maxLength={200}
                required
              />
            </label>

            <label>
              Drop Location

              <input
                type="text"
                name="dropLocation"
                placeholder="Enter destination"
                maxLength={200}
                required
              />
            </label>

            <label>
              Trip Type

              <select
                name="tripType"
                defaultValue="local"
              >
                <option value="local">
                  Local
                </option>

                <option value="one-way">
                  One Way
                </option>

                <option value="round-trip">
                  Round Trip
                </option>

                <option value="outstation">
                  Outstation
                </option>
              </select>
            </label>

            <label>
              Note

              <textarea
                name="note"
                placeholder="Timing, vehicle requirement etc."
                maxLength={500}
                rows={4}
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