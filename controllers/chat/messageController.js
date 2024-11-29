const { getSocketIdByUserId, io } = require('../../config/socket')
const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
const User = require('../../models/User')

const handleGetMessages = async (req, res) => {

    const { id } = req.params;
    const { conversation } = req.query;

    if (!id || !conversation)
        return res.status(400).json({ message: "All fields are required" })

    try {
        const messages = await Message.find({ conversation })
            .sort({ createdAt: 1 }) // Sorting messages by creation time, oldest to newest
            .lean();

        if (!messages)
            return res.status(404).json({ message: 'No messages found' });

        const userProfileCache = new Map();

        const messagesWithSender = await Promise.all(
            messages.map(async (message) => {
                let senderDetails;

                // Check if sender is already cached
                if (userProfileCache.has(message.sender.toString())) {
                    senderDetails = userProfileCache.get(message.sender.toString());
                } else {
                    // Fetch sender details from the database
                    senderDetails = await User.findById({ _id: message.sender }).lean();
                    if (!senderDetails) {
                        throw new Error('Sender not found');
                    }
                    // Cache the sender details
                    userProfileCache.set(message.sender.toString(), senderDetails);
                }

                return {
                    ...message,
                    sender: {
                        _id: senderDetails._id,
                        username: senderDetails.username,
                        profileImage: senderDetails.profileImage,
                    }
                }
            })
        )

        res.status(200).json(messagesWithSender)
    } catch (error) {
        res.status(500).json({
            message: "Error fetching messages",
            success: false,
            error: error.message
        })
    }
}

const handleSendMessage = async (req, res) => {
    const { id } = req.params;
    const { content, conversation, messageType } = req.body;

    try {
        const conversationExists = await Conversation.findById({ _id: conversation });
        if (!conversationExists)
            return res.status(404).json({ message: "Conversation not found" });

        if (!conversationExists.participants.includes(id))
            return res.status(400).json({ message: "User not in conversation" });

        const newMessage = await Message.create({
            sender: id,
            content,
            conversation,
            messageType,
        });

        const sender = await User.findById(id).lean();

        const messagePayload = {
            ...newMessage.toObject(),
            sender: {
                _id: sender._id,
                username: sender.username,
                profileImage: sender.profileImage,
            },
        };

        conversationExists.participants.forEach((participantId) => {
            const socketId = getSocketIdByUserId(participantId);
            if (socketId) {
                io.to(socketId).emit('newMessage', messagePayload);
            }
        })

        res.status(201).json({ messageId: newMessage._id });
    } catch (error) {
        res.status(500).json({
            message: "Error sending message",
            success: false,
            error: error.message,
        });
    }
}




module.exports = { handleGetMessages, handleSendMessage }