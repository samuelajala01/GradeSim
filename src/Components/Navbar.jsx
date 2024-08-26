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
            <div className='bg-blue-600 p-4 text-center shadow-md transform h-[100vh]'>
                <h1 className="text-white text-2xl font-bold mt-4 mb-4">GradeSim</h1>
                <nav className="space-y-2">
                    <Link to="/" className="text-white block px-4 md:px-16 py-2 hover:underline">Dashboard</Link>
                    <Link to="/about" className="text-white block px-4 md:px-16 py-2 hover:underline">About</Link>
                    <Link to="/contact" className="text-white block px-4 md:px-16 py-2 hover:underline">Logout</Link>
                </nav>
            </div>

            {/* Main Content */}
            {/* <div className="flex-1"> */}
                {/* Navbar for Mobile */}
                {/* <div className="bg-blue-600 p-4 shadow-md md:hidden flex justify-between items-center">
                    <h1 className="text-white text-2xl font-bold">Grade Simulator</h1>
                    <button onClick={toggleMenu} className="text-white focus:outline-none">
                        {isOpen ? '✖' : '☰'}
                    </button>
                </div> */}

                {/* Toggle Button for Desktop */}
                {/* <div className="hidden md:block fixed top-4 left-4 z-50">
                    <button onClick={toggleMenu} className="text-white bg-blue-600 p-2 rounded focus:outline-none shadow-md">
                        {isOpen ? '✖' : '☰'}
                    </button>
                </div> */}

                {/* Overlay for Sidebar */}
                {/* {isOpen && <div className="fixed inset-0 bg-black opacity-50 md:hidden" onClick={toggleMenu}></div>} */}

                {/* Page Content */}
                {/* <div className={`p-4 transition-transform duration-300 ease-in-out ${isOpen ? 'md:ml-64' : ''}`}> */}
                    {/* Your page content goes here */}
                {/* </div>
            </div> */}
        </div>
    );
}

export default Navbar;