import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
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

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRole, currentRole }) => {
  if (currentRole !== allowedRole) return <Navigate to="/login" replace />
  return children;
};

export default function App() {
  // Mock auth state: null, 'volunteer', 'ngo', or 'admin'
  const [userRole, setUserRole] = useState(null)

  return (
    <BrowserRouter>
      <Navbar userRole={userRole} onLogout={() => setUserRole(null)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/ngos" element={<Ngos />} />
        <Route path="/drives" element={<Drives />} />
        <Route path="/events" element={<Events />} />

        {/* Auth */}
        <Route path="/login" element={userRole ? <Navigate to={`/${userRole}`} /> : <Login onLogin={setUserRole} />} />
        <Route path="/signup" element={userRole ? <Navigate to={`/${userRole}`} /> : <Signup onLogin={setUserRole} />} />

        {/* Protected Dashboard Routes */}
        <Route path="/ngo" element={<ProtectedRoute allowedRole="ngo" currentRole={userRole}><NGODashboard /></ProtectedRoute>} />
        <Route path="/volunteer" element={<ProtectedRoute allowedRole="volunteer" currentRole={userRole}><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin" currentRole={userRole}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
