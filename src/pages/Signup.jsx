import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

const BG_IMAGE = "https://images.unsplash.com/photo-1775986996698-f795f50c1754?crop=entropy&cs=srgb&fm=jpg&w=900&q=80"

export default function Signup({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Detect if we arrived here after a Google sign-up redirect
  const isGoogleFlow = searchParams.get('google') === '1'
  const googleToken  = searchParams.get('token') || ''
  const googleName   = searchParams.get('name') || ''

  const [role, setRole] = useState('volunteer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 — volunteer
  const [step, setStep] = useState(1)
  const [skills, setSkills] = useState('')
  const [area, setArea] = useState('')
  const [preferences, setPreferences] = useState('')

  // Step 2 — NGO
  const [ngoName, setNgoName] = useState('')
  const [ngoRegId, setNgoRegId] = useState('')
  const [ngoDetails, setNgoDetails] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If redirected from Google flow, skip straight to step 2
  useEffect(() => {
    if (isGoogleFlow && googleToken) {
      setName(googleName)
      setStep(2)
    }
  }, [isGoogleFlow, googleToken, googleName])

  // ---- Regular email/password signup ----
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)
    try {
      // If we're in the Google flow, call complete-profile instead
      if (isGoogleFlow && googleToken) {
        await completeGoogleProfile(googleToken)
        return
      }

      // Normal registration
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

      // Auto-login after registration
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
    } catch {
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // ---- Complete Google profile after role selection ----
  const completeGoogleProfile = async (token) => {
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role,
          skills,
          area,
          preferences,
          ngo_name: ngoName,
          ngo_reg_id: ngoRegId,
          ngo_details: ngoDetails
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to complete profile.')
        return
      }

      navigate(`/${data.role}`)
    } catch {
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // ---- Google sign-up button ----
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Google sign-up failed.')
        return
      }

      onLogin(data)

      if (data.needs_profile) {
        // New user — go to step 2 with their Google name pre-filled
        setName(data.user.name)
        setStep(2)
        // Store the token in the URL so the form submit can use it
        navigate(`/signup?google=1&token=${data.token}&name=${encodeURIComponent(data.user.name)}`, { replace: true })
      } else {
        navigate(`/${data.user.role}`)
      }
    } catch {
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Image Panel */}
      <div
        className="hidden md:flex w-1/2 relative items-end p-12"
        style={{ backgroundImage: `url('${BG_IMAGE}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#8b597b]/30" />
        <div className="relative z-10 text-white max-w-sm">
          <p className="font-['Caveat'] text-xl text-[#ffdec7] mb-2 italic">new to the canvas?</p>
          <h1 className="font-bold text-5xl leading-tight mb-4">
            A pen.<br />A place.<br />A purpose.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            {step === 1 ? 'Choose a role and we\'ll tailor your dashboard.' : 'Tell us a little more about yourself.'}
          </p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="w-full md:w-1/2 bg-[#ffeedb] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 overflow-y-auto">
        <div className="max-w-sm w-full mx-auto">
          {/* Brand */}
          <p className="font-['Caveat'] text-2xl font-bold text-[#8b597b] mb-6">UnityDrive</p>

          <h2 className="font-bold text-3xl text-[#493129] mb-1">
            {step === 1 ? 'Create account' : isGoogleFlow ? `Welcome, ${googleName || name}!` : 'Almost done'}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {step === 1 ? (
              <>
                Already a member?{' '}
                <Link to="/login" className="text-[#493129] font-semibold underline underline-offset-2 hover:text-[#8b597b] transition-colors">
                  Sign in
                </Link>
              </>
            ) : isGoogleFlow ? (
              'Pick your role and complete your profile to get started.'
            ) : (
              'Just a few more details.'
            )}
          </p>

          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-[#efa3a0]' : 'bg-[#493129]/15'}`}
              />
            ))}
          </div>

          {/* Role Toggle — always visible */}
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
                {/* Google Sign-Up button — only on step 1 */}
                <div>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-up was cancelled or failed.')}
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#493129]/20" />
                  <span className="text-xs text-gray-400 font-medium tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-[#493129]/20" />
                </div>

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
                {isGoogleFlow && (
                  <div className="bg-[#ffdec7]/50 border border-[#efa3a0]/40 rounded-lg px-4 py-3 text-xs text-[#493129]">
                    ✅ Signed in with Google as <strong>{googleName || name}</strong>. Just fill in your skills to finish!
                  </div>
                )}
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
                {isGoogleFlow && (
                  <div className="bg-[#ffdec7]/50 border border-[#efa3a0]/40 rounded-lg px-4 py-3 text-xs text-[#493129]">
                    ✅ Signed in with Google as <strong>{googleName || name}</strong>. Just fill in your NGO details to finish!
                  </div>
                )}
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

            <div className="flex gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => { if (!isGoogleFlow) setStep(1) }}
                  disabled={isGoogleFlow}
                  className="btn-sketch px-6 py-2.5 text-sm font-bold bg-transparent border-2 border-[#493129] text-[#493129] tracking-widest flex-1 disabled:opacity-40"
                >
                  BACK
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-sketch px-6 py-2.5 text-sm font-bold bg-[#493129] text-[#ffeedb] tracking-widest flex-1 disabled:opacity-60"
              >
                {loading ? 'SAVING...' : step === 1 ? 'NEXT' : isGoogleFlow ? 'FINISH' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
