const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const handleNewUser = async (req, res) => {
    const { username, password, email, phoneNumber, gender, profileImage } = req.body;

    try {

        if (!username || !password || !email || !phoneNumber || !gender || !profileImage)
            return res.status(400).json({ message: "All input fields are required" });

        // checking for duplicate users in db
        const duplicateUser = await User.findOne({ username: username }).exec();
        if (duplicateUser) return res.status(409).json({ message: "Username is already taken" });

        const duplicateEmail = await User.findOne({ email: email }).exec();
        if (duplicateEmail) return res.status(409).json({ message: "Email is already registered" });

        // encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create and store new User
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
            email: email,
            phoneNumber: phoneNumber,
            gender: gender,
            profileImage: profileImage
        });

        const roles = Object.values(newUser.roles).filter(Boolean);

        // create jwt's
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: newUser.username,
                    roles: roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            {
                username: newUser.username
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )
        // Saving refreshToken with current user
        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Send the refreshToken as a cookie and accessToken in the response

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true, // Use secure true in production
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = {
            accessToken,
            roles,
            dateRegistered: newUser.dateRegistered,
            gender: newUser.gender,
            username: newUser.username,
            phoneNumber: newUser.phoneNumber,
            address: newUser.address,
            email: newUser.email,
            _id: newUser._id,
            profileImage: newUser.profileImage,
            selectedCourses: newUser.selectedCourses
        }

        res.status(201).json(userResponse);

    } catch (error) {
        res.status(500).json({
            message: "Registration Failed",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleNewUser };