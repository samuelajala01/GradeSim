import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Navbar from './Components/Navbar';

function App() {
    return (
        <Router>
            <div className="flex h-screen">
                <Navbar className="h-full" />
                <div className="flex flex-grow overflow-auto">
                    <Routes>
                        {/* Home Page with Navbar */}
                        <Route 
                            path="/" 
                            element={<Home />} 
                        />
                        {/* Login Page */}
                        <Route 
                            path="/login" 
                            element={<Login />} 
                        />
                        <Route 
                            path="/other" 
                            element={<h1>This page does not have a Navbar</h1>} 
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;