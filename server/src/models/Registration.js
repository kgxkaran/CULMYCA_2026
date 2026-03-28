import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
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
    teamName: {
      type: String,
      trim: true,
      default: '',
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    isTeam: {
      type: Boolean,
      default: false,
    },
    // payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'free', 'failed'],
      default: 'pending',
    },
    paymentId: { type: String, default: '' },   // Razorpay payment_id
    orderId:   { type: String, default: '' },   // Razorpay order_id
    amount:    { type: Number, default: 0 },    // in paise

    // ticket
    ticketId: {
      type: String,
      unique: true,
      sparse: true, // only enforce uniqueness when set
    },
    qrCode: { type: String, default: '' },      // base64 data URL

    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

// Compound index — one registration per user per event
registrationSchema.index({ event: 1, registeredBy: 1 }, { unique: true })

const Registration = mongoose.model('Registration', registrationSchema)
export default Registration