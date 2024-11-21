const { handleAddNewClass } = require('./addNewClass')

const { handleMyClass } = require('./getClass')

const { handleUpdateClass } = require('./manageClass')

const { handleDeleteClass } = require('./manageClass')

const { handleGetAllClass } = require('./getClass')

const { handleBookClass } = require('./courseActions')

const { handleUnBookClass } = require('./courseActions')


module.exports = { handleAddNewClass, handleMyClass, handleDeleteClass, handleUpdateClass, handleGetAllClass, handleBookClass, handleUnBookClass }