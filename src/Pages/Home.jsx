import React, { useState } from 'react';
// import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-[100vw] m-8 sm:m-12 md:m-20">
            <h1 className='text-4xl font-bold'>Welcome John,</h1>
                </div>
          
    );
}

export default Navbar;