const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    roles: {
        User: {
            type: Number,
            default: parseInt(process.env.USER_CODE)
        },
        Instructor: {
            type: Number,
            default: null
        },
        Admin: {
            type: Number,
            default: null
        }
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false,
        default: ''
    },
    selectedCourses: [
        {
            courseId: {
                type: String,
            }
        },
        {
            dateApplied: {
                type: Date,
                default: Date.now
            }
        }
    ],
    lastActive: {
        type: Date,
        default: Date.now
    },
    dateRegistered: {
        type: Date,
        default: Date.now
    },
    refreshToken: String
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);