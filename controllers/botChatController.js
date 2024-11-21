const BotChat = require('../models/BotChat');

const handleNewBotChat = async (req, res) => {
    const { userId } = req.params
    const { question, answer, img } = req.body

    if (!question || !answer)
        return res.status(400).json({ message: "Question and Answer are required" });
    if (!userId)
        return res.status(400).json({ message: "ID field is required" });

    try {

        const botChat = await BotChat.findOne({ userId });

        if (botChat && botChat !== null) {
            await BotChat.updateOne({ _id: botChat._id }, {
                $push: {
                    history: [
                        { role: "user", parts: [{ text: question }], ...img && { img } },
                        { role: "model", parts: [{ text: answer }] }
                    ]
                }
            });
            return res.sendStatus(200)
        } else {
            await BotChat.create({
                userId: userId,
                history: [
                    { role: "user", parts: [{ text: question }], ...img && { img } },
                    { role: "model", parts: [{ text: answer }] }
                ]
            });

            return res.sendStatus(201)
        }
    } catch (error) {
        res.status(500).json({
            message: "Error adding chats",
            success: false,
            error: error.message
        })
    }

}

const handleGetBotChat = async (req, res) => {

    const { userId } = req.params

    if (!userId) return res.status(400).json({ message: "ID field is required", success: false });

    try {
        const botChats = await BotChat.findOne({ userId }).lean().exec();
        if (!botChats)
            return res.status(204).json({ message: "No chats found" });

        res.status(200).json(botChats)

    } catch (error) {
        res.status(500).json({
            message: "Error getting chats",
            success: false,
            error: error.message
        })
    }

}

const handleDeleteBotChat = async (req, res) => {
    const { userId } = req.params

    if (!userId)
        return res.status(400).json({ message: "ID field is required" });

    try {
        const botChats = await BotChat.findOne({ userId }).exec();
        if (!botChats)
            return res.status(404).json({ message: "Chats not found", });

        await BotChat.deleteOne({ _id: botChats._id });
        res.sendStatus(204)
    } catch (error) {
        res.status(500).json({
            message: "Error deleting chats",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handleNewBotChat, handleGetBotChat, handleDeleteBotChat }