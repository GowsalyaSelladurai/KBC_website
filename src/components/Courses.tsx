
"use client";

import { useState } from "react";

const courses = [
  {
    name: "Professional Makeup",
    category: "Makeup",
    days: 30,
    description: "Learn professional makeup techniques, bridal looks and advanced artistry.",
    image: "/images/course-makeup.jpg",
  },
  {
    name: "Hair Styling",
    category: "Hair",
    days: 15,
    description: "Explore modern hairstyles, hair treatments and professional styling.",
    image: "/images/course-hair.jpg",
  },
  {
    name: "Beauty Therapy",
    category: "Beauty",
    days: 45,
    description: "Learn skincare, facials and essential beauty therapy techniques.",
    image: "/images/course-beauty.jpg",
  },
  {
    name: "Bridal Makeup",
    category: "Makeup",
    days: 20,
    description: "Master elegant bridal makeup and traditional beauty looks.",
    image: "/images/course-bridal.jpg",
  },
  {
    name: "Nail Art",
    category: "Beauty",
    days: 10,
    description: "Discover nail design, creative art and professional nail care.",
    image: "/images/course-nail.jpg",
  },
  {
    name: "Advanced Hair Care",
    category: "Hair",
    days: 30,
    description: "Develop advanced hair care and salon treatment skills.",
    image: "/images/course-care.jpg",
  },
];

export default function Courses() {
  const [filter, setFilter] = useState("All");

  const filteredCourses =
    filter === "All"
      ? courses
      : courses.filter((course) => course.category === filter);

  return (
    <section className="courses section-padding" id="courses">
      <div className="section-heading">
        <span className="section-tag">LEARN WITH KBC</span>
        <h2>Our <span>Courses</span></h2>
        <p>
          Discover your passion and develop professional beauty skills.
        </p>
      </div>

      <div className="course-filters">
        {["All", "Makeup", "Hair", "Beauty"].map((item) => (
          <button
            key={item}
            className={filter === item ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="course-grid">
        {filteredCourses.map((course) => (
          <article className="course-card" key={course.name}>
            <div className="course-image">
              <img src={course.image} alt={course.name} />
              <span>{course.category}</span>
            </div>

            <div className="course-info">
              <h3>{course.name}</h3>
              <p>{course.description}</p>

              <div className="course-footer">
                <span>{course.days} Days</span>
                <a href="#contact">Enquire Now ↗</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
