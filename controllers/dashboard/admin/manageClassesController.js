const User = require('../../../models/User')
const Course = require('../../../models/Course')

const handleEmail = require('../../emailController')
const mongoose = require('mongoose')

const handleClassesApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const result = await Course.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "usersData"
                }
            },
            { $unwind: "$usersData" },
            {
                $project: {
                    email: "$usersData.email",
                    username: "$usersData.username",
                    classname: 1,
                }
            }
        ])

        const [course] = result
        if (!course)
            return res.status(400).json({ message: "Course not found" })

        const { username, email, classname } = course

        const updates = {};
        const emailToSend = {}

        if (action === 'approve') {
            updates['status'] = 'approved';
            updates['dateApproved'] = new Date();

            emailToSend.subject = `Your course has been approved ${id}`;
            emailToSend.title = `Hello ${username}`;
            emailToSend.description = `Your uploaded course <strong>${classname}</strong> has been approved successfully! Get ready to start making money`;
            emailToSend.userEmail = email;

            handleEmail(emailToSend);

        } else if (action === 'denied') {
            updates['status'] = 'denied';
        }

        await Course.updateOne(
            { _id: id },
            { $set: updates }
        )

        res.status(200).json({
            message: `Application ${action === 'approve' ? 'approved' : 'denied'} successfully`
        })

    } catch (error) {
        res.status(500).json({
            message: "Error updating application",
            success: false,
            error: error.message
        })
    }

}

const handlePendingClass = async (req, res) => {

    try {
        const courses = await Course.aggregate([
            { $match: { status: { $in: ['pending', 'denied'] } } },
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
                    id: 1, userId: 1, username: '$userDetails.username',
                    experience: {
                        $arrayElemAt: ["$instructorDetails.experience", 0]
                    },
                    profileImage: '$userDetails.profileImage', dateApplied: 1,
                    dateApproved: 1, __v: 1, thumbnailPhoto: 1,
                    classname: 1, totalSeats: 1, price: 1,
                    videoUrl: 1, description: 1,
                    day: 1, time: 1, status: 1,
                }
            }
        ])
        if (!courses.length > 0)
            return res.status(204).json({ message: "No pending course found" })

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching classes",
            error: error.message
        })
    }
}

const handleDeleteClass = async (req, res) => {

    const { coursesId } = req.body;
    if (!coursesId)
        return res.status(400).json({ message: "Id field is required" });

    try {

        await User.updateMany(
            { "selectedCourses.courseId": { $in: coursesId } },
            { $pull: { selectedCourses: { courseId: { $in: coursesId } } } }
        )

        await Course.deleteMany({ _id: { $in: coursesId } });
        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error deleting course",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleClassesApproval, handlePendingClass, handleDeleteClass }