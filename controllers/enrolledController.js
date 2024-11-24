const Enrolled = require('../models/Enrolled');

const handleGetEnrolled = async (req, res) => {
    const { userId } = req.params

    if (!userId)
        return res.status(500).json({ message: "ID not found!" });

    try {
        const enrolledCourses = await Enrolled.find({ userId }).lean().exec()
        if (!enrolledCourses)
            return res.status(204).json({ message: "No course found" })

        res.status(200).json(enrolledCourses)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching list of enrolled course",
            error: error.message
        })
    }

}

module.exports = { handleGetEnrolled }