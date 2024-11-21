const Instructor = require('../../models/Instructor')
const { psConfig } = require('../../config/payStack')

const handleGetEarnings = async (req, res) => {

    const { id } = req.params

    if (!id) return res.status(400).json({ message: "ID is required" });

    const instructor = await Instructor.findOne({ userId: id }).exec()
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    try {

        const response = await psConfig.transaction.list();
        const transactions = response.data;
        console.log(transactions.length)
        // Filter transactions related to the specific subaccount
        const instructorTransactions = transactions.filter(transaction => {
            return transaction.split?.formula?.subaccounts?.some(
                (sub) => sub.subaccount_code === instructor.account.subaccountCode
            );
        });

        // const transactions = await psConfig.transaction.list()
        // const transactions = await paystack.transaction.list({
        //     status: 'success',
        //     subaccount: instructor.account.,
        // });

        /**
         * {
            // subaccount: instructor.account.instructor.account.,
            // perPage: 100
        }
         */

        res.status(200).json(instructorTransactions)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching instructor earnings",
            success: false,
            error: error
        })
    }

}

module.exports = { handleGetEarnings }