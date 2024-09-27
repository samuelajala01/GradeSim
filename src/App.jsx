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

// import './index.css'
// import { useState, useEffect } from 'react'
// import { createClient } from '@supabase/supabase-js'
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from '@supabase/auth-ui-shared'

// const supabase = createClient('https://luirimqkntjkfxqdqsdf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aXJpbXFrbnRqa2Z4cWRxc2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MTQwNzUsImV4cCI6MjA0MjA5MDA3NX0.FcbVHjrxkooloSY54PDkkHXObvvW2POz8X981yN0YbU')

// export default function App() {
//   const [session, setSession] = useState(null)

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//     })

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   if (!session) {
//     return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
//   }
//   else {
//     return (<div>Logged in!</div>)
//   }
// }