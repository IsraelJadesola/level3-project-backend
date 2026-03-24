const express = require('express')
const router = express.Router()

const { postAdminSignup, postAdminSignin, verifyAdminToken } = require('../controllers/admin.controllers')
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} = require('../controllers/event.controllers')

router.post("/signup", postAdminSignup)
router.post("/signin", postAdminSignin)

router.get('/events', verifyAdminToken, getEvents)
router.post('/events', verifyAdminToken, createEvent)
router.get('/events/:id', verifyAdminToken, getEventById)
router.put('/events/:id', verifyAdminToken, updateEvent)
router.delete('/events/:id', verifyAdminToken, deleteEvent)

router.put('/events/:id/complete', (req, res, next) => {
    const { markComplete } = require('../controllers/event.controllers')
    return markComplete(req, res, next)
})

module.exports = router