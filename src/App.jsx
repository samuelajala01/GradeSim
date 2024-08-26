import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Navbar from './Components/Navbar'; // Corrected casing for the Navbar component

function App() {
    return (
        <Router>
            <Routes>
                {/* Home Page with Navbar */}
                <Route 
                    path="/" 
                    element={
                        <>
                            <div className='flex'><Navbar />
                            <Home /></div>
                        </>
                    } 
                />
                {/* Login Page with Navbar */}
                <Route 
                    path="/login" 
                    element={
                        <>
                            <Login />
                        </>
                    } 
                />
                {/* Other pages without Navbar */}
                <Route 
                    path="/other" 
                    element={<h1>This page does not have a Navbar</h1>} 
                />
                {/* Another Page with Navbar */}
                <Route 
                    path="/another-page" 
                    element={
                        <>
                            <Navbar />
                            <h1>Welcome to Another Page!</h1>
                        </>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;