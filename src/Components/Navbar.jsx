import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    // const toggleMenu = () => {
    //     setIsOpen(!isOpen);
    // };

    return (
        <div className="block">
            {/* Sidebar for Desktop */}
            <div className='bg-[#1f325e] p-4 text-center shadow-md transform h-full'>
                <h1 className="text-white text-2xl font-bold mt-4 mb-8">GradeSim</h1>
                <nav className="space-y-2">
                    <Link to="/" className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827]" >Dashboard</Link>
                    <Link to="/about" className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827]">About</Link>
                    <Link to="/contact" className="text-white block px-4 md:px-16 py-2 hover:bg-[#111827]">Logout</Link>
                </nav>
            </div>
        </div>
    );
}

export default Navbar;