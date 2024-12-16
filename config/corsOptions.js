const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    //btw i know this isn't safe, but this is how i fix my cors error mostly
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;
