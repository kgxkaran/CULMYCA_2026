import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import axiosInstance from '../../utils/axios'

/**
 * Google OAuth lands the user here:
 *   /auth/callback?accessToken=...&refreshToken=...
 *
 * We pull the tokens from URL params, fetch /auth/me to hydrate the
 * user object, save everything to the Zustand store, then redirect.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const errorParam = searchParams.get('error')

    if (errorParam || !accessToken || !refreshToken) {
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    // Fetch user profile using the new access token
    axiosInstance
      .get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        login(data.user, accessToken, refreshToken)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-dark-300 flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="animate-spin text-primary-400" />
      <p className="text-dark-100 text-sm">Completing sign in…</p>
    </div>
  )
}