const Course = require('../../models/Course')

const handleAddNewClass = async (req, res) => {
    const { userId } = req.params
    const { classname, totalSeats, price, videoUrl, description, day, time: timeString, thumbnailPhoto } = req.body

    let time;
    try {
        time = typeof timeString === 'string' ? JSON.parse(timeString) : timeString;
    } catch (err) {
        return res.status(400).json({ message: "Invalid time format" });
    }

    if (!classname || !thumbnailPhoto || !totalSeats || !price || !videoUrl || !description || !day || !time?.startTime || !time?.endTime)
        return res.status(400).json({ message: "All input fields are required" })

    try {
        await Course.create({
            userId: userId,
            classname: classname,
            thumbnailPhoto,
            totalSeats: parseInt(totalSeats),
            price: parseInt(price),
            videoUrl: videoUrl,
            description: description,
            day: day,
            time: {
                startTime: time.startTime,
                endTime: time.endTime
            }
        });

        res.sendStatus(201);

    } catch (error) {
        res.status(500).json({
            message: "Error creating new class",
            success: false,
            error: error.message
        });
    }

}

module.exports = { handleAddNewClass }