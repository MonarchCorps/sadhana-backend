const User = require('../models/User')

const handleGetAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean().exec();
        if (!users) return res.status(204).json({ message: "No users found" });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching lists of users",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleGetAllUsers }