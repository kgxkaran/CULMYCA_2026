import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import EventCard from '../../components/events/EventCard'
import api from '../../utils/axios'

// Events fetch karne ka function
const fetchEvents = async ({ category, isPaid, search }) => {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.append('category', category)
  if (isPaid !== 'all') params.append('isPaid', isPaid)
  if (search) params.append('search', search)

  const { data } = await api.get(`/events?${params.toString()}`)
  return data
}

// Filter Button Component
function FilterBtn({ label, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-dark-200 text-gray-400 hover:text-white border border-white/10'
      }`}
    >
      {label}
    </motion.button>
  )
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // URL params se initial values lo
  // /events?category=cultural → category = 'cultural'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [isPaid, setIsPaid] = useState('all')

  // React Query se data fetch karo
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', category, isPaid, search],
    // queryKey important hai — jab bhi yeh values change hon
    // React Query automatically refetch karega!
    queryFn: () => fetchEvents({ category, isPaid, search }),
    staleTime: 2 * 60 * 1000, // 2 min cache
  })

  const categories = [
    { value: 'all', label: '🌟 All Events' },
    { value: 'cultural', label: '🎭 Cultural' },
    { value: 'technical', label: '⚙️ Technical' },
    { value: 'gaming', label: '🎮 Gaming' },
    { value: 'art', label: '🎨 Art & Fashion' },
  ]

  const handleCategoryChange = (value) => {
    setCategory(value)
    // URL bhi update karo — shareable links ke liye!
    if (value === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', value)
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-3">
            All Events
          </h1>
          <p className="text-gray-400">
            {data?.count || 0} events across 4 categories
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md mx-auto mb-8"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11"
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {categories.map((cat) => (
            <FilterBtn
              key={cat.value}
              label={cat.label}
              active={category === cat.value}
              onClick={() => handleCategoryChange(cat.value)}
            />
          ))}
        </motion.div>

        {/* Paid/Free Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex gap-2 justify-center mb-10"
        >
          {[
            { value: 'all', label: 'All' },
            { value: 'false', label: '🆓 Free' },
            { value: 'true', label: '💳 Paid' },
          ].map((f) => (
            <FilterBtn
              key={f.value}
              label={f.label}
              active={isPaid === f.value}
              onClick={() => setIsPaid(f.value)}
            />
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-dark-300 rounded w-1/3 mb-3" />
                <div className="h-6 bg-dark-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-dark-300 rounded w-full mb-1" />
                <div className="h-4 bg-dark-300 rounded w-2/3 mb-4" />
                <div className="h-10 bg-dark-300 rounded" />
              </div>
            ))}
          </div>
          // Skeleton loading — cards ki jagah placeholder boxes
          // Real data aane tak yeh dikhe — professional feel!
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-xl text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400">Could not fetch events. Is your server running?</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && data?.events?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try changing filters or search term</p>
          </motion.div>
        )}

        {/* Events Grid */}
        {!isLoading && !isError && data?.events?.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${isPaid}-${search}`}
              // key change hone pe AnimatePresence exit + enter animation chalayega
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {data.events.map((event, index) => (
                <EventCard
                  key={event._id}
                  event={event}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  )
}