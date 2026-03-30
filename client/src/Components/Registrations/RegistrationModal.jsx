import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Loader2, CheckCircle2, Users, User } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../utils/axios'
import useAuthStore from '../../store/authStore'

const emptyMember = () => ({ name: '', email: '', phone: '', collegeName: '' })
const STEPS = { DETAILS: 'details', CONFIRM: 'confirm', SUCCESS: 'success' }

export default function RegistrationModal({ event, onClose }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const isTeam      = event.teamSizeMax > 1
  const minTeammates = event.teamSizeMin - 1
  const maxTeammates = event.teamSizeMax - 1

  const [step, setStep]         = useState(STEPS.DETAILS)
  const [teamName, setTeamName] = useState('')
  const [members, setMembers]   = useState(
    isTeam ? Array.from({ length: minTeammates }, emptyMember) : []
  )
  const [errors, setErrors]         = useState({})
  const [registration, setRegistration] = useState(null)

  // ── mutation ──
  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => axiosInstance.post('/registrations/initiate', payload),
    onSuccess: ({ data }) => {
      setRegistration(data.registration)
      setStep(STEPS.SUCCESS)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
    },
    onError: (err) => {
      setErrors({ submit: err.response?.data?.message || 'Registration failed. Try again.' })
    },
  })

  // ── member helpers ──
  const addMember = () => {
    if (members.length < maxTeammates) setMembers((m) => [...m, emptyMember()])
  }
  const removeMember = (i) => {
    if (members.length > minTeammates) setMembers((m) => m.filter((_, idx) => idx !== i))
  }
  const updateMember = (i, field, value) => {
    setMembers((m) => m.map((mem, idx) => (idx === i ? { ...mem, [field]: value } : mem)))
    setErrors((e) => ({ ...e, [`member_${i}_${field}`]: '' }))
  }

  // ── validation ──
  const validate = () => {
    const errs = {}
    if (isTeam && !teamName.trim()) errs.teamName = 'Team name is required.'
    if (isTeam) {
      members.forEach((m, i) => {
        if (!m.name.trim())                                   errs[`member_${i}_name`]       = 'Required'
        if (!m.email.trim() || !/^\S+@\S+\.\S+$/.test(m.email)) errs[`member_${i}_email`]  = 'Valid email required'
        if (!m.phone.trim() || !/^[6-9]\d{9}$/.test(m.phone))   errs[`member_${i}_phone`]  = 'Valid phone required'
        if (!m.collegeName.trim())                            errs[`member_${i}_collegeName`] = 'Required'
      })
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = () => { if (validate()) setStep(STEPS.CONFIRM) }
  const handleSubmit   = () => { mutate({ eventId: event._id, teamName, members }) }

  const catColor = {
    cultural: 'bg-purple-500/20 text-purple-300',
    technical: 'bg-blue-500/20 text-blue-300',
    gaming:   'bg-green-500/20 text-green-300',
    art:      'bg-pink-500/20 text-pink-300',
  }[event.category] || 'bg-gray-500/20 text-gray-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step !== STEPS.SUCCESS ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg bg-dark-200 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>
                {event.category}
              </span>
              {isTeam
                ? <span className="flex items-center gap-1 text-xs text-dark-100"><Users size={12} /> Team ({event.teamSizeMin}–{event.teamSizeMax})</span>
                : <span className="flex items-center gap-1 text-xs text-dark-100"><User size={12} /> Solo</span>
              }
            </div>
            <h2 className="text-lg font-bold text-white">{event.title}</h2>
          </div>
          {step !== STEPS.SUCCESS && (
            <button onClick={onClose} className="text-dark-100 hover:text-white transition-colors ml-4 shrink-0">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step !== STEPS.SUCCESS && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex items-center gap-2">
              {[STEPS.DETAILS, STEPS.CONFIRM].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s
                      ? 'bg-primary-500 text-white'
                      : step === STEPS.CONFIRM && s === STEPS.DETAILS
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-dark-100'
                  }`}>
                    {step === STEPS.CONFIRM && s === STEPS.DETAILS ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs ${step === s ? 'text-white' : 'text-dark-100'}`}>
                    {s === STEPS.DETAILS ? (isTeam ? 'Team details' : 'Your details') : 'Confirm'}
                  </span>
                  {i < 1 && <div className="flex-1 h-px bg-white/10 w-8" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: DETAILS ── */}
            {step === STEPS.DETAILS && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">

                {/* Registering user (read-only) */}
                <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-dark-100 mb-1 font-medium uppercase tracking-wide">Registering as</p>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-dark-100 text-sm">{user.email} · {user.collegeName}</p>
                </div>

                {isTeam && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-dark-100 mb-1.5">
                        Team name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => { setTeamName(e.target.value); setErrors((er) => ({ ...er, teamName: '' })) }}
                        placeholder="The Rockstars"
                        className="input w-full"
                      />
                      {errors.teamName && <p className="mt-1 text-xs text-red-400">{errors.teamName}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-dark-100">Teammates ({members.length}/{maxTeammates})</p>
                        {members.length < maxTeammates && (
                          <button type="button" onClick={addMember} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            <Plus size={14} /> Add member
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {members.map((member, i) => (
                          <div key={i} className="rounded-lg border border-white/10 bg-white p-4 space-y-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-dark-100 uppercase tracking-wide">Member {i + 1}</span>
                              {members.length > minTeammates && (
                                <button type="button" onClick={() => removeMember(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { field: 'name', placeholder: 'Full name', type: 'text' },
                                { field: 'email', placeholder: 'Email', type: 'email' },
                                { field: 'phone', placeholder: 'Phone', type: 'tel' },
                                { field: 'collegeName', placeholder: 'College', type: 'text' },
                              ].map(({ field, placeholder, type }) => (
                                <div key={field}>
                                  <input
                                    type={type}
                                    value={member[field]}
                                    onChange={(e) => updateMember(i, field, e.target.value)}
                                    placeholder={placeholder}
                                    className="input w-full text-sm"
                                  />
                                  {errors[`member_${i}_${field}`] && (
                                    <p className="mt-0.5 text-xs text-red-400">{errors[`member_${i}_${field}`]}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {!isTeam && (
                  <p className="text-dark-100 text-sm">This is a solo event. Confirm your details above and proceed.</p>
                )}
              </motion.div>
            )}

            {/* ── STEP 2: CONFIRM ── */}
            {step === STEPS.CONFIRM && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="rounded-lg bg-white/5 border border-white/10 divide-y divide-white/10">
                  <div className="px-4 py-3">
                    <p className="text-xs text-dark-100 mb-0.5">Event</p>
                    <p className="text-white font-medium">{event.title}</p>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-dark-100">Date</p>
                      <p className="text-white">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-100">Time</p>
                      <p className="text-white">{event.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-100">Venue</p>
                      <p className="text-white">{event.venue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-100">Fee</p>
                      <p className="text-green-400 font-medium">Free</p>
                    </div>
                  </div>
                  {isTeam && (
                    <div className="px-4 py-3">
                      <p className="text-xs text-dark-100 mb-1">Team</p>
                      <p className="text-white font-medium">{teamName}</p>
                      <p className="text-dark-100 text-xs mt-0.5">{user.name} (you) + {members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>

                {errors.submit && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    {errors.submit}
                  </p>
                )}
              </motion.div>
            )}

            {/* ── STEP 3: SUCCESS ── */}
            {step === STEPS.SUCCESS && registration && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 size={36} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">You're registered!</h3>
                <p className="text-dark-100 text-sm mb-6">
                  Your ticket for <span className="text-white">{event.title}</span> is confirmed.
                </p>

                {registration.qrCode && (
                  <div className="bg-white rounded-xl p-3 mb-4">
                    <img src={registration.qrCode} alt="QR ticket" className="w-40 h-40" />
                  </div>
                )}

                <p className="text-xs text-dark-100 mb-1">Ticket ID</p>
                <p className="font-mono text-primary-400 font-bold text-lg mb-6">{registration.ticketId}</p>
                <p className="text-xs text-dark-100 mb-4">View your ticket anytime in the Student Dashboard.</p>

                <button onClick={onClose} className="btn-primary px-8">Done</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== STEPS.SUCCESS && (
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 shrink-0">
            {step === STEPS.DETAILS && (
              <>
                <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleContinue} className="btn-primary flex-1">Review →</button>
              </>
            )}
            {step === STEPS.CONFIRM && (
              <>
                <button onClick={() => setStep(STEPS.DETAILS)} className="btn-outline flex-1" disabled={isPending}>← Back</button>
                <button onClick={handleSubmit} disabled={isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {isPending ? 'Registering...' : 'Confirm registration'}
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}