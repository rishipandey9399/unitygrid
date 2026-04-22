import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Heart } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'NGOs', to: '/ngos' },
  { label: 'Drives', to: '/drives' },
  { label: 'Events', to: '/events' },
  { label: 'About', to: '/about' },
]

export default function Navbar({ userRole, onLogout }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      style={{ background: 'rgba(255,238,219,0.85)', backdropFilter: 'blur(10px)' }}
      className="sticky top-0 z-50 border-b-2 border-[#493129]"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-[#493129] flex items-center justify-center shadow-md">
            <Heart size={18} className="text-[#ffdec7]" fill="#ffdec7" />
          </div>
          <span className="font-['Caveat'] text-2xl font-bold text-[#493129] tracking-wide group-hover:text-[#8b597b] transition-colors">
            UNITYDRIVE
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === to
                  ? 'bg-[#493129] text-[#ffeedb]'
                  : 'text-[#493129] hover:bg-[#ffdec7]'
              }`}
            >
              {label}
            </Link>
          ))}
          
          {/* Conditional Dashboard Link based on Role */}
          {userRole === 'ngo' && (
            <Link to="/ngo" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === '/ngo' ? 'bg-[#493129] text-[#ffeedb]' : 'text-[#493129] hover:bg-[#ffdec7]'}`}>
              NGO Dashboard
            </Link>
          )}
          {userRole === 'volunteer' && (
            <Link to="/volunteer" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === '/volunteer' ? 'bg-[#493129] text-[#ffeedb]' : 'text-[#493129] hover:bg-[#ffdec7]'}`}>
              Volunteer Dashboard
            </Link>
          )}
          {userRole === 'admin' && (
            <Link to="/admin" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === '/admin' ? 'bg-[#493129] text-[#ffeedb]' : 'text-[#493129] hover:bg-[#ffdec7]'}`}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {userRole ? (
            <button onClick={onLogout} className="btn-sketch px-4 py-1.5 text-sm font-semibold bg-transparent text-[#493129]">
              Sign Out
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-sketch px-4 py-1.5 text-sm font-semibold bg-transparent text-[#493129]">
                Sign In
              </button>
              <button onClick={() => navigate('/login')} className="btn-sketch px-4 py-1.5 text-sm font-semibold bg-[#493129] text-[#ffeedb]">
                Join Now
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-[#493129]" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t-2 border-[#493129] bg-[#ffeedb] px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                pathname === to
                  ? 'bg-[#493129] text-[#ffeedb]'
                  : 'text-[#493129] hover:bg-[#ffdec7]'
              }`}
            >
              {label}
            </Link>
          ))}
          {/* Conditional Dashboard Link */}
          {userRole === 'ngo' && (
            <Link to="/ngo" onClick={() => setOpen(false)} className={`px-3 py-2 rounded-lg font-medium text-sm ${pathname === '/ngo' ? 'bg-[#493129] text-[#ffeedb]' : 'text-[#493129] hover:bg-[#ffdec7]'}`}>NGO Dashboard</Link>
          )}
          {userRole === 'volunteer' && (
            <Link to="/volunteer" onClick={() => setOpen(false)} className={`px-3 py-2 rounded-lg font-medium text-sm ${pathname === '/volunteer' ? 'bg-[#493129] text-[#ffeedb]' : 'text-[#493129] hover:bg-[#ffdec7]'}`}>Volunteer Dashboard</Link>
          )}
          {userRole === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className={`px-3 py-2 rounded-lg font-medium text-sm ${pathname === '/admin' ? 'bg-[#493129] text-[#ffeedb]' : 'text-[#493129] hover:bg-[#ffdec7]'}`}>Admin Panel</Link>
          )}
          
          <div className="flex gap-3 pt-2">
            {userRole ? (
              <button onClick={() => { onLogout(); setOpen(false); }} className="btn-sketch flex-1 py-2 text-sm font-semibold text-[#493129]">Sign Out</button>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setOpen(false); }} className="btn-sketch flex-1 py-2 text-sm font-semibold text-[#493129]">Sign In</button>
                <button onClick={() => { navigate('/login'); setOpen(false); }} className="btn-sketch flex-1 py-2 text-sm font-semibold bg-[#493129] text-[#ffeedb]">Join Now</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
