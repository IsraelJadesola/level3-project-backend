const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date },
    location: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    attendees: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            email: { type: String },
            name: { type: String },
            bookedAt: { type: Date, default: Date.now }
        }
    ],
    interested: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            email: { type: String },
            name: { type: String },
            addedAt: { type: Date, default: Date.now }
        }
    ],
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Event', eventSchema)
