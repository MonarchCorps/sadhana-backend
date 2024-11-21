const User = require('../../models/User')
const mongoose = require('mongoose')

const handleBookClass = async (req, res) => {

    const { id } = req.params
    const { courseId } = req.body

    try {
        const results = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "userId",
                    as: "createdCourses"
                }
            },
            {
                $project: {
                    selectedCourses: 1,
                    isAdmin: {
                        $eq: ["$roles.Admin", parseInt(process.env.ADMIN_CODE)]
                    },
                    ownsCourse: {
                        $in: [new mongoose.Types.ObjectId(courseId), "$createdCourses._id"]
                    }
                }
            }
        ]);

        if (!results.length)
            return res.status(404).json({ message: "User not found" })

        const [user] = results

        if (user.ownsCourse)
            return res.status(400).json({ message: "Can't book your course" });

        if (user.isAdmin)
            return res.status(400).json({ message: "Admins aren't allowed to book a course" });

        const courseAlreadySelected = user.selectedCourses.some(
            (course) => course.courseId.toString() === courseId
        )

        if (courseAlreadySelected)
            return res.status(409).json({ message: "Course already selected" });

        await User.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $push: {
                    selectedCourses: { courseId: new mongoose.Types.ObjectId(courseId) },
                },
            },
            { new: true, select: "selectedCourses" }
        )

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            message: "Error selecting course",
            success: false,
            error: error.message
        })
    }

}

const handleUnBookClass = async (req, res) => {
    const { id } = req.params
    const { courseId } = req.body

    try {
        const result = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $project: {
                    _id: 1,
                    originalCourses: "$selectedCourses",
                    updatedCourses: {
                        $filter: {
                            input: "$selectedCourses",
                            as: "bookedCourse",
                            cond: { $ne: ["$$bookedCourse.courseId", courseId] } // Compare as string
                            // the $$ syntax is used for variable references
                        }
                    }
                }
            }
        ])

        const [user] = result
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const { originalCourses, updatedCourses } = user;
        if (originalCourses.length === updatedCourses.length)
            return res.status(400).json({ message: "Course not booked" });

        await User.updateOne({ _id: id }, { $set: { selectedCourses: updatedCourses } });
        res.sendStatus(200);

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error unbooking course",
            error: error.message,
        });
    }

}

module.exports = { handleBookClass, handleUnBookClass }