const mongoose = require('mongoose')

const jobApplicationSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true, trim: true },
    jobId: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    resume: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'reviewing', 'interviewed', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('JobApplication', jobApplicationSchema)
