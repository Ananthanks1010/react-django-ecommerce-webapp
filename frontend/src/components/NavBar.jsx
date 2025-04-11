import React, { useState } from "react";
import logo from "../assets/logo1.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./authcontext";

const BACKEND_URL = "${import.meta.env.VITE_API_URL}";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleSearch = () => setIsOpen((prev) => !prev);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

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
    navigate("/login", { state: { from: window.location.pathname } });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    window.location.reload();
  };

  const getInitial = (email) => email ? email[0].toUpperCase() : "U";

  return (
    <div className="w-full bg-base-100 shadow-sm px-4 py-2">
      <div className="flex flex-wrap justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo */}
        <div className="flex items-center mb-2 sm:mb-0">
          <img src={logo} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
          <h1 className="ml-2 text-xl md:text-2xl font-bold text-white font-signature">
            Tobirama
          </h1>
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Search Section */}
          <div className="relative">
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
                  className="absolute mt-2 right-0 w-64 bg-white rounded-full shadow px-3 py-1 z-50 flex items-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-grow px-2 py-1 text-black outline-none bg-transparent"
                  />
                  <button type="submit" className="ml-2 text-black font-semibold">
                    Go
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Icons */}
          <button className="btn btn-primary btn-ghost btn-circle" onClick={() => navigate("/ImageSearch")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 7h2l1.5-2h11L19 7h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

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

          <button
            className="btn btn-primary btn-ghost btn-circle"
            onClick={() => {
              if (user) {
                navigate("/cart", { state: { user_id: user.id || user.email } });
              } else {
                navigate("/login", { state: { from: "/cart" } });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13L17 13M7 13l2.293-2.293a1 1 0 011.414 0L13 13" />
            </svg>
          </button>

          {/* Auth Button */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={toggleDropdown}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700"
                >
                  {getInitial(user.email)}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/");
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
