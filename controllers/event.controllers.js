const Event = require('../models/event.model')

const createEvent = async (req, res) => {
    try {
        const { title, description, date, location } = req.body
        const createdBy = (req.admin && req.admin.id) || req.body.createdBy
        const ev = new Event({ title, description, date, location, createdBy })
        const saved = await ev.save()

        return res.status(201).json({ success: true, event: saved })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const getEvents = async (req, res) => {
    try {
        // If admin authenticated, only return that admin's events
        const adminId = req.admin && req.admin.id
        const filter = adminId ? { createdBy: adminId } : (req.query.adminId ? { createdBy: req.query.adminId } : {})
        const events = await Event.find(filter).sort({ date: 1 })
        return res.status(200).json({ success: true, events })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const getEventById = async (req, res) => {
    try {
        const { id } = req.params
        const event = await Event.findById(id).lean()
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        event.attendees = event.attendees || []
        return res.status(200).json({ success: true, event })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body
        const event = await Event.findByIdAndUpdate(id, updates, { new: true })
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        return res.status(200).json({ success: true, event })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params
        const event = await Event.findByIdAndDelete(id)
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        return res.status(200).json({ success: true, message: 'Event deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const bookEvent = async (req, res) => {
    try {
        const { id } = req.params
        const user = req.user
        if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })
        const event = await Event.findById(id)
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

        const already = event.attendees.some(a => a.userId && a.userId.toString() === user.id)
        if (already) return res.status(400).json({ success: false, message: 'Already booked' })

        event.attendees.push({ userId: user.id, email: user.email, name: user.name || '' })
        await event.save()
        return res.status(200).json({ success: true, event })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params
        const user = req.user
        if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })
        const event = await Event.findById(id)
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

        const before = event.attendees.length
        event.attendees = event.attendees.filter(a => !(a.userId && a.userId.toString() === user.id))
        if (event.attendees.length === before) return res.status(400).json({ success: false, message: 'Booking not found' })
        await event.save()
        return res.status(200).json({ success: true, event })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const getPublicEvents = async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 })
        return res.status(200).json({ success: true, events })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const markComplete = async (req, res) => {
    try {
        const { id } = req.params
        const event = await Event.findByIdAndUpdate(id, { status: 'completed' }, { new: true })
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })
        return res.status(200).json({ success: true, event })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

const toggleInterest = async (req, res) => {
    try {
        const { id } = req.params
        const user = req.user
        if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })
        const event = await Event.findById(id)
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' })

        const idx = event.interested.findIndex(a => a.userId && a.userId.toString() === user.id)
        if (idx >= 0) {
            event.interested.splice(idx, 1)
        } else {
            event.interested.push({ userId: user.id, email: user.email, name: user.name || '' })
        }
        await event.save()
        return res.status(200).json({ success: true, event })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    bookEvent,
    cancelBooking,
    getPublicEvents,
    markComplete,
    toggleInterest,
}
