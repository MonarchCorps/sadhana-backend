const convertToNaira = (value) => {
    return (
        (parseInt(value) / 100).toFixed(2)
    )
}

module.exports = convertToNaira