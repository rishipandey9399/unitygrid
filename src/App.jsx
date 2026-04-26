import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Ngos from './pages/Ngos'
import Drives from './pages/Drives'
import Events from './pages/Events'
import NGODashboard from './pages/NGODashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import AiMatcher from './pages/AiMatcher'
import AiAnalyzer from './pages/AiAnalyzer'
import NgoVolunteerFinder from './pages/NgoVolunteerFinder'

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRole, currentRole }) => {
  if (currentRole !== allowedRole) return <Navigate to="/login" replace />
  return children;
};

export default function App() {
  const [userRole, setUserRole] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserRole(parsedUser.role)
      setUser(parsedUser)
    }
    setLoading(false)
  }, [])

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUserRole(data.user.role)
    setUser(data.user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUserRole(null)
    setUser(null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Navbar userRole={userRole} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/ngos" element={<Ngos />} />
        <Route path="/drives" element={<Drives />} />
        <Route path="/events" element={<Events />} />

        {/* Auth */}
        <Route path="/login" element={userRole ? <Navigate to={`/${userRole}`} /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={userRole ? <Navigate to={`/${userRole}`} /> : <Signup onLogin={handleLogin} />} />

        {/* Protected Dashboard Routes */}
        <Route path="/ngo" element={<ProtectedRoute allowedRole="ngo" currentRole={userRole}><NGODashboard /></ProtectedRoute>} />
        <Route path="/volunteer" element={<ProtectedRoute allowedRole="volunteer" currentRole={userRole}><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin" currentRole={userRole}><AdminDashboard /></ProtectedRoute>} />
        
        {/* AI Tools */}
        <Route path="/ai-analyzer" element={<AiAnalyzer />} />
        <Route path="/ai-matcher" element={<ProtectedRoute allowedRole="volunteer" currentRole={userRole}><AiMatcher /></ProtectedRoute>} />
        <Route path="/ngo-volunteer-finder" element={<ProtectedRoute allowedRole="ngo" currentRole={userRole}><NgoVolunteerFinder /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
