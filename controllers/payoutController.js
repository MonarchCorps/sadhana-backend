const Payout = require("../models/Payout")
const User = require("../models/User")
const handleEmail = require("./emailController")

const handlePayout = async (req, res) => {

    const { instructorId, amount } = req.body
    if (!instructorId || !amount)
        return res.status(400).json({ message: "All field are required" })

    try {
        const emailToSend = {};
        const user = await User.findOne({ _id: instructorId }).lean().exec()

        if (!user)
            return res.status(404).json({ message: "User not found" })

        const payout = await Payout.create({
            instructorId,
            amount
        })

        if (payout._id) {
            emailToSend.subject = 'Your payout is in session';
            emailToSend.title = `Hello ${user.username}`;
            emailToSend.description = 'Your payout of ${amount}, ID:${instructorId} is being processed. It takes between one to 7 business days you will be notified once processed';
            emailToSend.userEmail = user.email;

            handleEmail(emailToSend);
        }

        res.status(200).json({ message: "Your payout is being processed" })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Error handling payout",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handlePayout }