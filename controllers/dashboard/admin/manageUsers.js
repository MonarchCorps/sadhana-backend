const User = require('../../../models/User')
const Instructor = require('../../../models/Instructor')
const Course = require('../../../models/Course')

const handleEmail = require('../../emailController')
const mongoose = require('mongoose')

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

const handlePendingInstructor = async (req, res) => {
    try {
        const applications = await Instructor.aggregate([
            { $match: { status: { $in: ['pending', 'denied'] } } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    _id: 1, userId: 1, username: "$userDetails.username",
                    email: "$userDetails.email", profileImage: "$userDetails.profileImage",
                    experience: 1, status: 1, bgImage: 1,
                    account: 1, dateApplied: 1, dateApproved: 1,
                }
            }
        ])

        if (!applications.length > 0)
            return res.status(204).json({ message: "No pending applications" })

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching applications",
            error: error.message
        })
    }
}

const handleInstructorApproval = async (req, res) => {

    const { id } = req.params;
    const { action } = req.body;

    if (!id || !action)
        return res.status(400).json({ message: "All field are required" })

    try {

        const application = await Instructor.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            { $unwind: "$userData" },
            {
                $project: {
                    instructorId: '$_id',
                    userId: 1,
                    username: "$userData.username",
                    email: "$userData.email",
                    roles: '$userData.roles',
                    status: 1
                }
            }
        ])

        const [user] = application
        if (!user)
            return res.status(404).json({ message: "Application not found" })

        const { userId, username, email } = user;

        const updates = {};
        const emailToSend = {};

        if (action === 'approve') {
            updates['status'] = 'approved';
            updates['dateApproved'] = new Date();
            updates['roles.Instructor'] = parseInt(process.env.INSTRUCTOR_CODE);

            emailToSend.subject = 'You’re Approved! Complete Your Instructor Setup';
            emailToSend.title = `Hello ${username}`;
            emailToSend.description = 'You’ve been approved as an instructor! Please complete your setup by visiting';
            emailToSend.redirectUrl = `${process.env.FRONTEND_URL}/instructor/add-bank-info`;
            emailToSend.userEmail = email;

            handleEmail(emailToSend);

        } else if (action === 'denied') {
            updates['status'] = 'denied';
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await Instructor.updateOne({ _id: id }, { $set: updates }, { session });
            if (action === 'approve') {
                await User.updateOne(
                    { _id: userId },
                    { $set: { 'roles.Instructor': parseInt(process.env.INSTRUCTOR_CODE) } },
                    { session }
                );
            }

            await session.commitTransaction();
            session.endSession();
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }

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


const handleDeleteUser = async (req, res) => {

    const { usersId } = req.body;
    const { id: currentUserId } = req.params;

    try {

        if (usersId.includes(currentUserId))
            return res.status(400).json({ message: "You cannot delete yourself" })

        if (usersId.length <= 0)
            return res.status(400).json({ message: "Select a user to delete, id not found!" });

        const instructorsToDelete = await Instructor.find({ userId: { $in: usersId } }).select("_id").lean().exec()
        const coursesToDelete = await Course.find({ userId: { $in: usersId } }).select("_id").lean().exec()

        const courseIds = coursesToDelete.map((course) => course._id)
        const instructorsId = instructorsToDelete.map(inst => inst._id)

        await Promise.all([
            Instructor.deleteMany({ _id: { $in: instructorsId } }),

            User.updateMany(
                { "selectedCourses.courseId": { $in: courseIds } },
                { $pull: { selectedCourses: { courseId: { $in: courseIds } } } }
            ),

            Course.deleteMany({ _id: { $in: courseIds } }),

            User.deleteMany({ _id: { $in: usersId } }),

        ])

        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error deleting user and related courses",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleGetAllUsers, handlePendingInstructor, handleDeleteUser, handleInstructorApproval }