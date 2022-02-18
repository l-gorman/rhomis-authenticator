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
    // console.log(transport_conf)
    // var mailOptions = {
    //     from: process.env.SMTP_EMAIL, // sender address (who sends)
    //     to: 'lg14410@bristol.ac.uk', // list of receivers (who receives)
    //     subject: 'Hello ', // Subject line
    //     text: 'Hello world ', // plaintext body
    //     html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js' // html body
    // };


}

module.exports = CreateTransporter