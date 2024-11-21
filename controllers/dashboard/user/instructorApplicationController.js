const Instructor = require('../../../models/Instructor')
const User = require('../../../models/User')

const handleInstructorApplication = async (req, res) => {

    const { experience, bgImage } = req.body;
    const { userId } = req.params

    if (!experience || !bgImage)
        return res.status(400).json({ message: "All inputs fields are required" });

    try {
        const user = await User.findById({ _id: userId }).exec();
        if (!user)
            return res.status(204).json({ message: "User not found" });

        const duplicateInstructor = await Instructor.findOne({ userId }).exec();
        if (duplicateInstructor)
            return res.status(409).json({ message: "User has already applied" })

        await Instructor.create({
            userId,
            experience,
            bgImage,
            status: 'pending'
        });

        res.sendStatus(201)

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error handling submitting application",
            error: error.message
        })
    }

}

module.exports = { handleInstructorApplication }