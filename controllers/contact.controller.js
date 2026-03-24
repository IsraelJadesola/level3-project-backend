const Contact = require('../models/contact.model')

const postContact = async (req, res) => {
    try {
        const { name, email, message } = req.body

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required' })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address' })
        }

        if (message.trim().length < 5) {
            return res.status(400).json({ error: 'Message is too short' })
        }

        const contact = new Contact({ name: name.trim(), email: email.trim(), message: message.trim() })
        await contact.save()

        // For now we just save to DB; in future we can send emails or notifications
        return res.status(201).json({ message: 'Thank you — your message has been received' })
    } catch (err) {
        console.error('postContact error', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

module.exports = { postContact }
