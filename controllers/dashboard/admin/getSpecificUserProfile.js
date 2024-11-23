const User = require('../../../models/User')
const Course = require('../../../models/Course')
const mongoose = require('mongoose')

const handleGetSpecificUserProfile = async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "Id is required" })

    try {
        const result = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "instructors",
                    localField: "_id",
                    foreignField: "userId",
                    as: "instructor"
                }
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "userId",
                    as: "uploadedCourse"
                }
            },
            {
                $project: {
                    _id: 1, username: 1, email: 1,
                    profileImage: 1, roles: 1, phoneNumber: 1,
                    gender: 1, address: 1, selectedCourses: 1,
                    lastActive: 1, dateRegistered: 1,
                    instructor: {
                        experience: "$instructor.experience", bgImage: "$instructor.bgImage",
                        status: "$instructor.status",
                    },
                    uploadedCourse: 1,
                }
            }
        ])

        const [user] = result
        if (!user)
            return res.status(404).json({ message: "User not found" })

        const selectedCourseIds = user.selectedCourses.map(course => course.courseId)
        const modifiedSelectedCourses = await Course.find({ _id: { $in: selectedCourseIds } }).lean().exec()

        const responseToSend = {
            ...user,
            selectedCourses: modifiedSelectedCourses
        }

        res.status(200).json(responseToSend)
    } catch (error) {
        res.status(500).json({
            message: "Error getting user profile",
            error: error.message
        })
    }

}

module.exports = { handleGetSpecificUserProfile }