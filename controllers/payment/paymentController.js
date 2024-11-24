const stripe = require('../../config/stripe')
const User = require('../../models/User')
const convertToKobo = require('../../utils/convertToKobo')

const handlePayment = async (req, res) => {

    const { items } = req.body
    const { id } = req.params

    try {
        const user = await User.findById(id).exec()
        if (!user)
            return res.status(404).json({ message: "User not found" })

        const params = {
            submit_type: "pay",
            mode: "payment",
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_options: [
                {
                    shipping_rate: 'shr_1QBFTlFjx2kcpfF5OvrzEoi4'
                }
            ],
            customer_email: user.email,
            metadata: {
                userId: id
            },
            line_items: items.map(item => {
                return {
                    price_data: {
                        currency: 'ngn',
                        product_data: {
                            name: item.classname,
                            metadata: {
                                _id: item._id,
                                instructorId: item.userId,
                            }
                        },
                        unit_amount: convertToKobo(item.price)
                    },
                    adjustable_quantity: {
                        enabled: false,
                    },
                    quantity: 1
                }
            }),

            success_url: `${process.env.FRONTEND_URL}/success?redirectUrl=paymentGateway`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel?redirectUrl=paymentGateway`
        }
        const session = await stripe.checkout.sessions.create(params)
        res.status(200).json(session)
    } catch (error) {
        res.status(500).json({
            message: "Error handling payments",
            success: false,
            error: error.message
        })
    }
}

module.exports = { handlePayment }