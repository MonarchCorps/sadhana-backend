const AdminOnly = (roles) => {
    const roleValues = Object.values(roles)

    return new Set(roleValues).size === 3 && new Set(roleValues.concat([parseInt(process.env.USER_CODE), parseInt(process.env.INSTRUCTOR_CODE), parseInt(process.env.ADMIN_CODE)])).size === 3;
}

const UserAndInstructor = (roles) => {
    const roleValues = Object.values(roles)

    return new Set(roleValues).size === 2 && new Set(roleValues.concat([parseInt(process.env.USER_CODE), parseInt(process.env.INSTRUCTOR_CODE)])).size === 2;
}

const UserOnly = (roles) => {
    const roleValues = Object.values(roles)

    return new Set(roleValues).size === 1 && new Set(roleValues.concat([parseInt(process.env.USER_CODE)])).size === 1;
}

module.exports = { AdminOnly, UserAndInstructor, UserOnly }