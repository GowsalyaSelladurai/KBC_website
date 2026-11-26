
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="kbc-home">
      
      <About />
      <Courses />
      <Services />
      <Gallery />
      <Testimonials />

      <section className="contact section-padding" id="contact">
        <div className="section-heading">
          <span className="section-tag">GET IN TOUCH</span>
          <h2>
            Begin Your <span>Beauty Journey</span>
          </h2>
          <p>
            Connect with KBC Beauty Academy and discover
            the right course for your future.
          </p>
          <a href="https://wa.me/" className="btn-gold">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
