const express = require('express')
const router = express.Router()
const { postSignup, postSignin, verifyToken, getDashboard } = require('../controllers/user.controllers')
const { postContact } = require('../controllers/contact.controller')
const { postDonation, getDonationStats } = require('../controllers/donation.controller')
const { submitJobApplication, getAllApplications, getApplicationsByJob, updateApplicationStatus } = require('../controllers/career.controller')
const { getPublicEvents, bookEvent, cancelBooking, toggleInterest } = require('../controllers/event.controllers')

router.post("/signup", postSignup)
router.post("/signin", postSignin)
router.post('/contact', postContact)
router.post('/donate', postDonation)
router.get('/donation-stats', getDonationStats)
router.post('/apply-job', submitJobApplication)
router.get('/job-applications', getAllApplications)
router.get('/job-applications/:jobId', getApplicationsByJob)
router.patch('/job-applications/:applicationId/status', updateApplicationStatus)
router.get("/dashboard", verifyToken, getDashboard)

// Public events listing
router.get('/events', getPublicEvents)

// Booking endpoints (require auth)
router.post('/events/:id/book', verifyToken, bookEvent)
router.post('/events/:id/cancel', verifyToken, cancelBooking)
// Interest toggle
router.post('/events/:id/interest', verifyToken, toggleInterest)

module.exports = router