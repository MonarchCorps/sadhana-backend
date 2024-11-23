const CustomPhoto = require('../models/CustomPhoto');
const imagekit = require('../config/ikConfig')

const handleUploadCustomPhoto = async (req, res) => {
    const customPhotos = req.body;

    if (!Array.isArray(customPhotos) || customPhotos.length === 0) {
        return res.status(400).json({
            message: "Photo(s) are required"
        });
    }

    if (customPhotos.some(photo => !photo.customPhoto)) {
        return res.status(400).json({
            message: "Each photo object must have a customPhoto field"
        });
    }

    try {
        await CustomPhoto.insertMany(customPhotos);
        res.sendStatus(201);
    } catch (error) {
        res.status(500).json({
            message: "Error uploading photo",
            error: error.message
        });
    }
};


const handleGetCustomPhotos = async (req, res) => {
    const { limit } = req.params
    try {
        const customPhotos = await CustomPhoto.find().limit(parseInt(limit)).exec();
        const count = await CustomPhoto.countDocuments()

        res.status(200).json({
            photos: customPhotos,
            count
        })
    } catch (error) {
        res.status(500).json({
            message: "Error getting photos",
            success: false,
            error: error.message
        })
    }
}

const handleGetSingleCustomPhoto = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: "Photo ID field is required" });

    try {
        const singlePhoto = await CustomPhoto.findById(id).exec();
        if (!singlePhoto) return res.status(204).json({ message: "Photo not found" });

        res.status(200).json(singlePhoto)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching image",
            success: false,
            error: error
        })
    }

}

const handleDeleteCustomPhoto = async (req, res) => {
    const { photoId: id } = req.body;

    try {
        if (!id) return res.status(400).json({ message: "Select a photo to delete, id not found!" });

        const photo = await CustomPhoto.findById(id);
        if (!photo) return res.status(400).json({ message: "Photo has been deleted" });

        const fileId = photo.customPhoto.split("/")[4].split("?")[0]; // get's the fileId after https://ik.imagekit.io/${process.env.IMAGEKIT_ENDPOINT}/
        await imagekit.deleteFile(fileId);

        await CustomPhoto.deleteOne({ _id: photo._id })

        res.sendStatus(204)

    } catch (error) {
        res.status(500).json({
            message: "Error deleting photos",
            error: error.message
        })
    }
}

module.exports = { handleUploadCustomPhoto, handleGetCustomPhotos, handleGetSingleCustomPhoto, handleDeleteCustomPhoto }