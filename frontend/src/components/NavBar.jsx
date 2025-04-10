import React, { useState } from "react";
import logo from "../assets/logo1.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./authcontext"; // ✅ Import AuthContext

const BACKEND_URL = "http://localhost:8000"; // Update for production

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Access current user

  const toggleSearch = () => setIsOpen(!isOpen);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/Product/description/`,
        { product_description: query },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;
      if (Array.isArray(data.product_ids)) {
        navigate("/list", { state: { productIds: data.product_ids } });
      } else {
        console.error("Invalid response format", data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleLoginClick = () => {
    if (user) {
      navigate("/profile"); // Redirect to profile if logged in
    } else {
      navigate("/login", { state: { from: window.location.pathname } }); // Redirect to login
    }
  };

  const getInitial = (email) => {
    return email ? email[0].toUpperCase() : "U";
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      {/* Logo */}
      <div className="navbar-start">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
          <h1 className="ml-2 text-xl md:text-2xl font-bold text-white font-signature">
            Tobirama
          </h1>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="navbar-end">
        <div className="relative flex items-center space-x-2">
          {/* Search Toggle Button */}
          <button onClick={toggleSearch} className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.form
                onSubmit={handleSearch}
                className="flex items-center bg-white rounded-full shadow px-3 py-1"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "250px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Search by description..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow px-2 py-1 outline-none text-black bg-transparent"
                />
                <button type="submit" className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black font-semibold shadow-none hover:shadow-lg transition-shadow duration-300">
                  Go
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Image Upload/Camera Icon */}
          <button className="btn btn-primary btn-ghost btn-circle" onClick={() => navigate("/ImageSearch")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 7h2l1.5-2h11L19 7h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

          {/* Notifications */}
          <button className="btn btn-primary btn-ghost btn-circle">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>

          {/* 🟢 Auth Button */}
          <button
            onClick={handleLoginClick}
            className="ml-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all"
          >
            {user ? getInitial(user.email) : "L"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
