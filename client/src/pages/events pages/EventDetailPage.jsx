import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Trophy, CheckCircle2, AlertCircle } from 'lucide-react'
import axiosInstance from '../../utils/axios'
import useAuthStore from '../../store/authStore'
import RegistrationModal from '../../components/registration/RegistrationModal'

const catColor = {
  cultural: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  technical: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  gaming:   'bg-green-500/20 text-green-300 border-green-500/30',
  art:      'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [showModal, setShowModal] = useState(false)

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => axiosInstance.get(`/events/${id}`).then((r) => r.data.event),
  })

  const { data: myRegs } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => axiosInstance.get('/registrations/my').then((r) => r.data.registrations),
    enabled: isAuthenticated,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-300 pt-24 px-4">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-dark-200 rounded w-1/3" />
          <div className="h-64 bg-dark-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-dark-300 pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Event not found</p>
          <button onClick={() => navigate('/events')} className="btn-primary mt-4">Back to events</button>
        </div>
      </div>
    )
  }

  const slotsLeft = event.totalSlots - event.registeredCount
  const fillPct   = Math.round((event.registeredCount / event.totalSlots) * 100)
  const isFull    = slotsLeft <= 0
  const alreadyRegistered = myRegs?.some((r) => r.event._id === event._id && r.status !== 'cancelled')
  const badgeClass = catColor[event.category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  const barColor   = fillPct >= 80 ? 'bg-red-500' : fillPct >= 50 ? 'bg-yellow-400' : 'bg-primary-500'

  return (
    <>
      <div className="min-h-screen bg-dark-300 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-100 hover:text-white transition-colors mb-6 mt-4">
            <ArrowLeft size={18} /> Back to events
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>{event.category}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30">Free</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
              </div>

              <div className="card p-6">
                <h2 className="text-white font-semibold mb-3">About this event</h2>
                <p className="text-dark-100 leading-relaxed">{event.description}</p>
              </div>

              {event.rules?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-white font-semibold mb-3">Rules</h2>
                  <ol className="space-y-2">
                    {event.rules.map((rule, i) => (
                      <li key={i} className="flex gap-3 text-dark-100 text-sm">
                        <span className="text-primary-400 font-bold shrink-0">{i + 1}.</span>
                        {rule}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {(event.prizes?.first || event.prizes?.second || event.prizes?.third) && (
                <div className="card p-6">
                  <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-400" /> Prize pool
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { place: '1st', prize: event.prizes?.first,  emoji: '🥇', color: 'border-yellow-500/40 bg-yellow-500/10' },
                      { place: '2nd', prize: event.prizes?.second, emoji: '🥈', color: 'border-gray-400/40 bg-gray-400/10' },
                      { place: '3rd', prize: event.prizes?.third,  emoji: '🥉', color: 'border-orange-600/40 bg-orange-600/10' },
                    ].map(({ place, prize, emoji, color }) =>
                      prize ? (
                        <div key={place} className={`rounded-xl border p-4 text-center ${color}`}>
                          <div className="text-2xl mb-1">{emoji}</div>
                          <p className="text-xs text-dark-100">{place} place</p>
                          <p className="text-white font-bold mt-1">{prize}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column — sticky registration card ── */}
            <div className="lg:col-span-1">
              <div className="card p-6 lg:sticky lg:top-24">
                <h2 className="text-white font-semibold mb-4">Registration</h2>

                <div className="space-y-3 mb-5">
                  {[
                    { icon: Calendar, label: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    { icon: Clock,    label: event.time },
                    { icon: MapPin,   label: event.venue },
                    { icon: Users,    label: event.teamSizeMax > 1 ? `Team: ${event.teamSizeMin}–${event.teamSizeMax} members` : 'Solo event' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-dark-100 text-sm">
                      <Icon size={15} className="text-primary-400 shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Slots bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-dark-100">Slots</span>
                    <span className={isFull ? 'text-red-400' : 'text-dark-100'}>{isFull ? 'Full' : `${slotsLeft} left`}</span>
                  </div>
                  <div className="h-2 bg-dark-100/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                  <p className="text-xs text-dark-100 mt-1">{event.registeredCount} / {event.totalSlots} registered</p>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-dark-100 text-sm">Registration fee</span>
                  <span className="font-bold text-lg text-green-400">Free</span>
                </div>

                {alreadyRegistered ? (
                  <div className="flex items-center gap-2 justify-center py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
                    <CheckCircle2 size={16} /> Already registered
                  </div>
                ) : isFull ? (
                  <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">Event full</button>
                ) : isAuthenticated ? (
                  <button onClick={() => setShowModal(true)} className="btn-primary w-full">
                    Register for free
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login', { state: { from: { pathname: `/events/${id}` } } })}
                    className="btn-outline w-full"
                  >
                    Login to register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <RegistrationModal
            event={event}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}