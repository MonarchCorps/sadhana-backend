const { psConfig } = require('../../config/payStack')

const handleGetBanks = async (req, res) => {

    try {
        const response = await psConfig.misc.list_banks();
        res.status(200).json({
            data: response.data
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching list of banks",
            success: false,
            error: error.message
        })
    }

}

module.exports = { handleGetBanks }