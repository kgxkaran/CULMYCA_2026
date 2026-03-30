import QRCode from 'qrcode'
import { nanoid } from 'nanoid'
import Registration from '../models/Registration.js'
import Event from '../models/Event.js'

// ─── helper ─────────────────────────────────────────────────────────────────

export const generateTicket = async (registrationId) => {
  const ticketId = `MYCA-${nanoid(8).toUpperCase()}`
  const qrData   = JSON.stringify({ ticketId, registrationId })
  const qrCode   = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
  return { ticketId, qrCode }
}

// ─── POST /api/registrations/initiate ───────────────────────────────────────
// All events are free — confirms immediately and generates ticket.

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
        return res.status(400).json({
          message: `Add ${event.teamSizeMin - 1}–${event.teamSizeMax - 1} teammates (excluding yourself).`,
        })
      }
    }

    // 5. Create registration
    const registration = await Registration.create({
      event:       eventId,
      registeredBy: userId,
      isTeam,
      teamName:    isTeam ? teamName.trim() : '',
      members:     isTeam ? members : [],
      status:      'confirmed',
    })

    // 6. Generate ticket + QR immediately
    const { ticketId, qrCode } = await generateTicket(registration._id.toString())
    registration.ticketId = ticketId
    registration.qrCode   = qrCode
    await registration.save()

    // 7. Increment slot count
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } })

    const populated = await registration.populate('event', 'title date time venue category')
    res.status(201).json({ registration: populated })

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already registered for this event.' })
    }
    console.error('initiateRegistration error:', err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── GET /api/registrations/my ──────────────────────────────────────────────

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ registeredBy: req.user._id })
      .populate('event', 'title date time venue category poster')
      .sort({ createdAt: -1 })

    res.json({ registrations })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── GET /api/registrations/:id ─────────────────────────────────────────────

export const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title date time venue category')

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' })
    }
    if (!registration.registeredBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised.' })
    }

    res.json({ registration })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─── GET /api/registrations/event/:eventId  (admin only) ────────────────────

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

// ─── DELETE /api/registrations/:id  (cancel) ────────────────────────────────

export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' })
    }
    if (!registration.registeredBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorised.' })
    }
    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled.' })
    }

    registration.status = 'cancelled'
    await registration.save()

    // Free up the slot
    await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } })

    res.json({ message: 'Registration cancelled.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}