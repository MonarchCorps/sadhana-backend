const Payment = require('../../models/Payment')

const handleFetchEarnings = async (req, res) => {
    const { id } = req.params
    if (!id)
        return res.status(400).json({ message: "User ID field is required" })

    try {

        const earnings = await Payment.find({ instructorId: id }).lean().exec()

        if (!earnings)
            return res.status(204).json({ message: "No payments found" })

        res.status(200).json(earnings)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching payments",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleFetchEarnings }