const Instructor = require('../../../models/Instructor')
const { psConfig } = require('../../../config/payStack')

const PLATFORM_FEE = process.env.PLATFORM_FEE

const handleCreateAccount = async (req, res) => {

    const { accountBank, accountNumber, id } = req.body
    if (!accountBank || !accountNumber || !id)
        return res.status(400).json({ message: "All input fields are required" })

    const instructor = await Instructor.findOne({ userId: id }).populate('userId', 'username email').exec();
    if (!instructor)
        return res.status(400).json({ message: "Instructor not found!" })

    try {
        const payload = {
            business_name: instructor.userId.username,
            settlement_bank: accountBank.code,
            account_number: accountNumber,
            percentage_charge: parseInt(PLATFORM_FEE), // Percentage of split going to this subaccount
            primary_contact_email: instructor.userId.email
        };

        const response = await psConfig.subaccount.create(payload);

        instructor.account = {
            accountId: response.data.id,
            subaccountCode: response.data.subaccount_code
        }
        await instructor.save()
        res.status(201).json(response.id)
    } catch (error) {
        res.status(500).json({
            message: "Error creating instructor account",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleCreateAccount }