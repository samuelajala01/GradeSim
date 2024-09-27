import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex flex-col h-full w-64 bg-[#1f325e] p-4 text-center shadow-md">
            <h1 className="text-white text-2xl font-bold mt-4 mb-8">GradeSim</h1>
            <nav className="space-y-2">
                <Link to="/" className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827]">Dashboard</Link>
                <Link to="/analytics" className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827]">Analytics</Link>
                <Link to="/contact" className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827]">Logout</Link>
            </nav>
        </div>
    );
}

export default Navbar;