const User = require('../models/User')

const handleLastActive = async (req, res) => {
    const { id } = req.body
    try {
        await User.findByIdAndUpdate(id, {
            lastActive: new Date()
        });
        res.sendStatus(200)
    } catch (error) {
        res.status(500).json({
            message: "Error updating user status",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleLastActive }