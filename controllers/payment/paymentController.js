const User = require('../../models/User')
const Instructor = require('../../models/Instructor')
const Course = require('../../models/Course')
const Enrolled = require('../../models/Enrolled')
const { psConfig } = require('../../config/payStack')
const convertToKobo = require('../../utils/convertToKobo')
const convertToNaira = require('../../utils/convertToNaira')

// const PLATFORM_FEE = parseInt(process.env.PLATFORM_FEE)
const FRONTEND_URL = process.env.FRONTEND_URL

const calculateFee = (amount) => {
    let transactionFee;
    if (amount > 2500) {
        transactionFee = ((amount * 1.5 / 100) + 200)
    }

    return transactionFee
}

const handlePayment = async (req, res) => {
    const { userId: id } = req.params;
    const { items } = req.body;

    if (!id) return res.status(400).json({ message: "ID field is required!" });
    if (!items) return res.status(400).json({ message: "Payment summary is required" });

    const user = await User.findById(id).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    try {
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
        const fee = calculateFee(totalAmount)
        const totalAmountWithFee = totalAmount + parseInt(fee)

        // const instructorSharePercentage = 100 - PLATFORM_FEE;
        // const splitConfig = [];

        // await Promise.all(items.map(async (item) => {
        //     const instructor = await Instructor.findOne({ userId: item.userId }).exec();
        //     if (instructor && instructor.account.subaccountCode) {
        //         const instructorShare = parseInt(((item.price / totalAmountWithFee) * instructorSharePercentage).toFixed(2));

        //         splitConfig.push({
        //             subaccount: instructor.account.subaccountCode,
        //             share: instructorShare,
        //         });
        //     }
        // }));

        // Adjust total shares to avoid exceeding 100%

        const payLoad = {
            email: user.email,
            amount: convertToKobo(totalAmountWithFee),
            metadata: {
                cancel_action: `${FRONTEND_URL}/cancel`, // Custom cancel URL
                phone: user.phoneNumber,
                name: user.username,
                email: user.email,
                custom_fields: [
                    {
                        display_name: 'Cart Items',
                        variable_name: 'cart_items',
                        value: items.map(item => item._id).join(', '),
                    }
                ],
            },
            // split: {
            //     type: 'percentage',
            //     subaccounts: splitConfig.map(({ subaccount, share }) => ({
            //         bearer_type: 'subaccount',
            //         subaccount,
            //         share,
            //     })),
            // },
            callback_url: `${FRONTEND_URL}/dashboard/student-cp/selected`,
        };

        const response = await psConfig.transaction.initialize(payLoad);
        res.status(200).json({ data: response.data });

    } catch (error) {
        res.status(500).json({
            message: "Error handling payment",
            success: false,
            error: error.message,
        });
    }
};

const handleVerification = async (req, res) => {
    const { userId: id } = req.params;
    const { items, reference } = req.body;

    if (!id) return res.status(400).json({ message: "ID field is required!" });

    const user = await User.findById({ _id: id }).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    try {
        const { data: vData } = await psConfig.transaction.verify(reference);
        if (vData.status === 'success') {




            const courseDetails = await Promise.all(items.map(async (details) => {
                const actualCourse = await Course.findById({ _id: details._id }).select('-userId -price -status -dateApplied -dateApproved -totalSeats').exec()
                const { thumbnailPhoto, ...course } = actualCourse.toObject()
                return {
                    ...course,
                    thumbnailPhoto: thumbnailPhoto,
                    paidPrice: details.price
                }
            }));

            const existingEnrollment = await Enrolled.findOne({ userId: id, referenceNumber: vData.reference });
            if (existingEnrollment) {
                return res.status(200).json({ message: 'Already enrolled' });
            } else {
                await Enrolled.create({
                    userId: id,
                    email: vData.metadata.email,
                    courseDetails: courseDetails,
                    paymentDetails: {
                        paymentId: vData.id,
                        payment_method_type: vData.channel,
                        payment_status: vData.status
                    },
                    totalAmount: convertToNaira(vData.amount),
                    referenceNumber: vData.reference,
                    cardType: vData.authorization.card_type,
                    fees: convertToNaira(vData.fees)
                });
                user.selectedCourses = []
                await user.save()
            }

            res.status(200).json({ message: 'Payment verified and processed successfully!' });
        } else {
            res.status(400).json({ message: 'Payment verification failed' });
        }

    } catch (error) {
        res.status(500).json({
            message: "Error verifying payment",
            success: false,
            error: error
        });
    }
};

module.exports = { handlePayment, handleVerification }