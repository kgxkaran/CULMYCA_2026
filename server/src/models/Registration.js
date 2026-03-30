import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  phone:       { type: String, required: true, trim: true },
  collegeName: { type: String, required: true, trim: true },
})

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // team fields
    teamName: { type: String, trim: true, default: '' },
    members:  { type: [memberSchema], default: [] },
    isTeam:   { type: Boolean, default: false },

    // ticket
    ticketId: { type: String, unique: true, sparse: true },
    qrCode:   { type: String, default: '' }, // base64 data URL

    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed', // all registrations confirm immediately
    },
  },
  { timestamps: true }
)

// One registration per user per event
registrationSchema.index({ event: 1, registeredBy: 1 }, { unique: true })

const Registration = mongoose.model('Registration', registrationSchema)
export default Registration