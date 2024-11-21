const Course = require('../../models/Course')
const User = require('../../models/User')
const mongoose = require('mongoose')

const handleUpdateClass = async (req, res) => {

    const { id } = req.params
    const { classname, thumbnailPhoto, totalSeats, price, videoUrl, description, day, time } = req.body

    try {
        let parsedTime;
        try {
            parsedTime = typeof time === 'string' ? JSON.parse(time) : time;
        } catch (err) {
            return res.status(400).json({ message: "Invalid time format" });
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    ...(classname && { classname }),
                    ...(thumbnailPhoto && { thumbnailPhoto }),
                    ...(totalSeats && { totalSeats }),
                    ...(price && { price }),
                    ...(videoUrl && { videoUrl }),
                    ...(description && { description }),
                    ...(day && { day }),
                    ...(parsedTime && { time: parsedTime }),
                }
            },
            { new: true }
        )

        if (!updatedCourse)
            return res.status(400).json({ message: "Course not found" })

        res.sendStatus(200)
    } catch (error) {
        res.status(500).json({
            message: "Error updating class",
            success: false,
            error: error.message
        })
    }

}

const handleDeleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id).exec();
        if (!course)

            return res.status(404).json({ message: "Course not found" });

        await Promise.all([
            User.updateMany(
                { "selectedCourses.courseId": course._id },
                { $pull: { selectedCourses: { courseId: course._id } } }
            ).exec(),
            Course.deleteOne({ _id: id }).exec()
        ]);

        res.sendStatus(204);

    } catch (error) {
        res.status(500).json({
            message: "Error deleting class",
            error: error.message
        });
    }

}

module.exports = { handleUpdateClass, handleDeleteClass }