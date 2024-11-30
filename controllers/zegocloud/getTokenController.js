const { generateToken04 } = require('./zegoServerAssistant')

const handleGetToken = async (req, res) => {

    try {
        const { userId } = req.params

        const appID = parseInt(process.env.ZEGO_APP_ID)
        const serverSecret = process.env.ZEGO_SERVER_SECRET

        const effectiveTimeInSeconds = 3600
        const payload = ''

        const token = generateToken04(appID, userId, serverSecret, effectiveTimeInSeconds, payload)
        res.status(200).json({ token, appID })
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }

}

module.exports = { handleGetToken }