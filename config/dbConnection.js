const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://monarch-corps:David123leon@cluster0.ccvmk.mongodb.net/YogaMasterDB?retryWrites=true&w=majority&appName=Cluster0", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB;