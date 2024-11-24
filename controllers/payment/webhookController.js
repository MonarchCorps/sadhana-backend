const stripe = require('../../config/stripe')
const Payment = require('../../models/Payment')
const Course = require('../../models/Course')
const Enrolled = require('../../models/Enrolled')
const User = require('../../models/User')
const convertToNaira = require('../../utils/convertToNaira')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');

const endPointSecret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY

const getLineItems = async (lineItems) => {
    return Promise.all(lineItems.data.map(async (item) => {
        const product = await stripe.products.retrieve(item.price.product);
        return {
            _id: product.metadata._id, // Course ID
            instructorId: product.metadata.instructorId, // Instructor ID
            name: product.name,
            price: convertToNaira(item.price.unit_amount),
            quantity: 1,
        }
    }))
}

const handleWebhooks = async (req, res) => {

    const payloadString = JSON.stringify(req.body)
    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: endPointSecret
    });
    let event;

    try {
        event = stripe.webhooks.constructEvent(payloadString, header, endPointSecret)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: `Network Error: ${error.message}`,
            success: false,
            error: error
        })
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object

            try {
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
                const lineItemsCourseDetails = await getLineItems(lineItems)

                const courseIds = lineItemsCourseDetails.map((details) => details._id);
                const courses = await Course.find({ _id: { $in: courseIds } })
                    .select('_id classname thumbnailPhoto videoUrl description day time')
                    .lean();

                const courseDetails = lineItemsCourseDetails.map((details) => {
                    const actualCourse = courses.find((course) => course._id.toString() === details._id);

                    return {
                        _id: actualCourse._id,
                        classname: actualCourse.classname,
                        thumbnailPhoto: actualCourse.thumbnailPhoto,
                        videoUrl: actualCourse.videoUrl,
                        description: actualCourse.description,
                        day: actualCourse.day,
                        time: actualCourse.time,
                        instructorId: details.instructorId,
                        paidPrice: parseInt(details.price),
                        referenceNumber: `${session.metadata.userId}-${Date.now()}-${uuidv4}`
                    };
                })

                const mongoSession = await mongoose.startSession();
                mongoSession.startTransaction();

                try {
                    await Enrolled.create(
                        [{
                            userId: session.metadata.userId,
                            email: session.customer_email,
                            courseDetails,
                            paymentDetails: {
                                paymentId: session.payment_intent,
                                payment_method_type: session.payment_method_types,
                                payment_status: session.payment_status,
                            },
                            shipping_options: session.shipping_options.map((option) => ({
                                ...option,
                                shipping_amount: convertToNaira(option.shipping_amount),
                            })),
                            totalAmount: convertToNaira(session.amount_total),
                        }],
                        { session: mongoSession }
                    );

                    await User.updateOne(
                        { _id: session.metadata.userId },
                        { $set: { selectedCourses: [] } },
                        { session: mongoSession }
                    );

                    const paymentRecords = courseDetails.map((details) => ({
                        userId: session.metadata.userId,
                        instructorId: details.instructorId,
                        amountPaid: details.paidPrice,
                    }));
                    await Payment.insertMany(paymentRecords, { session: mongoSession });

                    await mongoSession.commitTransaction()
                    mongoSession.endSession()

                } catch (error) {
                    console.log(error.message)
                    await mongoSession.abortTransaction()
                    mongoSession.endSession()
                    throw error;
                }

            } catch (error) {
                console.log(error.message)
                res.status(500).json({
                    message: "Error processing webhook",
                    success: false,
                    error: error.message
                })
            }

        default:
            console.log(`Unhandled event type ${event.type}`)
            break;
    }

    res.status(200).send();
}


module.exports = { handleWebhooks }