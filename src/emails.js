const nodemailer = require('nodemailer');
const config = require('../config.json');
const { decode } = require('html-entities');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.nodemailer.user,
        pass: config.nodemailer.password
    }
});

const sendMail = {
    /**
     * 
     * @param {Object} info מידע על המייל שצריך להישלח
     */
    rss(infoMail) {
        let { title, addresses, body, link, titleSite } = infoMail;
        title = decode(title)
        const mailOptions = {
            from: 'pushing.rss@gmail.com',
            bcc: addresses,
            subject: 'RSS חדש!🎉 - ' + title.replace(/([א-ת] )(צפו)/, '$1• $2') + ` | ${titleSite}`,
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
    /** 
    * @param {Number} verifiCode 
    * @param {String} address 
    * @returns Promise 
    */
    verifi(verifiCode, address) {
        const mailOptions = {
            from: 'pushing.rss@gmail.com',
            to: address,
            subject: `קוד האימות שלך עבור Rss To Mail הוא: ${verifiCode}`,
            html: `קוד אימות הדוא"ל עבור הכתובת ${address} הוא: <code>${verifiCode}</code><br>יש להכניס את הקוד בתיבת האימות באתר.<br>בהצלחה!`
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
