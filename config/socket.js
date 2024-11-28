const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const allowedOrigins = require('./allowedOrigins');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
    },
})

const userSocketMap = {}
const typingUsersMap = {}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) {
        console.error('User ID not provided in handshake query');
    } else {
        userSocketMap[userId] = socket.id;
        socket.userId = userId;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('activity', ({ conversationId, status }) => {
        if (!typingUsersMap[conversationId]) typingUsersMap[conversationId] = [];

        if (status === 'typing') {
            if (!typingUsersMap[conversationId].includes(userId)) {
                typingUsersMap[conversationId].push(userId);
            }
        } else if (status === 'stopped') {
            typingUsersMap[conversationId] = typingUsersMap[conversationId].filter((id) => id !== userId);
        }

        socket.broadcast.emit('activity', { userId, conversationId, status });
    })

    socket.on('disconnect', () => {

        if (socket.userId) {
            delete userSocketMap[socket.userId]

            Object.keys(typingUsersMap).forEach((conversationId) => {
                typingUsersMap[conversationId] = typingUsersMap[conversationId].filter((id) => id !== userId);
            })
        }

        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
})

/**
 * Get the socket ID for a given userId.
 * @param { string } userId - The ID of the user.
 * @returns { string|null } The socket ID or null if not connected.
 */

const getSocketIdByUserId = (userId) => userSocketMap[userId] || null;

module.exports = { io, app, server, getSocketIdByUserId }