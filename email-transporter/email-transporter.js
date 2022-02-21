const nodemailer = require('nodemailer');

function SetTransportConf(NODE_ENV) {
    if (NODE_ENV === "dev" | NODE_ENV === "staging") {
        return (
            {
                service: "gmail",
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD
                }
            }
        )
    }


    if (process.env.NODE_ENV == "production") {
        return ({
            port: process.env.SMTP_PORT,
            host: process.env.SMTP_HOST,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            },

            secure: false
        })
    }
}



function CreateTransporter() {
    console.log("Transporter message")
    console.log(process.env.SMTP_EMAIL)

    const transport_conf = SetTransportConf(process.env.NODE_ENV)
    console.log(transport_conf)
    const transporter = nodemailer.createTransport(transport_conf)

    return transporter



}

module.exports = CreateTransporter