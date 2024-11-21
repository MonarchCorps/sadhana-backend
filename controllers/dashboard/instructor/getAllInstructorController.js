const Instructor = require('../../../models/Instructor')

const getAllInstructor = async (req, res) => {
    try {
        const instructors = await Instructor.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: "$user" },
            {
                $match: {
                    $or: [
                        { 'user.roles.Admin': { $exists: false } },
                        { 'user.roles.Admin': null },
                        { $expr: { $ne: ['$user.roles.Admin', parseInt(process.env.ADMIN_CODE)] } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'courses',
                },
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    username: '$user.username',
                    email: '$user.email',
                    courseCount: { $size: '$courses' },
                    roles: '$user.roles',
                    createdAt: 1,
                    updatedAt: 1,
                    profileImage: '$user.profileImage',
                    address: '$user.address',
                    phoneNumber: '$user.phoneNumber',
                },
            },
        ]);

        if (!instructors || instructors.length === 0) {
            return res.status(204).json({ message: 'No instructors found' });
        }

        res.json(instructors);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching list of instructors",
            success: false,
            error: error.message
        });
    }

}

module.exports = { getAllInstructor }