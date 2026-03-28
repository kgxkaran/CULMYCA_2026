import QRCode from 'qrcode'
import { nanoid } from 'nanoid'
import Registration from '../models/Registration.js'
import Event from '../models/Event.js'

// ─── helpers ────────────────────────────────────────────────────────────────

const generateTicket = async (registrationId) => {
  const ticketId = `MYCA-${nanoid(8).toUpperCase()}`
  const qrData = JSON.stringify({ ticketId, registrationId })
  const qrCode = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
  return { ticketId, qrCode }
}

// ─── POST /api/registrations/initiate ───────────────────────────────────────
// Called for BOTH free and paid events.
// For free  → confirms immediately, generates ticket, returns registration.
// For paid  → creates a pending registration, returns it so frontend can
//             open Razorpay. Payment controller will confirm it later.

export const initiateRegistration = async (req, res) => {
  try {
    const { eventId, teamName, members } = req.body
    const userId = req.user._id

    // 1. Load event
    const event = await Event.findById(eventId)
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found.' })
    }

    // 2. Slots check
    if (event.registeredCount >= event.totalSlots) {
      return res.status(400).json({ message: 'This event is full.' })
    }

    // 3. Duplicate check
    const existing = await Registration.findOne({ event: eventId, registeredBy: userId })
    if (existing) {
      return res.status(400).json({ message: 'You have already registered for this event.' })
    }

    // 4. Team validation
    const isTeam = event.teamSizeMax > 1
    if (isTeam) {
      if (!teamName?.trim()) {
        return res.status(400).json({ message: 'Team name is required.' })
      }
      const count = members?.length || 0
      if (count < event.teamSizeMin - 1 || count > event.teamSizeMax - 1) {
        // members array = teammates only (excludes the registering user)
        return res.status(400).json({
          message: `Add ${event.teamSizeMin - 1}–${event.teamSizeMax - 1} teammates (excluding yourself).`,
        })
      }
    }

    // 5. Build registration doc
    const regData = {
      event: eventId,
      registeredBy: userId,
      isTeam,
      teamName: isTeam ? teamName.trim() : '',
      members: isTeam ? members : [],
      amount: event.isPaid ? event.registrationFee * 100 : 0, // paise
      paymentStatus: event.isPaid ? 'pending' : 'free',
      status: event.isPaid ? 'pending' : 'confirmed',
    }

    const registration = await Registration.create(regData)

    // 6. Free event → generate ticket immediately
    if (!event.isPaid) {
      const { ticketId, qrCode } = await generateTicket(registration._id.toString())
      registration.ticketId = ticketId
      registration.qrCode = qrCode
      await registration.save()

      // Increment slot count
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } })

      const populated = await registration.populate('event', 'title date time venue category')
      return res.status(201).json({ registration: populated, requiresPayment: false })
    }

    // 7. Paid event → return pending registration for Razorpay flow
    const populated = await registration.populate('event', 'title date time venue category registrationFee')
    return res.status(201).json({ registration: populated, requiresPayment: true })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already registered for this event.' })
    }
    console.error('initiateRegistration error:', err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── POST /api/registrations/confirm-free ───────────────────────────────────
// Fallback for confirming a free registration that's stuck in pending.
// Not normally needed — initiateRegistration handles free events — but
// useful during testing.

export const confirmFreeRegistration = async (req, res) => {
  try {
    const { registrationId } = req.body
    const registration = await Registration.findById(registrationId)

    if (!registration) return res.status(404).json({ message: 'Registration not found.' })
    if (!registration.registeredBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorised.' })
    }
    if (registration.paymentStatus !== 'free') {
      return res.status(400).json({ message: 'This is a paid event — use the payment flow.' })
    }
    if (registration.status === 'confirmed') {
      return res.status(400).json({ message: 'Already confirmed.' })
    }

    const { ticketId, qrCode } = await generateTicket(registration._id.toString())
    registration.ticketId = ticketId
    registration.qrCode = qrCode
    registration.status = 'confirmed'
    await registration.save()

    await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: 1 } })

    res.json({ registration })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── GET /api/registrations/my ──────────────────────────────────────────────

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ registeredBy: req.user._id })
      .populate('event', 'title date time venue category isPaid registrationFee poster')
      .sort({ createdAt: -1 })

    res.json({ registrations })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── GET /api/registrations/:id ─────────────────────────────────────────────

export const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate(
      'event',
      'title date time venue category isPaid registrationFee'
    )

    if (!registration) return res.status(404).json({ message: 'Registration not found.' })

    // Only owner or admin can view
    if (!registration.registeredBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised.' })
    }

    res.json({ registration })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── GET /api/registrations/event/:eventId (admin) ──────────────────────────

export const getRegistrationsByEvent = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('registeredBy', 'name email phone collegeName')
      .sort({ createdAt: -1 })

    res.json({ count: registrations.length, registrations })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── DELETE /api/registrations/:id (cancel) ─────────────────────────────────

export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
    if (!registration) return res.status(404).json({ message: 'Registration not found.' })

    if (!registration.registeredBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorised.' })
    }
    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled.' })
    }

    registration.status = 'cancelled'
    await registration.save()

    // Free up the slot only if it was confirmed
    if (registration.status === 'confirmed' || registration.paymentStatus === 'free') {
      await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } })
    }

    res.json({ message: 'Registration cancelled.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

export { generateTicket }