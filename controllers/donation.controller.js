const Donation = require('../models/donation.model')

const postDonation = async (req, res) => {
    try {
        const { name, email, amount, tier, message } = req.body

        if (!name || !email || !amount) {
            return res.status(400).json({ error: 'Name, email and amount are required' })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address' })
        }

        if (typeof amount !== 'number' || amount < 100) {
            return res.status(400).json({ error: 'Donation amount must be at least 100' })
        }

        const donation = new Donation({
            name: name.trim(),
            email: email.trim(),
            amount,
            tier: tier || 'custom',
            message: message ? message.trim() : '',
            paymentStatus: 'pending'
        })

        await donation.save()

        // In future: we will integrate with Stripe/PayPal to process payment
        // For now, we just save and return pending status
        return res.status(201).json({
            message: 'Thank you for your donation! Processing your payment...',
            donationId: donation._id
        })
    } catch (err) {
        console.error('postDonation error', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

// Get donation statistics (admin only in future)
const getDonationStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments()
        const totalAmount = await Donation.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])

        const completedAmount = await Donation.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])

        return res.status(200).json({
            totalDonations,
            totalAmount: totalAmount[0]?.total || 0,
            completedAmount: completedAmount[0]?.total || 0
        })
    } catch (err) {
        console.error('getDonationStats error', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

module.exports = { postDonation, getDonationStats }
