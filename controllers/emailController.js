const nodemailer = require('nodemailer')

const handleEmail = (emailToSend) => {
    const html = `
        <h1>${emailToSend.title}</h1>
        <p>${emailToSend.description} ${emailToSend.redirectUrl}</p>
    `
    try {

        const main = async () => {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT, 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
            });

            const info = await transporter.sendMail({
                from: `MonarchCorps <${process.env.EMAIL_USER}>`,
                to: `${emailToSend.userEmail}`,
                subject: `${emailToSend.subject}`,
                html: html
            })

            console.log(`Sent ${info.messageId}`)

            return 'User notified'
        }

        main()

    } catch (error) {
        res.status(500).json({
            message: "Error sending mail",
            success: false,
            error: error
        })
    }

}

module.exports = handleEmail