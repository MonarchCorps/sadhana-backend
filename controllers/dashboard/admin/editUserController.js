const User = require('../../../models/User')
const Instructor = require('../../../models/Instructor')
const Course = require('../../../models/Course')
const { UserAndInstructor, UserOnly } = require('../../../utils/rolePermission')
const mongoose = require('mongoose')

const handleEditUser = async (req, res) => {

    const { id } = req.params
    const { username, email, profileImage, gender, phoneNumber, address, roles } = req.body

    try {
        const duplicateName = await User.findOne({ username, _id: { $ne: id }, }).exec();
        if (duplicateName)
            return res.status(409).json({ message: "Username is already in use" });

        const duplicateEmail = await User.findOne({ email, _id: { $ne: id }, }).exec();
        if (duplicateEmail)
            return res.status(409).json({ message: "Email is already in use" });

        const result = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "instructors",
                    localField: "_id",
                    foreignField: "userId",
                    as: "instructorData"
                }
            },
            { $unwind: { path: "$instructorData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "enrolleds",
                    localField: "_id",
                    foreignField: "userId",
                    as: "enrolledData"
                }
            },
            {
                $addFields: {
                    enrolledData: { $arrayElemAt: ["$enrolledData", 0] } // Get the first element
                }
            },
            {
                $project: {
                    status: "$instructorData.status",
                    instructorId: "$instructorData._id",
                    instructorStatus: "$instructorData.status",
                    enrolledData: 1,
                }
            }
        ])

        const [user] = result

        if (!user)
            return res.status(404).json({ message: "User not found" })

        let updatedRoles;
        try {
            updatedRoles = typeof roles === 'string' ? JSON.parse(roles) : roles;
        } catch (err) {
            return res.status(400).json({ message: "Invalid role format" });
        }

        await User.updateOne(
            { _id: id },
            {
                $set: {
                    ...(username && { username }),
                    ...(email && { email }),
                    ...(profileImage && { profileImage }),
                    ...(gender && { gender }),
                    ...(address && { address }),
                    ...(phoneNumber && { phoneNumber }),
                    ...(roles && { roles: updatedRoles })

                }
            }
        )

        const { instructorId, instructorStatus, enrolledData } = user

        const userAndInstructor = UserAndInstructor(updatedRoles)
        const userOnly = UserOnly(updatedRoles)

        if (userAndInstructor) {
            if (instructorId && instructorStatus === 'pending') {
                await Instructor.updateOne(
                    id,
                    { $set: { status: 'approved' } }
                )
            } else if (!instructorId) {
                await Instructor.create({
                    userId: id,
                    experience: null,
                    bgImage: null,
                    status: 'approved',
                    dateApproved: new Date()
                });
            }
        }

        if (updatedRoles.Admin || userOnly) {
            if (enrolledData && enrolledData.length === 1 /** To check if the first element exists */) {
                const roleToSend = updatedRoles.Admin ? 'Admin' : 'User'
                return res.status(400).json({ message: `Can't make an ${roleToSend}, courses has been enrolled for.` })
            }
            await Instructor.findOneAndDelete({ userId: id })
            const courses = await Course.find({ userId: id }).lean().exec();;
            if (courses.length > 0) {
                // Remove selected courses from other users
                for (const course of courses) {
                    await User.updateMany(
                        { "selectedCourses.courseId": course._id },
                        { $pull: { selectedCourses: { courseId: course._id } } }
                    ).exec();
                }

                await Course.deleteMany({ userId: id }).exec();
            }
        }

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleEditUser }