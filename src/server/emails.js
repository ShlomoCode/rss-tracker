const nodemailer = require('nodemailer');
const { decode } = require('html-entities');
const imageToBase64 = require('image-to-base64');
const bodyVerifyEmail = require('./email-Templates/verification');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.gmail_user,
        pass: process.env.gmail_password
    }
});

const sendMail = {
/**
 *
 * @param {Objecj} item האייטם הספציפי שנשלח
 * @param {String} feedTitle שם הפיד
 * @param {Array} addresses כתובות מייל שצריכות לקבל את הפיד
 * @returns
 */
    async rss(item, feedTitle, addresses) {
        let { description, link, title, thumbnail: thumbnailLink } = item;

        title = decode(title);
        feedTitle = decode(feedTitle);

        title = title.replace(/([א-ת] )(צפו)/, '$1• $2');

        const listFull = process.env.White_list_including_images?.replaceAll('.', '\.') || '.';
        const regexWhiteList = new RegExp(`^https?:\/\/(www\.)?(${listFull})`);
        if (!regexWhiteList.test(link)) {
            thumbnailLink = path.join(__dirname, '../client/static/main/images', 'example.png');
        }

        const thumbnail = await imageToBase64(thumbnailLink);

        const cidImage = Math.random().toString(36).substring(2, 7);

        const mailOptions = {
            from: process.env.gmail_user,
            bcc: addresses,
            subject: 'RSS חדש! 🎉 ⟫ ' + title + ` | ${feedTitle}`,
            html: description + '<br>' + `<img src="cid:${cidImage}" height="240px">` + '<br>' + link,
            attachments: [{
                path: `data:image/jpg;base64,${thumbnail}`,
                filename: title,
                cid: cidImage
            }]
        };
        return transporter.sendMail(mailOptions)
            .then((info) => {
                console.log('Email sent: ' + info.response);
            })
            .catch(
                console.error
            );
    },
    /**
    * @param {Number} verifyCode
    * @param {String} address
    * @returns Promise
    */
    verify(verifyCode, address, name, userID) {
        const mailOptions = {
            from: process.env.gmail_user,
            to: address,
            subject: `קוד האימות שלך הוא: ${verifyCode}`,
            html: bodyVerifyEmail(userID, name, address, verifyCode)
        };
        return transporter.sendMail(mailOptions);
    }
};
module.exports = sendMail;
