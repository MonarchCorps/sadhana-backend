const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 6, // Limit each IP to 3 login requests per `window` per minute
    message: {
        message: 'Too many failed attempts'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the  `RateLimit-*` headers
    legacyHeaders: false,

})

module.exports = loginLimiter;