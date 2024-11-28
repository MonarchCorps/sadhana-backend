const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUserData = async (usernameOrToken) => {
    const matchCondition = usernameOrToken.username ? { username: usernameOrToken.username } : { refreshToken: usernameOrToken };

    const result = await User.aggregate([
        { $match: matchCondition },
        {
            $lookup: {
                from: "instructors",
                localField: "_id",
                foreignField: "userId",
                as: "instructorData"
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "userId",
                as: "courses"
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                password: 1,
                roles: 1,
                dateRegistered: 1,
                gender: 1,
                phoneNumber: 1,
                address: 1,
                profileImage: 1,
                email: 1,
                selectedCourses: 1,
                instructorData: {
                    $arrayElemAt: ["$instructorData", 0]
                },
                courseCount: { $size: '$courses' },
            }
        }
    ])
    return result[0]
}

const generateAccessTokenAndResponse = (user) => {
    const roles = Object.values(user.roles).filter(Boolean);
    const accessToken = jwt.sign(
        {
            UserInfo: {
                username: user.username,
                roles: roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    const userResponse = {
        accessToken,
        username: user.username,
        roles,
        dateRegistered: user.dateRegistered,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        email: user.email,
        _id: user._id,
        selectedCourses: user.selectedCourses,
        courseCount: user.courseCount
    }

    if (user.instructorData) {
        userResponse.instructor = {
            experience: user.instructorData.experience,
            bgImage: user.instructorData.bgImage,
            account: user.instructorData.account
        }
    }

    return userResponse;
}

const handleLogin = async (req, res) => {
    const { password, username } = req.body

    try {
        if (!password || !username)
            return res.status(400).json({ message: "All input fields are required" });

        const user = await getUserData({ username });

        if (!user)
            return res.status(400).json({ message: "Incorrect username or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: "Incorrect username or password" });

        const refreshToken = jwt.sign(
            { username: user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        const userResponse = generateAccessTokenAndResponse(user);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

        res.status(200).json(userResponse)

    } catch (error) {

        res.status(500).json({
            message: "An error occurred during login",
            success: false,
            error: error.message
        })
    }
}

const handleRefreshToken = async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    try {
        const refreshToken = cookies.jwt;
        const user = await getUserData(refreshToken);

        if (!user)
            return res.sendStatus(400)

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        if (user.username !== decoded.username)
            return res.sendStatus(403);

        const userResponse = generateAccessTokenAndResponse(user);

        res.status(200).json(userResponse)
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            success: false,
            error: error.message
        })
    }

}

const handleLogout = async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    try {
        const refreshToken = cookies.jwt;

        const result = await User.aggregate([
            { $match: { refreshToken } },
            {
                $project: {
                    refreshToken: 1,
                }
            }
        ])

        const [user] = result
        if (!user) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
            return res.sendStatus(204);
        }

        await User.updateOne({ _id: user._id }, { $set: { refreshToken: '' } })

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true }); // secure: true - only servers on https
        res.sendStatus(204);

    } catch (error) {
        res.status(500).json({
            message: "Error logging out",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleLogin, handleRefreshToken, handleLogout };