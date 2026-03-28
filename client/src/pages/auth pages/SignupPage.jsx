import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import axiosInstance from '../../utils/axios'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.'
    if (!form.phone.trim()) return 'Phone number is required.'
    if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Enter a valid 10-digit Indian mobile number.'
    if (!form.collegeName.trim()) return 'College name is required.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        collegeName: form.collegeName,
        password: form.password,
      })
      login(data.user, data.accessToken, data.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-10rem -right-8rem w-28rem h-28rem bg-primary-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-8rem left-8rem w-22rem h-22rem bg-primary-400 rounded-full blur-[100px] opacity-15 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold bg-linear-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              ELEMENTSCULMYCA
            </span>
          </Link>
          <p className="text-dark-100 mt-1 text-sm">April 9–10, 2026</p>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-dark-100 text-sm mb-6">Join 1000+ students from 50+ colleges</p>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all duration-200 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-dark-100 text-xs">or register with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-100 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="input w-full"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-100 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className="input w-full"
                disabled={loading}
              />
            </div>

            {/* Row: phone + college */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-dark-100 mb-1.5">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="input w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="collegeName" className="block text-sm font-medium text-dark-100 mb-1.5">
                  College
                </label>
                <input
                  id="collegeName"
                  name="collegeName"
                  type="text"
                  value={form.collegeName}
                  onChange={handleChange}
                  placeholder="IIT Delhi"
                  className="input w-full"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-100 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className="input w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-100 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength checklist */}
              {(passwordFocused || form.password) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1"
                >
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(form.password)
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={12}
                          className={passed ? 'text-green-400' : 'text-dark-200'}
                        />
                        <span className={`text-xs ${passed ? 'text-green-400' : 'text-dark-100'}`}>
                          {rule.label}
                        </span>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-100 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-100 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match indicator */}
              {form.confirmPassword && (
                <p className={`mt-1 text-xs ${form.password === form.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Terms note */}
            <p className="text-xs text-dark-100 leading-relaxed">
              By registering, you agree to MYCA's fest rules and that your details may be used for event coordination.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-100">
            Already registered?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}