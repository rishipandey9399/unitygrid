import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BG_IMAGE = "https://images.unsplash.com/photo-1775986996698-f795f50c1754?crop=entropy&cs=srgb&fm=jpg&w=900&q=80"

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const DEMO_ACCOUNTS = [
    { email: 'admin@greenearth.org', password: 'password123', role: 'ngo' },
    { email: 'priya.sharma@demo.unitydrive.org', password: 'password123', role: 'volunteer' },
    { email: 'superadmin@unitydrive.org', password: 'password123', role: 'admin' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const found = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password)
    if (found) {
      onLogin(found.role)
      navigate(`/${found.role}`)
    } else {
      setError('Invalid credentials. Try a demo account below.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Image Panel */}
      <div
        className="hidden md:flex w-1/2 relative items-end p-12"
        style={{ backgroundImage: `url('${BG_IMAGE}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#8b597b]/30" />

        <div className="relative z-10 text-white max-w-sm">
          <p className="font-['Caveat'] text-xl text-[#ffdec7] mb-2 italic">welcome back —</p>
          <h1 className="font-bold text-5xl leading-tight mb-4">
            Pick up<br />your pen.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Your drives, volunteers and hours are right where you left them.
          </p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="w-full md:w-1/2 bg-[#ffeedb] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-sm w-full mx-auto">
          {/* Brand */}
          <p className="font-['Caveat'] text-2xl font-bold text-[#8b597b] mb-6">UnityDrive</p>

          <h2 className="font-bold text-3xl text-[#493129] mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-8">
            New here?{' '}
            <Link to="/signup" className="text-[#493129] font-semibold underline underline-offset-2 hover:text-[#8b597b] transition-colors">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-sketch px-6 py-2.5 text-sm font-bold bg-[#efa3a0] text-white tracking-widest"
            >
              SIGN IN
            </button>
          </form>

          {/* Demo accounts box */}
          <div className="mt-8 border-2 border-[#efa3a0]/40 rounded-xl p-4 bg-[#ffdec7]/30">
            <p className="text-xs font-bold text-[#493129] mb-2">Try demo accounts:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium text-[#493129]">NGO:</span> admin@greenearth.org / password123</p>
              <p><span className="font-medium text-[#493129]">Volunteer:</span> priya.sharma@demo.unitydrive.org / password123</p>
              <p><span className="font-medium text-[#493129]">Admin:</span> superadmin@unitydrive.org / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
