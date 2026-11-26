
const services = [
  {
    number: "01",
    title: "Professional Makeup",
    description:
      "Professional makeup services for special occasions and celebrations.",
    image: "/images/service-makeup.jpg",
  },
  {
    number: "02",
    title: "Bridal Beauty",
    description:
      "Elegant bridal beauty services designed for your memorable moments.",
    image: "/images/service-bridal.jpg",
  },
  {
    number: "03",
    title: "Hair Styling",
    description:
      "Creative hairstyles and professional hair care services.",
    image: "/images/service-hair.jpg",
  },
];

export default function Services() {
  return (
    <section className="services section-padding" id="services">
      <div className="section-heading">
        <span className="section-tag">WHAT WE OFFER</span>
        <h2>Our <span>Services</span></h2>
        <p>
          Experience beauty, elegance and professional care.
        </p>
      </div>

      <div className="service-grid">
        {services.map((service) => (
          <article className="service-card" key={service.number}>
            <img src={service.image} alt={service.title} />

            <div className="service-content">
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="#contact">Discover More ↗</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
