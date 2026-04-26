import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BG_IMAGE = "https://images.unsplash.com/photo-1775986996698-f795f50c1754?crop=entropy&cs=srgb&fm=jpg&w=900&q=80"

export default function Signup({ onLogin }) {
  const navigate = useNavigate()
  const [role, setRole] = useState('volunteer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Step 2 states
  const [step, setStep] = useState(1)
  const [skills, setSkills] = useState('')
  const [area, setArea] = useState('')
  const [preferences, setPreferences] = useState('')

  // NGO Step 2 states
  const [ngoName, setNgoName] = useState('')
  const [ngoRegId, setNgoRegId] = useState('')
  const [ngoDetails, setNgoDetails] = useState('')

  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (step === 1) {
      setStep(2)
      return
    }

    try {
      // 1. Register
      const fullSkills = preferences ? `${skills}. Preferred drives: ${preferences}` : skills
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, email, password, role, 
          skills: fullSkills, area,
          ngo_name: ngoName, ngo_reg_id: ngoRegId, ngo_details: ngoDetails
        })
      })
      const regData = await regRes.json()
      
      if (!regRes.ok) {
        setError(regData.error || 'Registration failed.')
        return
      }

      // 2. Auto-login after registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const loginData = await loginRes.json()
      
      if (loginRes.ok) {
        onLogin(loginData)
        navigate(`/${loginData.user.role}`)
      }
    } catch (err) {
      setError('Failed to connect to server.')
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
          <p className="font-['Caveat'] text-xl text-[#ffdec7] mb-2 italic">new to the canvas?</p>
          <h1 className="font-bold text-5xl leading-tight mb-4">
            A pen.<br />A place.<br />A purpose.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Choose a role and we'll tailor your dashboard.
          </p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="w-full md:w-1/2 bg-[#ffeedb] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-sm w-full mx-auto">
          {/* Brand */}
          <p className="font-['Caveat'] text-2xl font-bold text-[#8b597b] mb-6">UnityDrive</p>

          <h2 className="font-bold text-3xl text-[#493129] mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Already a member?{' '}
            <Link to="/login" className="text-[#493129] font-semibold underline underline-offset-2 hover:text-[#8b597b] transition-colors">
              Sign in
            </Link>
          </p>

          {/* Role Toggle */}
          <div className="flex border-2 border-[#493129]/20 rounded-xl overflow-hidden mb-8">
            {[
              ['volunteer', 'Volunteer'],
              ['ngo', 'NGO Admin'],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setRole(val)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  role === val
                    ? 'bg-[#efa3a0] text-white'
                    : 'bg-transparent text-[#493129] hover:bg-[#ffdec7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">FULL NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                    placeholder="Jane Doe"
                  />
                </div>

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
              </>
            ) : role === 'volunteer' ? (
              <>
                {/* Skills */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">SKILLS / EXPERTISE</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                    placeholder="e.g. Teaching, Cooking, Medical..."
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">NEIGHBORHOOD / AREA</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                    placeholder="e.g. Indiranagar, Bangalore"
                  />
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">WHAT KIND OF DRIVES DO YOU PREFER?</label>
                  <textarea
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    required
                    rows={2}
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400 resize-none"
                    placeholder="e.g. I prefer weekend drives focusing on children's education."
                  />
                </div>
              </>
            ) : (
              <>
                {/* NGO Name */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">NGO NAME</label>
                  <input
                    type="text"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                    placeholder="e.g. GreenRoots Trust"
                  />
                </div>

                {/* Registration ID */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">REGISTRATION ID</label>
                  <input
                    type="text"
                    value={ngoRegId}
                    onChange={(e) => setNgoRegId(e.target.value)}
                    required
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400"
                    placeholder="e.g. 12345678"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#8b597b] mb-2">NGO DETAILS</label>
                  <textarea
                    value={ngoDetails}
                    onChange={(e) => setNgoDetails(e.target.value)}
                    required
                    rows={2}
                    className="w-full bg-transparent border-b-2 border-[#493129]/30 py-2 text-[#493129] text-sm outline-none focus:border-[#8b597b] transition-colors placeholder-gray-400 resize-none"
                    placeholder="Brief description of the NGO's mission."
                  />
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            {/* Submit */}
            <div className="flex gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-sketch px-6 py-2.5 text-sm font-bold bg-transparent border-2 border-[#493129] text-[#493129] tracking-widest flex-1"
                >
                  BACK
                </button>
              )}
              <button
                type="submit"
                className="btn-sketch px-6 py-2.5 text-sm font-bold bg-[#493129] text-[#ffeedb] tracking-widest flex-1"
              >
                {step === 1 ? 'NEXT' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
