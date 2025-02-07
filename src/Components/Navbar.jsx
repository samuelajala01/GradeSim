import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMenu} 
        className="fixed top-4 right-4 p-2 rounded bg-[#161925] lg:hidden z-50"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navbar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-[#161925] p-4 text-center shadow-md
        transform transition-transform duration-300 ease-in-out z-40
        lg:transform-none lg:relative
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <h1 className="text-white text-2xl font-bold mt-4 mb-8">
          Grade<span className="text-blue-600">Sim</span>
        </h1>
        <nav className="space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827] rounded transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/analytics"
            onClick={() => setIsOpen(false)}
            className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827] rounded transition-colors"
          >
            Analytics
          </Link>
          <Link
            to="/predictor"
            onClick={() => {
              setIsOpen(false);
            }}
            className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827] rounded transition-colors"
          >
            Grade Predictor
          </Link>
          <Link
            to="/settings"
            onClick={() => {
              setIsOpen(false);
            }}
            className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827] rounded transition-colors"
          >
            Settings
          </Link>
          <Link
            to="/login"
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827] rounded transition-colors"
          >
            Logout
          </Link>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;