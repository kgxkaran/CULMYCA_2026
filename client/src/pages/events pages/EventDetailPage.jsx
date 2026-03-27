import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../utils/axios'
import useAuthStore from '../../store/authStore'

export default function EventDetailPage() {
  const { id } = useParams() // URL se event ID lo → /events/:id
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`)
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-gray-400 text-lg animate-pulse">Loading event...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="text-xl text-white">Event not found</h3>
        </div>
      </div>
    )
  }

  const event = data?.event

  const categoryColors = {
    cultural: 'text-purple-400',
    technical: 'text-blue-400',
    gaming: 'text-green-400',
    art: 'text-pink-400',
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          ← Back to Events
        </motion.button>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Left — Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Category + Title */}
            <div>
              <span className={`text-sm font-medium uppercase tracking-wider ${categoryColors[event.category]}`}>
                {event.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">
                {event.title}
              </h1>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">About this event</h2>
              <p className="text-gray-400 leading-relaxed">{event.description}</p>
            </div>

            {/* Rules */}
            {event.rules?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-3">Rules & Guidelines</h2>
                <ul className="space-y-2">
                  {event.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400">
                      <span className="text-primary-400 font-bold mt-0.5">{i + 1}.</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prizes */}
            {event.prizes && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-3">🏆 Prizes</h2>
                <div className="space-y-2">
                  {event.prizes.first && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🥇</span>
                      <div>
                        <div className="text-xs text-gray-500">1st Place</div>
                        <div className="text-amber-400 font-semibold">{event.prizes.first}</div>
                      </div>
                    </div>
                  )}
                  {event.prizes.second && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🥈</span>
                      <div>
                        <div className="text-xs text-gray-500">2nd Place</div>
                        <div className="text-gray-300 font-semibold">{event.prizes.second}</div>
                      </div>
                    </div>
                  )}
                  {event.prizes.third && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🥉</span>
                      <div>
                        <div className="text-xs text-gray-500">3rd Place</div>
                        <div className="text-amber-700 font-semibold">{event.prizes.third}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right — Registration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Registration Card */}
            <div className="card sticky top-24">
              {/* Fee */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white">
                  {event.isPaid ? `₹${event.registrationFee}` : 'FREE'}
                </div>
                <div className="text-gray-500 text-sm">per team</div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">📅 Date</span>
                  <span className="text-white">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">🕐 Time</span>
                  <span className="text-white">{event.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">📍 Venue</span>
                  <span className="text-white">{event.venue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">👥 Team Size</span>
                  <span className="text-white">
                    {event.teamSizeMin === event.teamSizeMax
                      ? event.teamSizeMin === 1 ? 'Solo' : `${event.teamSizeMin} members`
                      : `${event.teamSizeMin}-${event.teamSizeMax} members`}
                  </span>
                </div>
              </div>

              {/* Slots */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{event.registeredCount} registered</span>
                  <span>{event.totalSlots - event.registeredCount} left</span>
                </div>
                <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all"
                    style={{ width: `${(event.registeredCount / event.totalSlots) * 100}%` }}
                  />
                </div>
              </div>

              {/* Register Button */}
              {event.totalSlots - event.registeredCount === 0 ? (
                <button disabled className="w-full py-3 rounded-lg bg-gray-700 text-gray-500 cursor-not-allowed font-medium">
                  Registrations Full
                </button>
              ) : isAuthenticated ? (
                <button className="btn-primary w-full py-3 text-base">
                  Register Now →
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full py-3 text-base"
                >
                  Login to Register →
                </button>
              )}

              <p className="text-xs text-gray-500 text-center mt-3">
                {event.totalSlots - event.registeredCount} spots remaining
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}