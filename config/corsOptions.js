const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true)
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;