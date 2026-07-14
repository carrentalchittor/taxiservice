import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./SeoServicePage.css";

const WEBSITE_URL = "https://www.taxiservicechittorgarh.com";
const PHONE_NUMBER = "+91XXXXXXXXXX";
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

function updateMetaTag(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function updateCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}

function addJsonLd(id, data) {
  const oldScript = document.getElementById(id);

  if (oldScript) {
    oldScript.remove();
  }

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);

  document.head.appendChild(script);
}

export default function SeoServicePage({ page }) {
  useEffect(() => {
    const canonicalUrl = `${WEBSITE_URL}/${page.slug}`;

    document.title = page.metaTitle;

    updateMetaTag("description", page.metaDescription);
    updateMetaTag("keywords", page.keywords.join(", "));
    updateMetaTag("robots", "index, follow");

    updateCanonical(canonicalUrl);

    addJsonLd("service-page-schema", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.heading,
      description: page.metaDescription,
      url: canonicalUrl,
      areaServed: {
        "@type": "City",
        name: "Chittorgarh",
      },
      provider: {
        "@type": "LocalBusiness",
        name: "Taxi Service Chittorgarh",
        url: WEBSITE_URL,
        telephone: PHONE_NUMBER,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Chittorgarh",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
        },
      },
    });

    addJsonLd("faq-page-schema", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return () => {
      document.getElementById("service-page-schema")?.remove();
      document.getElementById("faq-page-schema")?.remove();
    };
  }, [page]);

  const whatsappMessage = encodeURIComponent(
    `Hello, I want to book ${page.heading}. Please share availability and rental charges.`
  );

  return (
    <div className="seoPage">
      <section className="seoHero">
        <div className="seoHeroOverlay">
          <div className="seoContainer">
            <div className="seoBreadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/services">Services</Link>
              <span>/</span>
              <span>{page.shortTitle}</span>
            </div>

            <p className="seoHeroLabel">
              24×7 Rental and Travel Service
            </p>

            <h1>{page.heading}</h1>

            <p className="seoHeroDescription">
              {page.heroDescription}
            </p>

            <div className="seoHeroButtons">
              <Link to="/services" className="seoPrimaryButton">
                Check Available Vehicles
              </Link>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="seoWhatsappButton"
              >
                Book on WhatsApp
              </a>
            </div>

            <div className="seoQuickPoints">
              <span>✓ Affordable daily rental</span>
              <span>✓ Online advance booking</span>
              <span>✓ Tourist and local service</span>
              <span>✓ Driver available</span>
            </div>
          </div>
        </div>
      </section>

      <section className="seoSection">
        <div className="seoContainer seoGrid">
          <div className="seoMainContent">
            <h2>{page.sectionTitle}</h2>

            {page.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <div className="seoFeatureBox">
              <h2>Why choose our rental service?</h2>

              <div className="seoFeatureGrid">
                {page.features.map((feature, index) => (
                  <article className="seoFeatureCard" key={index}>
                    <span>{index + 1}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="seoDocuments">
              <h2>Documents and booking requirements</h2>

              <p>
                Vehicle rental is provided only after verification of
                valid customer documents. The required documents may
                depend on the selected vehicle and booking type.
              </p>

              <ul>
                <li>Valid driving licence for self-drive rental</li>
                <li>Aadhaar card or another government identity proof</li>
                <li>Valid mobile number and current address details</li>
                <li>Advance payment to confirm the online booking</li>
                <li>
                  Security deposit may apply depending on the vehicle
                </li>
              </ul>

              <p className="seoNotice">
                Original documents may be checked during vehicle
                handover. Final price, deposit and document requirements
                are confirmed before booking.
              </p>
            </div>

            <div className="seoFacilities">
              <h2>Helpful facilities for tourists and local customers</h2>

              <div className="seoFacilityGrid">
                <div>
                  <h3>Tourist guidance</h3>
                  <p>
                    Assistance for popular places, travel routes,
                    sightseeing plans and nearby destinations.
                  </p>
                </div>

                <div>
                  <h3>Driver on request</h3>
                  <p>
                    A professional driver can be arranged at additional
                    charges for local and outstation travel.
                  </p>
                </div>

                <div>
                  <h3>Flexible duration</h3>
                  <p>
                    Vehicles are available for daily rental, multiple
                    days, tours, local trips and outstation journeys.
                  </p>
                </div>

                <div>
                  <h3>Advance reservation</h3>
                  <p>
                    Customers can reserve their preferred car, bike or
                    taxi online before arrival in Chittorgarh.
                  </p>
                </div>
              </div>
            </div>

            <div className="seoFaqSection">
              <h2>Frequently asked questions</h2>

              <div className="seoFaqList">
                {page.faqs.map((faq, index) => (
                  <details key={index} className="seoFaqItem">
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <aside className="seoSidebar">
            <div className="seoBookingCard">
              <p className="seoSmallLabel">Quick booking</p>
              <h2>Book your vehicle</h2>

              <p>
                Contact us to check current vehicle availability,
                required documents, driver charges and final rental
                price.
              </p>

              <a
                href={`tel:${PHONE_NUMBER}`}
                className="seoCallButton"
              >
                Call Now
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="seoSideWhatsapp"
              >
                WhatsApp Booking
              </a>

              <Link to="/contact" className="seoContactLink">
                Send booking enquiry
              </Link>
            </div>

            <div className="seoServicesCard">
              <h3>Our popular services</h3>

              <Link to="/taxi-service-chittorgarh">
                Taxi Service
              </Link>

              <Link to="/car-rental-chittorgarh">
                Car Rental
              </Link>

              <Link to="/bike-rental-chittorgarh">
                Bike Rental
              </Link>

              <Link to="/tour-travels-chittorgarh">
                Tour and Travels
              </Link>

              <Link to="/luxury-car-rental-chittorgarh">
                Luxury Car Rental
              </Link>

              <Link to="/outstation-taxi-chittorgarh">
                Outstation Taxi
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="seoBottomCta">
        <div className="seoContainer seoBottomCtaContent">
          <div>
            <p>Need a car, taxi or bike in Chittorgarh?</p>
            <h2>Reserve your preferred vehicle in advance</h2>
          </div>

          <Link to="/contact" className="seoBottomButton">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}