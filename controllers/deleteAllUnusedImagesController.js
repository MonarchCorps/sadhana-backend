
const User = require('../models/User')
const Instructor = require('../models/Instructor')
const CustomPhoto = require('../models/CustomPhoto')
const Course = require('../models/Course')
const Enrolled = require('../models/Enrolled')
const BotChat = require('../models/BotChat')

const imagekit = require('../config/ikConfig')

const schemas = [
    { model: User, field: "profileImage" },
    { model: Instructor, field: "bgImage" },
    { model: Course, field: "thumbnailPhoto" },
    { model: CustomPhoto, field: "customPhoto" },
    { model: Enrolled, field: "courseDetails", nestedField: "thumbnailPhoto" },
    { model: BotChat, field: "history", nestedField: "img" },
];

// Function to fetch all image URLs from MongoDB
const getAllImageUrlsFromDB = async () => {
    let imageUrls = [];

    for (const { model, field, nestedField } of schemas) {
        const records = await model.find({}, { [field]: 1 }); // Fetch only the relevant field

        for (const record of records) {
            if (Array.isArray(record[field])) {
                // Process the `history` array
                for (const item of record[field]) {
                    if (item[nestedField]) {
                        imageUrls.push(item[nestedField]); // Add `img` URLs
                    }
                }
            }
        }
    }

    return imageUrls;
}

// Function to fetch all files from ImageKit
const fetchAllFilesFromImageKit = async () => {
    const allFiles = [];
    let skip = 0;
    const limit = 100; // Maximum limit per API call

    while (true) {
        const files = await imagekit.listFiles({
            skip,
            limit,
        });

        allFiles.push(...files);

        // Stop fetching if fewer files are returned than the limit
        if (files.length < limit) break;

        skip += limit;
    }

    return allFiles;
}

// Function to find unused images
const findUnusedImages = (dbImageUrls, imageKitFiles) => {
    const dbImageSet = new Set(dbImageUrls);
    return imageKitFiles.filter((file) => !dbImageSet.has(file.url)); // Check if the file URL is not in MongoDB
}

// Function to delete unused images from ImageKit
const deleteUnusedImages = async (unusedFiles) => {
    for (const file of unusedFiles) {
        await imagekit.deleteFile(file.fileId);
        console.log(`Deleted: ${file.name}`);
    }
}

// Main function to sync and delete unused images
const syncAndDeleteUnusedImages = async () => {
    try {
        console.log("Fetching image URLs from MongoDB...");
        const dbImageUrls = await getAllImageUrlsFromDB();

        console.log("Fetching files from ImageKit...");
        const imageKitFiles = await fetchAllFilesFromImageKit();

        console.log("Comparing images...");
        const unusedImages = findUnusedImages(dbImageUrls, imageKitFiles);

        console.log(`Found ${unusedImages.length} unused images.`);
        if (unusedImages.length > 0) {
            console.log("Deleting unused images...");
            await deleteUnusedImages(unusedImages);
            console.log("Unused images deleted successfully.");
        } else {
            console.log("No unused images found.");
        }
    } catch (error) {
        console.error("Error during sync and delete:", error);
    } finally {
        mongoose.connection.close(); // Close the database connection
    }
}

module.exports = { syncAndDeleteUnusedImages }