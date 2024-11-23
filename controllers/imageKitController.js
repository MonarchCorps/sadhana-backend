const imagekit = require('../config/ikConfig')

const handleUpload = async (req, res) => {
    try {
        const { count } = req.query; // Expect the number of files to upload
        if (count) {
            const fileCount = parseInt(count, 10) || 1;

            const tokens = [];
            for (let i = 0; i < fileCount; i++) {
                const result = imagekit.getAuthenticationParameters(); // Generate a unique token
                tokens.push(result);
            }

            return res.json(tokens);
        } else {
            const result = imagekit.getAuthenticationParameters();
            return res.json(result);
        }
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error
        });
    }
};

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

module.exports = { handleUpload }