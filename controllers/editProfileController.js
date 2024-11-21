const User = require('../models/User')

const handleEditProfile = async (req, res) => {
    const { id } = req.params;
    const { username, profileImage, email, gender, phoneNumber, address } = req.body;

    try {
        if (username) {
            const duplicateName = await User.findOne({ username, _id: { $ne: id } });
            if (duplicateName)
                return res.status(409).json({ message: "Username is already in use" });
        }

        if (email) {
            const duplicateEmail = await User.findOne({ email, _id: { $ne: id } });
            if (duplicateEmail)
                return res.status(409).json({ message: "Email is already in use" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(username && { username }),
                    ...(profileImage && { profileImage }),
                    ...(email && { email }),
                    ...(gender && { gender }),
                    ...(phoneNumber && { phoneNumber }),
                    ...(address && { address }),
                },
            },
            { new: true }
        );

        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            message: "Error updating profile",
            success: false,
            error: error.message,
        });
    }
};

module.exports = { handleEditProfile };