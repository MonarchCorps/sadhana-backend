const Instructor = require('../../../models/Instructor');

const handleEditInstructorProfile = async (req, res) => {
    const { id } = req.params;
    const { experience, bgImage } = req.body;

    try {
        const updatedInstructor = await Instructor.findOneAndUpdate(
            { userId: id },
            { $set: { ...(experience && { experience }), ...(bgImage && { bgImage }) } },
            { new: true }
        );

        if (!updatedInstructor)
            return res.status(404).json({ message: "Instructor not found" });

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            message: "Error updating instructor field",
            success: false,
            error: error.message
        });
    }
};

module.exports = { handleEditInstructorProfile };
