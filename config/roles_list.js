const ROLES_LIST = {
    "Admin": parseInt(process.env.ADMIN_CODE),
    "Instructor": parseInt(process.env.INSTRUCTOR_CODE),
    "User": parseInt(process.env.USER_CODE)
}

module.exports = ROLES_LIST;