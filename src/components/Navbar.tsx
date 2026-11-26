
"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    ["Home", "#home"],
    ["About", "#about"],
    ["Courses", "#courses"],
    ["Services", "#services"],
    ["Gallery", "#gallery"],
    ["Contact", "#contact"],
  ];

  return (
    <>
      <header className="navbar">
        <a href="#home" className="nav-logo kbc-header-logo">
          <span className="logo-orbit">
            <span className="logo-orbit-inner">
              <img
                src="/kavyas-logo.jpeg"
                alt="KBC Beauty Academy Logo"
                className="header-logo-image"
              />
            </span>
          </span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={menuOpen ? "nav-links active" : "nav-links"}>
          {links.map(([name, link]) => (
            <a
              key={name}
              href={link}
              onClick={() => setMenuOpen(false)}
            >
              {name}
            </a>
          ))}

          <a
            href="#courses"
            className="nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            Explore Courses
          </a>
        </nav>
      </header>

      <style jsx>{`
        .kbc-header-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          perspective: 700px;
        }

        .logo-orbit {
          position: relative;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent,
            #d8ad55,
            #fff0bd,
            #d8ad55,
            transparent
          );
          animation: logoOrbit 7s linear infinite;
          box-shadow:
            0 0 12px rgba(212, 175, 85, 0.35),
            0 0 28px rgba(236, 160, 190, 0.18);
        }

        .logo-orbit-inner {
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #101010;
          overflow: hidden;
          animation: logoFloat 3s ease-in-out infinite;
        }

        .header-logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          padding: 4px;
          filter: drop-shadow(0 0 7px rgba(220, 180, 95, 0.5));
          transition:
            transform 0.5s ease,
            filter 0.5s ease;
        }

        .kbc-header-logo:hover .header-logo-image {
          transform: scale(1.12) rotateY(12deg);
          filter: drop-shadow(0 0 14px rgba(255, 210, 120, 0.9));
        }

        @keyframes logoOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0) rotateY(0deg);
          }
          50% {
            transform: translateY(-3px) rotateY(5deg);
          }
        }

        @media (max-width: 768px) {
          .logo-orbit {
            width: 62px;
            height: 62px;
          }

          .logo-orbit-inner {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </>
  );
}
