
"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/course-makeup.jpg",
    title: "Professional Makeup",
    subtitle: "The Art of Makeup",
    number: "01",
  },
  {
    image: "/images/course-bridal.jpg",
    title: "Bridal Beauty",
    subtitle: "Elegance for Every Bride",
    number: "02",
  },
  {
    image: "/images/course-hair.jpg",
    title: "Hair Styling",
    subtitle: "Create Your Signature",
    number: "03",
  },
  {
    image: "/images/course-nail.jpg",
    title: "Luxury Nail Art",
    subtitle: "Details That Define Beauty",
    number: "04",
  },
  {
    image: "/images/course-care.jpg",
    title: "Skin Care",
    subtitle: "Beauty Begins with Care",
    number: "05",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  const previous = (active - 1 + slides.length) % slides.length;
  const next = (active + 1) % slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="kbc-luxury-hero" id="home">
        {/* Background design */}
        <div className="kbc-hero-bg-gradient" />
        <div className="kbc-hero-grid" />
        <div className="kbc-hero-glow kbc-glow-one" />
        <div className="kbc-hero-glow kbc-glow-two" />
        <div className="kbc-hero-glow kbc-glow-three" />

        {/* Floating decorative elements */}
        <div className="kbc-floating-orb orb-one" />
        <div className="kbc-floating-orb orb-two" />
        <div className="kbc-floating-orb orb-three" />

        <div className="kbc-hero-inner">
          {/* LEFT CONTENT */}
          <div className="kbc-hero-content">
            {/* Logo */}
            <div className="kbc-logo-stage">
              <div className="kbc-logo-orbit">
                <div className="kbc-logo-orbit-inner" />
              </div>

              <div className="kbc-logo-frame">
                <img
                  src="/kavyas-logo.jpeg"
                  alt="KBC Beauty Academy Logo"
                />
              </div>

              <span className="kbc-logo-star star-one">✦</span>
              <span className="kbc-logo-star star-two">✧</span>
            </div>

            {/* Welcome label */}
            <div className="kbc-welcome">
              <span className="kbc-welcome-line" />
              <span>WELCOME TO KBC BEAUTY ACADEMY</span>
              <span className="kbc-welcome-line" />
            </div>

            {/* Main heading */}
            <h1 className="kbc-main-heading">
              The Art Of
              <br />
              <span className="kbc-heading-gold">
                Beauty & Elegance
              </span>
            </h1>

            <p className="kbc-hero-description">
              Discover the world of professional beauty.
              Learn, create and transform your passion
              into extraordinary skills with KBC Beauty Academy.
            </p>

            {/* Highlights */}
            <div className="kbc-hero-highlights">
              <div className="kbc-highlight-item">
                <span>✦</span>
                Professional Training
              </div>

              <div className="kbc-highlight-item">
                <span>✦</span>
                Expert Guidance
              </div>
            </div>

            {/* Buttons */}
            <div className="kbc-hero-buttons">
              <a href="/booking" className="kbc-book-button">
                BOOK NOW
                <span>↗</span>
              </a>

              <a href="#about" className="kbc-discover-button">
                DISCOVER MORE
                <span>→</span>
              </a>
            </div>

            {/* Bottom label */}
            <div className="kbc-bottom-label">
              <span>01</span>
              <div />
              <span>THE BEAUTY EXPERIENCE</span>
            </div>
          </div>

          {/* RIGHT IMAGE SLIDER */}
          <div className="kbc-visual-area">
            <div className="kbc-visual-top">
              <span>THE ART OF TRANSFORMATION</span>
              <span>✧ 2026 COLLECTION</span>
            </div>

            <div className="kbc-3d-scene">
              {/* 3D decorative rings */}
              <div className="kbc-ring ring-a" />
              <div className="kbc-ring ring-b" />
              <div className="kbc-ring ring-c" />

              {/* Floating stars */}
              <div className="kbc-floating-star star-a">✦</div>
              <div className="kbc-floating-star star-b">✧</div>
              <div className="kbc-floating-star star-c">✦</div>
              <div className="kbc-floating-star star-d">✧</div>

              {/* Previous card */}
              <button
                className="kbc-image-card kbc-left-card"
                onClick={() => setActive(previous)}
                aria-label="Previous beauty category"
              >
                <img
                  src={slides[previous].image}
                  alt={slides[previous].title}
                />
              </button>

              {/* Main card */}
              <div className="kbc-image-card kbc-center-card" key={active}>
                <img
                  src={slides[active].image}
                  alt={slides[active].title}
                />

                <div className="kbc-image-overlay" />

                <div className="kbc-image-caption">
                  <span>
                    {slides[active].number} / 05
                  </span>

                  <h3>{slides[active].title}</h3>

                  <div className="kbc-caption-line" />

                  <p>{slides[active].subtitle}</p>
                </div>
              </div>

              {/* Next card */}
              <button
                className="kbc-image-card kbc-right-card"
                onClick={() => setActive(next)}
                aria-label="Next beauty category"
              >
                <img
                  src={slides[next].image}
                  alt={slides[next].title}
                />
              </button>

              {/* Floating badge */}
              <div className="kbc-floating-badge">
                <span>✧</span>
                <small>BEAUTY</small>
                <strong>REDEFINED</strong>
              </div>
            </div>

            {/* Slider controls */}
            <div className="kbc-slider-bottom">
              <button
                className="kbc-arrow"
                onClick={() => setActive(previous)}
                aria-label="Previous slide"
              >
                ←
              </button>

              <div className="kbc-slider-progress">
                {slides.map((slide, index) => (
                  <button
                    key={slide.image}
                    onClick={() => setActive(index)}
                    className={
                      active === index
                        ? "kbc-progress-active"
                        : ""
                    }
                    aria-label={`Show ${slide.title}`}
                  />
                ))}
              </div>

              <button
                className="kbc-arrow"
                onClick={() => setActive(next)}
                aria-label="Next slide"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="kbc-hero-footer">
          <span>EXPERIENCE THE ART OF BEAUTY</span>
          <span className="kbc-footer-star">✦</span>
          <span>CREATE YOUR OWN SIGNATURE</span>
        </div>
      </section>

      <style jsx>{`
        .kbc-luxury-hero {
          --ivory: #FAF5ED;
          --champagne: #EFE8A8;
          --gold: #C9A45C;
          --charcoal: #121414;
          --white: #FFFFFF;
          --beige: #E8D8C5;

          position: relative;
          min-height: 780px;
          padding: 65px 5.5% 30px;
          overflow: hidden;
          isolation: isolate;
          background:
            radial-gradient(
              ellipse at 80% 30%,
              rgba(239, 232, 168, 0.42),
              transparent 38%
            ),
            radial-gradient(
              ellipse at 10% 85%,
              rgba(232, 216, 197, 0.8),
              transparent 38%
            ),
            linear-gradient(
              120deg,
              var(--ivory),
              var(--white),
              var(--beige)
            );
          color: var(--charcoal);
        }

        .kbc-hero-bg-gradient {
          position: absolute;
          inset: 0;
          z-index: -4;
          background:
            linear-gradient(
              135deg,
              transparent 40%,
              rgba(201, 164, 92, 0.09),
              transparent 75%
            );
          animation: backgroundShift 12s ease-in-out infinite alternate;
        }

        .kbc-hero-grid {
          position: absolute;
          inset: 0;
          z-index: -3;
          opacity: 0.23;
          background-image:
            linear-gradient(
              rgba(201, 164, 92, 0.13) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(201, 164, 92, 0.13) 1px,
              transparent 1px
            );
          background-size: 55px 55px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 25%,
            black 75%,
            transparent
          );
        }

        .kbc-hero-glow {
          position: absolute;
          z-index: -2;
          border-radius: 50%;
          filter: blur(65px);
          pointer-events: none;
          animation: glowFloat 9s ease-in-out infinite alternate;
        }

        .kbc-glow-one {
          width: 300px;
          height: 300px;
          top: 5%;
          right: 12%;
          background: rgba(239, 232, 168, 0.5);
        }

        .kbc-glow-two {
          width: 250px;
          height: 250px;
          bottom: 0;
          left: 15%;
          background: rgba(201, 164, 92, 0.2);
          animation-delay: 2s;
        }

        .kbc-glow-three {
          width: 200px;
          height: 200px;
          top: 45%;
          right: 42%;
          background: rgba(232, 216, 197, 0.5);
          animation-delay: 4s;
        }

        .kbc-floating-orb {
          position: absolute;
          z-index: -1;
          border-radius: 50%;
          border: 1px solid rgba(201, 164, 92, 0.45);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.8),
            rgba(239, 232, 168, 0.2)
          );
          box-shadow:
            inset 0 0 20px rgba(255, 255, 255, 0.8),
            0 15px 45px rgba(201, 164, 92, 0.12);
          animation: orbFloat 8s ease-in-out infinite;
        }

        .orb-one {
          width: 65px;
          height: 65px;
          top: 17%;
          left: 5%;
        }

        .orb-two {
          width: 32px;
          height: 32px;
          top: 72%;
          right: 5%;
          animation-delay: 2s;
        }

        .orb-three {
          width: 20px;
          height: 20px;
          top: 10%;
          right: 45%;
          animation-delay: 4s;
        }

        .kbc-hero-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          align-items: center;
          gap: 45px;
          max-width: 1450px;
          min-height: 650px;
          margin: 0 auto;
        }

        .kbc-hero-content {
          position: relative;
          z-index: 5;
          animation: contentReveal 1s ease both;
        }

        /* LOGO */

        .kbc-logo-stage {
          position: relative;
          width: 116px;
          height: 116px;
          display: grid;
          place-items: center;
          margin-bottom: 28px;
        }

        .kbc-logo-frame {
          position: relative;
          z-index: 2;
          width: 86px;
          height: 86px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 2px solid var(--gold);
          border-radius: 50%;
          background: var(--white);
          box-shadow:
            0 0 0 7px rgba(201, 164, 92, 0.1),
            0 12px 35px rgba(18, 20, 20, 0.12);
        }

        .kbc-logo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .kbc-logo-orbit {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(201, 164, 92, 0.75);
          border-radius: 50%;
          animation: logoRotate 12s linear infinite;
        }

        .kbc-logo-orbit::before,
        .kbc-logo-orbit::after {
          content: "";
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 15px rgba(201, 164, 92, 0.8);
        }

        .kbc-logo-orbit::before {
          top: 8px;
          left: 17px;
        }

        .kbc-logo-orbit::after {
          right: 12px;
          bottom: 20px;
        }

        .kbc-logo-orbit-inner {
          position: absolute;
          inset: 10px;
          border: 1px dashed rgba(201, 164, 92, 0.5);
          border-radius: 50%;
        }

        .kbc-logo-star {
          position: absolute;
          z-index: 3;
          color: var(--gold);
          text-shadow: 0 0 12px rgba(201, 164, 92, 0.7);
        }

        .star-one {
          top: 0;
          right: 8px;
          font-size: 17px;
          animation: starTwinkle 2s infinite;
        }

        .star-two {
          bottom: 2px;
          left: 7px;
          font-size: 20px;
          animation: starTwinkle 2.5s infinite;
        }

        /* TEXT */

        .kbc-welcome {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 19px;
          color: #92713C;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .kbc-welcome-line {
          width: 25px;
          height: 1px;
          background: var(--gold);
        }

        .kbc-main-heading {
          margin: 0;
          color: var(--charcoal);
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(44px, 5.1vw, 76px);
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -2.8px;
        }

        .kbc-heading-gold {
          display: inline-block;
          padding-bottom: 8px;
          background: linear-gradient(
            100deg,
            #9A783E 0%,
            #C9A45C 30%,
            #EFE8A8 52%,
            #B18B4A 75%,
            #C9A45C 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 6s linear infinite;
        }

        .kbc-hero-description {
          max-width: 460px;
          margin: 22px 0;
          color: #68645C;
          font-size: 15px;
          line-height: 1.9;
        }

        .kbc-hero-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          margin: 26px 0 32px;
        }

        .kbc-highlight-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--charcoal);
          font-size: 12px;
          font-weight: 700;
        }

        .kbc-highlight-item span {
          color: var(--gold);
          font-size: 17px;
          text-shadow: 0 0 10px rgba(201, 164, 92, 0.4);
        }

        /* BUTTONS */

        .kbc-hero-buttons {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 17px;
        }

        .kbc-book-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          min-width: 165px;
          padding: 17px 23px;
          overflow: hidden;
          border: 1px solid var(--gold);
          border-radius: 5px;
          background: var(--charcoal);
          color: var(--ivory);
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          box-shadow: 0 10px 28px rgba(18, 20, 20, 0.17);
          transition: all 0.35s ease;
        }

        .kbc-book-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 70%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(239, 232, 168, 0.35),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }

        .kbc-book-button:hover::before {
          left: 130%;
        }

        .kbc-book-button:hover {
          transform: translateY(-5px);
          background: #252A28;
          box-shadow: 0 17px 35px rgba(201, 164, 92, 0.3);
        }

        .kbc-book-button span {
          color: var(--champagne);
          font-size: 18px;
        }

        .kbc-discover-button {
          display: inline-flex;
          align-items: center;
          gap: 13px;
          padding: 15px 5px;
          color: var(--charcoal);
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          transition: all 0.3s ease;
        }

        .kbc-discover-button span {
          color: #A98548;
          font-size: 19px;
          transition: transform 0.3s ease;
        }

        .kbc-discover-button:hover span {
          transform: translateX(6px);
        }

        .kbc-bottom-label {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 48px;
          color: #777066;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .kbc-bottom-label span:first-child {
          color: #A98548;
          font-size: 13px;
        }

        .kbc-bottom-label div {
          width: 48px;
          height: 1px;
          background: var(--gold);
        }

        /* IMAGE SLIDER */

        .kbc-visual-area {
          position: relative;
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          animation: visualReveal 1.2s ease both;
        }

        .kbc-visual-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
          color: #92713C;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .kbc-3d-scene {
          position: relative;
          width: 100%;
          height: 485px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1100px;
        }

        /* Decorative rings */

        .kbc-ring {
          position: absolute;
          border: 1px solid rgba(201, 164, 92, 0.43);
          border-radius: 50%;
          pointer-events: none;
        }

        .ring-a {
          width: 390px;
          height: 390px;
          transform: rotateX(68deg) rotateZ(-20deg);
          animation: ringRotate 18s linear infinite;
        }

        .ring-b {
          width: 460px;
          height: 460px;
          border-style: dashed;
          opacity: 0.55;
          transform: rotateX(68deg) rotateZ(25deg);
          animation: ringRotate 28s linear infinite reverse;
        }

        .ring-c {
          width: 340px;
          height: 340px;
          border-color: rgba(239, 232, 168, 0.9);
          transform: rotateY(65deg) rotateZ(30deg);
          animation: ringRotate 22s linear infinite;
        }

        /* Floating stars */

        .kbc-floating-star {
          position: absolute;
          z-index: 6;
          color: #B18B4A;
          text-shadow: 0 0 15px rgba(201, 164, 92, 0.6);
          animation: starFloat 4s ease-in-out infinite;
        }

        .star-a {
          top: 11%;
          left: 17%;
          font-size: 27px;
        }

        .star-b {
          top: 22%;
          right: 12%;
          font-size: 31px;
          animation-delay: 1s;
        }

        .star-c {
          bottom: 14%;
          left: 20%;
          font-size: 22px;
          animation-delay: 2s;
        }

        .star-d {
          right: 18%;
          bottom: 12%;
          font-size: 17px;
          animation-delay: 1.5s;
        }

        /* Image cards */

        .kbc-image-card {
          position: absolute;
          display: block;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(201, 164, 92, 0.7);
          border-radius: 14px;
          background: var(--white);
          box-shadow:
            0 25px 60px rgba(18, 20, 20, 0.18),
            0 0 0 7px rgba(255, 255, 255, 0.4);
          transition:
            transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.4s ease;
        }

        .kbc-image-card img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .kbc-left-card,
        .kbc-right-card {
          z-index: 1;
          width: 215px;
          height: 305px;
          cursor: pointer;
          opacity: 0.85;
          filter: saturate(0.8);
        }

        .kbc-left-card {
          left: 0;
          transform: translateY(18px) rotateY(24deg) scale(0.86);
        }

        .kbc-right-card {
          right: 0;
          transform: translateY(18px) rotateY(-24deg) scale(0.86);
        }

        .kbc-left-card:hover {
          z-index: 4;
          opacity: 1;
          transform: translateY(0) rotateY(12deg) scale(0.94);
          box-shadow: 0 25px 55px rgba(201, 164, 92, 0.3);
        }

        .kbc-right-card:hover {
          z-index: 4;
          opacity: 1;
          transform: translateY(0) rotateY(-12deg) scale(0.94);
          box-shadow: 0 25px 55px rgba(201, 164, 92, 0.3);
        }

        .kbc-center-card {
          z-index: 3;
          width: 285px;
          height: 405px;
          transform: translateZ(55px);
          animation: centerCardReveal 0.7s ease both;
        }

        .kbc-center-card:hover {
          transform: translateY(-8px) translateZ(70px) rotateY(-3deg);
          box-shadow:
            0 35px 75px rgba(18, 20, 20, 0.23),
            0 0 30px rgba(201, 164, 92, 0.2);
        }

        .kbc-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 38%,
            rgba(18, 20, 20, 0.1) 55%,
            rgba(18, 20, 20, 0.88) 100%
          );
        }

        .kbc-image-caption {
          position: absolute;
          right: 23px;
          bottom: 25px;
          left: 23px;
          color: var(--white);
          text-align: left;
        }

        .kbc-image-caption > span {
          color: var(--champagne);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .kbc-image-caption h3 {
          margin: 10px 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 500;
          line-height: 1.15;
        }

        .kbc-caption-line {
          width: 45px;
          height: 2px;
          margin: 13px 0;
          background: var(--gold);
        }

        .kbc-image-caption p {
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        /* Floating badge */

        .kbc-floating-badge {
          position: absolute;
          z-index: 7;
          right: -1%;
          bottom: 8%;
          width: 105px;
          height: 105px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(201, 164, 92, 0.8);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(15px);
          box-shadow:
            0 15px 40px rgba(18, 20, 20, 0.12),
            inset 0 0 20px rgba(239, 232, 168, 0.4);
          animation: badgeFloat 4s ease-in-out infinite;
        }

        .kbc-floating-badge span {
          color: #A98548;
          font-size: 19px;
        }

        .kbc-floating-badge small {
          margin-top: 3px;
          color: #8A6B37;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .kbc-floating-badge strong {
          margin-top: 3px;
          color: var(--charcoal);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
          letter-spacing: 1px;
        }

        /* Slider controls */

        .kbc-slider-bottom {
          position: relative;
          z-index: 8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          margin-top: 5px;
        }

        .kbc-arrow {
          width: 39px;
          height: 39px;
          border: 1px solid rgba(201, 164, 92, 0.7);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          color: var(--charcoal);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .kbc-arrow:hover {
          transform: translateY(-3px);
          border-color: var(--gold);
          background: var(--charcoal);
          color: var(--champagne);
          box-shadow: 0 8px 20px rgba(201, 164, 92, 0.25);
        }

        .kbc-slider-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kbc-slider-progress button {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: rgba(18, 20, 20, 0.2);
          cursor: pointer;
          transition: all 0.35s ease;
        }

        .kbc-slider-progress button.kbc-progress-active {
          width: 30px;
          background: var(--gold);
          box-shadow: 0 0 12px rgba(201, 164, 92, 0.45);
        }

        /* Footer */

        .kbc-hero-footer {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-top: 28px;
          padding-top: 19px;
          border-top: 1px solid rgba(201, 164, 92, 0.3);
          color: #83765E;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-align: center;
        }

        .kbc-footer-star {
          color: var(--gold);
          font-size: 16px;
        }

        /* ANIMATIONS */

        @keyframes contentReveal {
          from {
            opacity: 0;
            transform: translateX(-35px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes visualReveal {
          from {
            opacity: 0;
            transform: translateX(35px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes centerCardReveal {
          from {
            opacity: 0;
            transform: translateY(25px) translateZ(0) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateZ(55px) scale(1);
          }
        }

        @keyframes goldShimmer {
          to {
            background-position: 200% center;
          }
        }

        @keyframes logoRotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ringRotate {
          to {
            transform: rotateX(68deg) rotateZ(340deg);
          }
        }

        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes starFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(15deg);
          }
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-22px) rotate(15deg);
          }
        }

        @keyframes badgeFloat {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateY(-13px) rotate(5deg);
          }
        }

        @keyframes glowFloat {
          from {
            transform: translate(0, 0) scale(1);
          }
          to {
            transform: translate(30px, -20px) scale(1.15);
          }
        }

        @keyframes backgroundShift {
          from {
            transform: translateX(-2%);
          }
          to {
            transform: translateX(2%);
          }
        }

        /* TABLET */

        @media (max-width: 1050px) {
          .kbc-luxury-hero {
            padding-right: 4%;
            padding-left: 4%;
          }

          .kbc-hero-inner {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .kbc-main-heading {
            font-size: clamp(42px, 5.3vw, 60px);
          }

          .kbc-3d-scene {
            height: 430px;
          }

          .kbc-center-card {
            width: 245px;
            height: 360px;
          }

          .kbc-left-card,
          .kbc-right-card {
            width: 175px;
            height: 275px;
          }

          .ring-a {
            width: 340px;
            height: 340px;
          }

          .ring-b {
            width: 390px;
            height: 390px;
          }
        }

        /* MOBILE */

        @media (max-width: 760px) {
          .kbc-luxury-hero {
            min-height: auto;
            padding: 45px 6% 25px;
          }

          .kbc-hero-inner {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .kbc-hero-content {
            text-align: center;
          }

          .kbc-logo-stage {
            margin: 0 auto 25px;
          }

          .kbc-welcome {
            justify-content: center;
            font-size: 8px;
            letter-spacing: 1.7px;
          }

          .kbc-main-heading {
            font-size: clamp(42px, 10vw, 60px);
            letter-spacing: -1.7px;
          }

          .kbc-hero-description {
            max-width: 500px;
            margin: 18px auto;
            font-size: 14px;
          }

          .kbc-hero-highlights {
            justify-content: center;
            gap: 18px;
          }

          .kbc-hero-buttons {
            justify-content: center;
          }

          .kbc-bottom-label {
            justify-content: center;
            margin-top: 30px;
          }

          .kbc-visual-area {
            max-width: 540px;
          }

          .kbc-visual-top {
            font-size: 8px;
            letter-spacing: 1.3px;
          }

          .kbc-3d-scene {
            height: 430px;
          }

          .kbc-center-card {
            width: 245px;
            height: 355px;
          }

          .kbc-left-card,
          .kbc-right-card {
            width: 165px;
            height: 265px;
          }

          .kbc-floating-badge {
            right: 0;
            bottom: 7%;
            width: 88px;
            height: 88px;
          }

          .kbc-hero-footer {
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
            font-size: 8px;
            letter-spacing: 1.4px;
          }
        }

        @media (max-width: 430px) {
          .kbc-luxury-hero {
            padding-right: 5%;
            padding-left: 5%;
          }

          .kbc-welcome {
            gap: 7px;
            font-size: 7px;
            letter-spacing: 1px;
          }

          .kbc-welcome-line {
            width: 15px;
          }

          .kbc-main-heading {
            font-size: 41px;
          }

          .kbc-hero-highlights {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .kbc-hero-buttons {
            flex-direction: column;
            gap: 7px;
          }

          .kbc-book-button {
            width: 190px;
          }

          .kbc-3d-scene {
            height: 350px;
          }

          .kbc-center-card {
            width: 205px;
            height: 300px;
          }

          .kbc-left-card,
          .kbc-right-card {
            width: 125px;
            height: 220px;
          }

          .kbc-left-card {
            left: -5px;
          }

          .kbc-right-card {
            right: -5px;
          }

          .kbc-image-caption {
            right: 15px;
            bottom: 18px;
            left: 15px;
          }

          .kbc-image-caption h3 {
            font-size: 21px;
          }

          .kbc-floating-badge {
            right: -4px;
            width: 75px;
            height: 75px;
          }

          .kbc-floating-badge strong {
            font-size: 9px;
          }

          .ring-a {
            width: 270px;
            height: 270px;
          }

          .ring-b {
            width: 310px;
            height: 310px;
          }

          .ring-c {
            width: 250px;
            height: 250px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .kbc-luxury-hero *,
          .kbc-luxury-hero *::before,
          .kbc-luxury-hero *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }

/* =========================================
   KBC PREMIUM HERO – EXTRA 3D EFFECTS
========================================= */

/* Soft animated champagne light */
.kbc-luxury-hero::before {
  content: "";
  position: absolute;
  inset: -30%;
  z-index: -1;
  pointer-events: none;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    rgba(239, 232, 168, 0.2) 70deg,
    transparent 130deg,
    rgba(201, 164, 92, 0.13) 220deg,
    transparent 300deg
  );
  filter: blur(65px);
  animation: kbcLuxuryLight 22s linear infinite;
}

/* Extra depth for the image scene */
.kbc-3d-scene {
  transform-style: preserve-3d;
}

.kbc-center-card {
  transform-style: preserve-3d;
  border: 1px solid rgba(201, 164, 92, 0.95);
  box-shadow:
    0 30px 65px rgba(18, 20, 20, 0.2),
    0 0 0 8px rgba(255, 255, 255, 0.48),
    0 0 45px rgba(201, 164, 92, 0.18);
}

.kbc-center-card img {
  animation: kbcImageZoom 8s ease-in-out infinite alternate;
  transition: filter 0.6s ease;
}

.kbc-center-card:hover img {
  filter: saturate(1.15) contrast(1.04);
}

/* Animated glass shine */
.kbc-center-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 20%,
    rgba(255, 255, 255, 0.22) 45%,
    transparent 65%
  );
  transform: translateX(-130%);
  animation: kbcCardShine 6s ease-in-out infinite;
}

.kbc-image-overlay {
  z-index: 1;
}

.kbc-image-caption {
  z-index: 3;
}

/* Side card depth */
.kbc-left-card,
.kbc-right-card {
  box-shadow:
    0 25px 55px rgba(18, 20, 20, 0.2),
    0 0 25px rgba(201, 164, 92, 0.13);
}

.kbc-left-card img,
.kbc-right-card img {
  transition: transform 0.8s ease;
}

.kbc-left-card:hover img,
.kbc-right-card:hover img {
  transform: scale(1.09);
}

/* Premium button shine */
.kbc-book-button {
  background: linear-gradient(
    120deg,
    #121414,
    #292923,
    #121414
  );
  background-size: 200% 200%;
  animation: kbcButtonGlow 5s ease infinite;
}

/* More dimensional rings */
.ring-a {
  box-shadow: 0 0 25px rgba(201, 164, 92, 0.08);
}

.ring-b {
  filter: drop-shadow(0 0 8px rgba(201, 164, 92, 0.18));
}

.ring-c {
  box-shadow: inset 0 0 30px rgba(239, 232, 168, 0.12);
}

/* Logo glass lighting */
.kbc-logo-frame {
  transition:
    transform 0.5s ease,
    box-shadow 0.5s ease;
}

.kbc-logo-frame:hover {
  transform: scale(1.07) rotateY(12deg);
  box-shadow:
    0 0 0 8px rgba(201, 164, 92, 0.13),
    0 18px 40px rgba(201, 164, 92, 0.3);
}

/* Animations */
@keyframes kbcLuxuryLight {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(360deg) scale(1.08);
  }
}

@keyframes kbcImageZoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.055);
  }
}

@keyframes kbcCardShine {
  0%, 45% {
    transform: translateX(-130%);
  }
  75%, 100% {
    transform: translateX(130%);
  }
}

@keyframes kbcButtonGlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Small-screen adjustment */
@media (max-width: 760px) {
  .kbc-center-card::after {
    animation-duration: 8s;
  }

  .kbc-luxury-hero::before {
    opacity: 0.65;
  }
}

      `}</style>
    </>
  );
}
