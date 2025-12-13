import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', 'Poppins', serif",
        background: "linear-gradient(180deg, #F6F2E9 0%, #EDE4D6 100%)",
        color: "#3E3423",
        overflowX: "hidden",
      }}
    >
      {/* 🌿 Transparent Navbar */}
      <nav
        className={`navbar navbar-expand-lg py-3 fixed-top ${
          scrolled ? "scrolled" : "transparent"
        }`}
        style={{
          transition: "all 0.4s ease",
          backdropFilter: scrolled ? "blur(10px)" : "none",
        }}
      >
        <div className="container">
          <a
            className="navbar-brand fw-bold"
            href="/"
            style={{
              color: scrolled ? "#4A3B2A" : "#FFF",
              fontSize: "1.9rem",
              letterSpacing: "1px",
              textShadow: scrolled ? "none" : "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            Smart<span style={{ color: "#CBB189" }}>Expense+</span>
          </a>
          <div className="d-flex gap-3">
            {/* Navbar Login Button */}
            <a
              href="/login"
              className="btn px-3 fw-semibold"
              style={{
                border: "2px solid #fdfdfdff",
                color: scrolled ? "#4A3B2A" : "#FFF",
                borderRadius: "30px",
                background: scrolled
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.3)";
                e.target.style.color = "#3E3423";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = scrolled
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)";
                e.target.style.color = scrolled ? "#4A3B2A" : "#ffffffe8";
              }}
            >
              Login
            </a>

            {/* Navbar Sign Up Button */}
            <a
              href="/login"
              className="btn px-3 fw-semibold"
              style={{
                border: "2px solid #fafafaff",
                color: scrolled ? "#4A3B2A" : "#FFF",
                borderRadius: "30px",
                background: scrolled
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.3)";
                e.target.style.color = "#3E3423";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = scrolled
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)";
                e.target.style.color = scrolled ? "#4A3B2A" : "#f9f9f9ff";
              }}
            >
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* ☕ Hero Section */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center position-relative"
        style={{
          height: "100vh",
          backgroundImage:
            "url('/images/close-up-coins-saved-energy-crisis-expenses.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#FFF",
          textShadow: "0 3px 8px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.65) 100%)",
            position: "absolute",
            inset: 0,
          }}
        ></div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            animation: "fadeIn 1.2s ease-out",
          }}
        >
          <h1
            style={{
              fontSize: "3.6rem",
              fontWeight: "700",
              letterSpacing: "1.2px",
              marginBottom: "20px",
              color: "#FFFBEF",
            }}
          >
            Bring Balance to Your Finances
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              width: "70%",
              maxWidth: "650px",
              margin: "auto",
              lineHeight: "1.6",
              color: "#FDF7E9",
            }}
          >
            Track. Save. Grow. Experience calm money management with SmartExpense — 
            where mindfulness meets modern finance.
          </p>
          <div className="mt-4">
            {/* Hero Sign Up Button */}
            <a
              href="/register"
              className="btn px-4 py-2 mx-2"
              style={{
                background: "linear-gradient(135deg, #c7c7c7ff, #e9e8e7ff)",
                color: "#4A3B2A",
                borderRadius: "35px",
                fontWeight: "600",
                boxShadow: "0 6px 15px rgba(200,175,130,0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #dfdfdfff, #dbdad8ff)";
                e.target.style.boxShadow =
                  "0 8px 18px rgba(180,150,100,0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #ffffffff, #dadadaff)";
                e.target.style.boxShadow =
                  "0 6px 15px rgba(200,175,130,0.3)";
              }}
            >
              Get Started
            </a>

            {/* Hero Login Button */}
            <a
              href="/login"
              className="btn px-4 py-2 mx-2"
              style={{
                border: "2px solid #E4D4B2",
                color: "#FDF7E9",
                borderRadius: "35px",
                background: "rgba(255,255,255,0.1)",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.25)";
                e.target.style.color = "#3E3423";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
                e.target.style.color = "#FDF7E9";
              }}
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* 🌿 About Section */}
      <section className="container py-5 text-center" style={{ animation: "fadeUp 1.2s ease-in" }}>
        <h2 className="fw-bold mb-3" style={{ color: "#4A3B2A", fontSize: "2.2rem" }}>
          Why Choose SmartExpense+?
        </h2>
        <p className="text-muted mx-auto" style={{ maxWidth: "650px", color: "#7B6C54", fontSize: "1rem" }}>
          Elegant simplicity meets financial clarity — built for those who love calm design and mindful management.
        </p>

        <div className="row mt-5 justify-content-center">
          {[
            {
              title: "Smart Tracking",
              desc: "Automatically log and categorize your expenses effortlessly.",
              
            },
            {
              title: "Mindful Budgeting",
              desc: "Set intuitive budgets that guide you — not restrict you.",
              
            },
            {
              title:"Visualize",
              desc: "Visualize your spending with elegant, insightful charts.",
              
            },
          ].map((f, i) => (
            <div key={i} className="col-md-3 text-center p-4 hover-zoom">
              
              <h5 className="fw-semibold">{f.title}</h5>
              <p style={{ color: "#7C6B55" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌸 Footer */}
      <footer
        className="text-center py-4"
        style={{
          background: "#EFE9DD",
          color: "#6E5C43",
          fontSize: "0.9rem",
          letterSpacing: "0.3px",
        }}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} SmartExpense+ | Designed with calm precision 
        </p>
      </footer>

      {/* ✨ Animations & Navbar Styles */}
      <style>
        {`
        .navbar.transparent {
          background: transparent;
          box-shadow: none;
        }
        .navbar.scrolled {
          background: rgba(255,255,255,0.8);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(20px);}
          to {opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeUp {
          from {opacity: 0; transform: translateY(40px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .hover-zoom:hover img {
          transform: scale(1.1);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}
      </style>
    </div>
  );
};

export default Index;
