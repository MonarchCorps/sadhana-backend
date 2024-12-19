const User = require("../models/User")
const mongoose = require('mongoose')

const handleCloseModal = async (req, res) => {
    const { value, id } = req.body
    try {
        const user = await User.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $set: { closeModal: value }
            },
            { new: true }
        )

        if (!user)
            return res.status(404).json({ message: "User not found" })

        res.sendStatus(200)

    } catch (error) {
        res.status(500).json({
            message: "Error closing modal",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleCloseModal }