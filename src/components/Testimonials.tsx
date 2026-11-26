
const testimonials = [
  {
    name: "Our Student",
    role: "Beauty Course Student",
    review:
      "The training experience was wonderful. I learned new beauty techniques and gained confidence in my skills.",
  },
  {
    name: "Our Student",
    role: "Professional Makeup Student",
    review:
      "A great learning environment with practical training and helpful guidance throughout the course.",
  },
  {
    name: "Our Student",
    role: "Hair Styling Student",
    review:
      "The academy helped me explore my creativity and understand professional beauty techniques.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials section-padding">
      <div className="section-heading">
        <span className="section-tag">STUDENT EXPERIENCES</span>
        <h2>Words Of <span>Appreciation</span></h2>
        <p>Discover the learning experience at KBC Beauty Academy.</p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item, index) => (
          <article className="testimonial-card" key={index}>
            <div className="testimonial-stars">★★★★★</div>

            <p className="testimonial-review">
              "{item.review}"
            </p>

            <div className="testimonial-person">
              <div className="testimonial-avatar">K</div>
              <div>
                <h3>{item.name}</h3>
                <span>{item.role}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
