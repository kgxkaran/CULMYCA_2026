import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Countdown Timer Component
function CountdownTimer() {
  const festDate = new Date('2026-04-09T00:00:00')

  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const calculate = () => {
      const now = new Date()
      const diff = festDate - now

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval) // cleanup!
  }, [])

  return (
    <div className="flex gap-4 justify-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <motion.div
          key={unit}
          whileHover={{ scale: 1.05 }}
          className="bg-dark-200 border border-white/10 rounded-xl p-4 min-w-\[80px]\ text-center"
        >
          <div className="text-3xl font-bold text-primary-400">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400 uppercase mt-1">{unit}</div>
        </motion.div>
      ))}
    </div>
  )
}

// Category Card Component
function CategoryCard({ icon, title, count, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="card cursor-pointer group"
    >
      <div className={`text-4xl mb-3`}>{icon}</div>
      <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{count} events</p>
      <div className={`mt-3 h-1 rounded-full ${color} w-0 group-hover:w-full transition-all duration-500`} />
    </motion.div>
  )
}

export default function LandingPage() {
  const categories = [
    { icon: '🎭', title: 'Cultural', count: 12, color: 'bg-purple-500', delay: 0.1 },
    { icon: '⚙️', title: 'Technical', count: 10, color: 'bg-blue-500', delay: 0.2 },
    { icon: '🎮', title: 'Gaming', count: 8, color: 'bg-green-500', delay: 0.3 },
    { icon: '🎨', title: 'Art & Fashion', count: 7, color: 'bg-pink-500', delay: 0.4 },
  ]

  return (
    <div className="overflow-hidden">

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-primary-900/20 via-dark-100 to-dark-100 pointer-events-none" />

        {/* Animated background circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative text-center max-w-4xl mx-auto pt-20">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-600/30 rounded-full px-4 py-2 text-primary-400 text-sm mb-6"
          >
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            9th & 10th April 2026
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-tight"
          >
            ELEMENTS
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-pink-400">
              CULMYCA
            </span>
            <span className="text-3xl sm:text-4xl font-light text-gray-300">2026</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8"
          >
            The biggest cultural-techno fest of the year.
            35+ events, 1000+ students, infinite memories.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/events" className="btn-primary text-lg px-8 py-3">
              Explore Events
            </Link>
            <Link to="/signup" className="btn-outline text-lg px-8 py-3">
              Register Now
            </Link>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest">
              Fest begins in
            </p>
            <CountdownTimer />
          </motion.div>

        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '35+', label: 'Events' },
            { value: '1000+', label: 'Students' },
            { value: '50+', label: 'Colleges' },
            { value: '₹1L+', label: 'Prize Pool' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-bold text-primary-400">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES SECTION ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Event Categories
            </h2>
            <p className="text-gray-400">Something for everyone</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.title} to={`/events?category=${cat.title.toLowerCase()}`}>
                <CategoryCard {...cat} />
              </Link>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/events" className="btn-primary px-8 py-3 text-lg">
              View All 35+ Events →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-gray-500 text-sm">
        <p>ELEMENTSCULMYCA 2026 • Made with ❤️ by the tech team</p>
      </footer>

    </div>
  )
}