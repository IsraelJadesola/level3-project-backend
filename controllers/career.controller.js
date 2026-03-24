const JobApplication = require('../models/jobApplication.model')

const submitJobApplication = async (req, res) => {
    try {
        const { jobTitle, jobId, name, email, phone, resume } = req.body

        if (!jobTitle || !jobId || !name || !email || !phone || !resume) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address' })
        }

        if (phone.trim().length < 10) {
            return res.status(400).json({ error: 'Please provide a valid phone number' })
        }

        if (resume.trim().length < 20) {
            return res.status(400).json({ error: 'Please tell us more about yourself and your experience' })
        }

        const application = new JobApplication({
            jobTitle: jobTitle.trim(),
            jobId: parseInt(jobId),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            resume: resume.trim(),
            status: 'pending'
        })

        await application.save()

        return res.status(201).json({
            message: `Thank you for applying for ${jobTitle}! We'll review your application and contact you soon.`,
            applicationId: application._id
        })
    } catch (err) {
        console.error('submitJobApplication error', err)
        return res.status(500).json({ error: 'Server error while processing application' })
    }
}

const getAllApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find().sort({ createdAt: -1 })
        return res.status(200).json(applications)
    } catch (err) {
        console.error('getAllApplications error', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const applications = await JobApplication.find({ jobId: parseInt(jobId) }).sort({ createdAt: -1 })
        return res.status(200).json(applications)
    } catch (err) {
        console.error('getApplicationsByJob error', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params
        const { status } = req.body

        if (!['pending', 'reviewing', 'interviewed', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' })
        }

        const application = await JobApplication.findByIdAndUpdate(
            applicationId,
            { status, updatedAt: Date.now() },
            { new: true }
        )

        if (!application) {
            return res.status(404).json({ error: 'Application not found' })
        }

        return res.status(200).json({ message: 'Application status updated', application })
    } catch (err) {
        console.error('updateApplicationStatus error', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

module.exports = { submitJobApplication, getAllApplications, getApplicationsByJob, updateApplicationStatus }
