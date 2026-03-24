const mongoose = require('mongoose')

const donationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    amount: { type: Number, required: true, min: 100 },
    tier: { type: String, enum: ['custom', 'Supporter', 'Champion', 'Visionary'], default: 'custom' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    message: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Donation', donationSchema)
