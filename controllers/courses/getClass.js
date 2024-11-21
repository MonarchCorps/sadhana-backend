const mongoose = require('mongoose')
const Course = require('../../models/Course')
const User = require('../../models/User')

const handleMyClass = async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById({ _id: userId });
    if (!user)
        return res.status(404).json({ message: "User not found" });

    try {

        const courses = await Course.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            { $unwind: '$courseDetails' },
            {
                $project: {
                    _id: 1, classname: 1, thumbnailPhoto: 1,
                    totalSeats: 1, price: 1, videoUrl: 1,
                    description: 1, day: 1, time: 1,
                    status: 1, username: '$courseDetails.username'
                }
            }
        ])

        if (!courses.length)
            return res.status(204).json({ message: "No courses found" });

        res.status(200).json(courses);

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error fetching classes",
            success: false,
            error: error.message
        })
    }

}

const handleGetAllClass = async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $lookup: {
                    from: "instructors",
                    localField: "userId",
                    foreignField: "userId",
                    as: "instructorDetails"
                }
            },
            {
                $project: {
                    id: 1, userId: 1, username: '$userDetails.username', email: "$userDetails.email",
                    experience: {
                        $arrayElemAt: ["$instructorDetails.experience", 0]
                    },
                    profileImage: '$userDetails.profileImage', dateApplied: 1, dateApproved: 1,
                    thumbnailPhoto: 1, classname: 1,
                    totalSeats: 1, price: 1, videoUrl: 1,
                    description: 1, day: 1, time: 1, status: 1,
                }
            }
        ]);
        if (!courses.length > 0)
            return res.status(204).json({ message: "No course found" })

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving courses",
            success: false,
            error: error.message
        });
    }
}

module.exports = { handleMyClass, handleGetAllClass }