import express from 'express'
import {
  initiateRegistration,
  confirmFreeRegistration,
  getMyRegistrations,
  getRegistrationById,
  getRegistrationsByEvent,
  cancelRegistration,
} from '../controllers/registration.controller.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// All registration routes require auth
router.use(protect)

router.post('/initiate', initiateRegistration)
router.post('/confirm-free', confirmFreeRegistration)
router.get('/my', getMyRegistrations)
router.get('/event/:eventId', adminOnly, getRegistrationsByEvent)
router.get('/:id', getRegistrationById)
router.delete('/:id', cancelRegistration)

export default router