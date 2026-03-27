import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function EventCard({ event, index }) {
  const categoryColors = {
    cultural: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    technical: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gaming: 'bg-green-500/20 text-green-400 border-green-500/30',
    art: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  }

  const categoryIcons = {
    cultural: '🎭',
    technical: '⚙️',
    gaming: '🎮',
    art: '🎨',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      // index * 0.08 → har card thoda late aayega — stagger effect!
      whileHover={{ y: -4 }}
      className="card flex flex-col h-full group"
    >
      {/* Top — Category + Paid Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${categoryColors[event.category]}`}>
          {categoryIcons[event.category]} {event.category}
        </span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          event.isPaid
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}>
          {event.isPaid ? `₹${event.registrationFee}` : 'FREE'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors mb-2">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
        {event.description}
        {/* line-clamp-2 → sirf 2 lines dikhao — overflow hide */}
      </p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>📅</span>
          <span>{new Date(event.date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>🕐</span>
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>📍</span>
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>👥</span>
          <span>
            {event.teamSizeMin === event.teamSizeMax
              ? event.teamSizeMin === 1
                ? 'Solo'
                : `Team of ${event.teamSizeMin}`
              : `Team ${event.teamSizeMin}-${event.teamSizeMax}`}
          </span>
        </div>
      </div>

      {/* Slots Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{event.registeredCount} registered</span>
          <span>{event.totalSlots - event.registeredCount} slots left</span>
        </div>
        <div className="h-1.5 bg-dark-300 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(event.registeredCount / event.totalSlots) * 100}%` }}
            transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
            className={`h-full rounded-full ${
              event.registeredCount / event.totalSlots > 0.8
                ? 'bg-red-500'    // 80%+ full → red
                : event.registeredCount / event.totalSlots > 0.5
                ? 'bg-amber-500'  // 50%+ full → amber
                : 'bg-primary-600' // normal → purple
            }`}
          />
        </div>
      </div>

      {/* Prize */}
      {event.prizes?.first && (
        <div className="flex items-center gap-2 text-sm text-amber-400 mb-4">
          <span>🏆</span>
          <span>1st Prize: {event.prizes.first}</span>
        </div>
      )}

      {/* CTA Button */}
      <Link
        to={`/events/${event._id}`}
        className="btn-primary text-center text-sm py-2.5 mt-auto"
      >
        View Details & Register →
      </Link>
    </motion.div>
  )
}