const ImageKit = require('imagekit')

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
});

const handleUpload = async (req, res) => {
    try {
        const result = imagekit.getAuthenticationParameters();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            success: false,
            error: error
        })
    }
}

const handleFetchAllImageAndDelete = async () => {
    try {
        const files = await imagekit.listFiles({})
        if (files.length === 0) return console.log('No files found')
        files.forEach(file => console.log(file.filePath))
        for (const file of files) {
            await imagekit.deleteFile(file.fileId);
            console.log('DELETED')
        }
        console.log('All deleted')
    } catch (error) {
        console.log("Error fetching and deleting image")

    }
}

const handleDeleteFilesByPaths = async (inputPaths) => {
    try {
        const filePaths = Array.isArray(inputPaths) ? inputPaths : [inputPaths];
        console.log(filePaths)
        const deletionPromises = filePaths.map(async (filePath) => {
            const files = await imagekit.listFiles({ path: filePath });
            console.log(files)
            if (files.length === 0) {
                return console.log(`No file found at path: ${filePath}`);
            }

            const fileId = files[0].fileId;

            return imagekit.deleteFile(fileId);
        });

        const results = await Promise.all(deletionPromises);
        console.log(results)
    } catch (error) {
        console.error('Error during file deletions:', error);
    }
};

module.exports = { handleUpload, handleDeleteFilesByPaths }