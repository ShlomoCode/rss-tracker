const nodemailer = require('nodemailer');
const configProject = require('../config.json');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: configProject.nodemailer.user,
        pass: configProject.nodemailer.password
    }
});

const sendMail = {
    /**
     * 
     * @param {Object} info מידע על המייל שצריך להישלח
     */
    rss(infoMail) {
        const { title, addresses, body, link, titleSite } = infoMail;
        const mailOptions = {
            from: 'pushing.rss@gmail.com',
            bcc: addresses,
            subject: 'RSS חדש!🎉 - ' + title + ` | ${titleSite}`,
            html: body + "<br>" + link
        };
        return transporter.sendMail(mailOptions)
            .then((info) => {
                console.log('Email sent: ' + info.response)
            })
            .catch(
                console.error
            )
    },
    verifi(infoMail) {
        const { verifiCode, address } = infoMail;
        const mailOptions = {
            from: 'pushing.rss@gmail.com',
            to: address,
            subject: `קוד האימות שלך עבור Rss To Mail הוא: ${verifiCode}`,
            html: `קוד אימות הדוא"ל עבור הכתובת ${address} הוא: <code>${verifiCode}</code><br>יש להכניס את הכתובת בתיבת האימות באתר.<br>בהצלחה!`
        };
        return transporter.sendMail(mailOptions)
            .then((info) => {
                console.log('Email sent: ' + info.response)
            })
            .catch(
                console.error
            );
    }
}
module.exports = sendMail;
