import React, { useState } from 'react';

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl text-white text-center mb-6">{isLogin ? 'Login' : 'Sign Up'}</h1>
                <button 
                    onClick={toggleForm} 
                    className="w-full py-2 mb-4 text-white bg-blue-600 hover:bg-blue-500 rounded transition duration-200"
                >
                    {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
                </button>
                {isLogin ? (
                    <form>
                        {/* Login Form */}
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required 
                            className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white"
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required 
                            className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white"
                        />
                        <button 
                            type="submit" 
                            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-500 rounded transition duration-200"
                        >
                            Login
                        </button>
                    </form>
                ) : (
                    <form>
                        {/* Sign Up Form */}
                        <input 
                            type="text" 
                            placeholder="Username" 
                            required 
                            className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white"
                        />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required 
                            className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white"
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required 
                            className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white"
                        />
                        <button 
                            type="submit" 
                            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-500 rounded transition duration-200"
                        >
                            Sign Up
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;