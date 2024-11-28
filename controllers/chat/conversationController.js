const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
const User = require('../../models/User')
const { getSocketIdByUserId, io } = require('../../config/socket')
const mongoose = require('mongoose')

const handleCreateConversation = async (req, res) => {
    const { participants, isGroup, groupName, groupImage, admin } = req.body;

    try {
        const sortedParticipants = participants.slice().sort();

        const existingConversation = await Conversation.findOne({
            participants: { $all: sortedParticipants, $size: sortedParticipants.length },
        });

        if (existingConversation)
            return res.status(200).json(existingConversation._id);


        const newConversation = await Conversation.create({
            participants: sortedParticipants,
            isGroup,
            groupName,
            groupImage,
            admin,
        });

        newConversation.participants.forEach((participantId) => {
            const socketId = getSocketIdByUserId(participantId);
            if (socketId) {
                console.log(`Emitting to user ${participantId} with socket ID ${socketId}, convId: ${newConversation._id} `);
                io.to(socketId).emit('newConversation', newConversation);
            } else {
                console.warn(`Socket ID not found for user ${participantId}`);
            }
        });

        res.status(201).json(newConversation._id);
    } catch (error) {
        console.error('Error creating conversation:', error.message);
        res.status(500).json({
            message: 'Error creating conversation',
            error: error.message,
        })
    }
}

const handleGetMyConversations = async (req, res) => {
    const { id } = req.params;

    try {
        const conversations = await Conversation.find({ participants: id }).lean();

        const conversationsWithDetails = await Promise.all(
            conversations.map(async (conversation) => {
                let userDetails = {};
                if (!conversation.isGroup) {
                    const otherUserId = conversation.participants.find((userId) => userId.toString() !== id);
                    const [otherUser] = await User.aggregate([
                        { $match: { _id: new mongoose.Types.ObjectId(otherUserId) } },
                        {
                            $project: {
                                username: 1, email: 1, roles: 1,
                                profileImage: 1, phoneNumber: 1,
                                lastActive: 1, gender: 1, address: 1,
                            }
                        }
                    ])
                    userDetails = otherUser
                }

                const lastMessage = await Message.find({ conversation: conversation._id })
                    .sort({ _id: -1 })
                    .limit(1)
                    .lean();

                const i = await Message.find({ conversation: conversation._id })

                return {
                    userDetails,
                    ...conversation,
                    lastMessage: lastMessage[0] || null,
                }
            })
        )

        res.status(200).json(conversationsWithDetails);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching conversations',
            error: error.message
        });
    }
}

const handleGetGroupMembers = async (req, res) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json({ message: "conversationId is required" });
    }

    try {
        // Fetch the conversation
        const conversation = await Conversation.findById({ _id: new mongoose.Types.ObjectId(conversationId) }).lean().exec();

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const participantsId = conversation.participants;

        const objectIdArray = participantsId.map(id => new mongoose.Types.ObjectId(id));

        // Query users who are participants
        const users = await User.find({ _id: { $in: objectIdArray } })
            .lean()
            .select('username email roles profileImage phoneNumber gender')
            .exec();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching group members",
            success: false,
            error: error.message,
        });
    }
}

module.exports = { handleCreateConversation, handleGetMyConversations, handleGetGroupMembers }