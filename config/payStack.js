const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const psConfig = require('paystack')(PAYSTACK_SECRET_KEY);

module.exports = { psConfig }