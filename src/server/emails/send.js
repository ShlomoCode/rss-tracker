const nodemailer = require('nodemailer');
const imageToBase64 = require('image-to-base64');
const path = require('path');
const ejs = require('ejs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

const sendMail = {
    /**
     *
     * @param {Object} item האייטם הספציפי שנשלח
     * @param {String} feedTitle שם הפיד
     * @param {Array} addresses כתובות מייל שצריכות לקבל את הפיד
     * @returns
     */
    async rss (item, feedTitle, feedUrl, addresses) {
        let { description, link, title, thumbnail: thumbnailLink, content, category, author, created } = item;

        title = title.replace(/([א-ת] )(צפו)/, '$1• $2');

        const listFull = process.env.ALLOWED_DOMAINS_WITH_IMAGES?.replaceAll('.', '\.') || '.';
        const regexWhiteList = new RegExp(`^https?:\/\/(www\.)?(${listFull})`);

        let isAllowedImages;
        let thumbnail;
        if (!regexWhiteList.test(link) || !thumbnailLink) {
            isAllowedImages = false;
        } else {
            isAllowedImages = true;
            try {
                thumbnail = await imageToBase64(thumbnailLink);
            } catch (error) {
                isAllowedImages = false;
            }
        }

        const cidImage = Math.random().toString(36).substring(2, 7);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            bcc: addresses,
            subject: 'RSS חדש! 🎉 ⟫ ' + title + ` | ${feedTitle}`,
            html: await ejs.renderFile(path.join(__dirname, '../emails/templates/', 'rss.ejs'),
                {
                    isAllowedImages,
                    thumbnailLink,
                    description,
                    title,
                    url: link,
                    author,
                    feedUrl: feedUrl.replace(/feed\/?/, ''),
                    time: ((time) => {
                        const daysNames = [
                            'יום ראשון',
                            'יום שני',
                            'יום שלישי',
                            'יום רביעי',
                            'יום חמישי',
                            'יום שישי',
                            'שבת'
                        ];
                        const day = daysNames[time.getDay()];
                        const hours = time.getHours().toString().padStart(2, '0');
                        const minutes = time.getMinutes().toString().padStart(2, '0');
                        return `${day}, ${hours}:${minutes}`;
                    })(new Date(created)),
                    content,
                    cidImage,
                    feedTitle,
                    timeAgo: ((time) => {
                        const TimeAgo = require('javascript-time-ago');
                        const he = require('javascript-time-ago/locale/he.json');
                        TimeAgo.addDefaultLocale(he);
                        const timeAgo = new TimeAgo();
                        return timeAgo.format(new Date(time));
                    })(new Date(created)),
                    process: {
                        env: process.env
                    }
                }),
            attachments: isAllowedImages
                ? [{
                    path: `data:image/jpg;base64,${thumbnail}`,
                    filename: title,
                    cid: cidImage
                }]
                : []
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
    async verify (verifyCode, address, name) {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: address,
            subject: `קוד האימות שלך הוא: ${verifyCode}`,
            html: await ejs.renderFile(path.join(__dirname, '../emails/templates/', 'verification.ejs'),
                {
                    name,
                    code: verifyCode,
                    email: address,
                    process: {
                        env: process.env
                    }
                })
        };
        return transporter.sendMail(mailOptions);
    },
    async resetPassword (code, address, name) {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: address,
            subject: `קוד האימות שלך לאיפוס הסיסמה הוא: ${code}`,
            html: await ejs.renderFile(path.join(__dirname, '../emails/templates/', 'reset-password.ejs'),
                {
                    name,
                    code: code,
                    email: address,
                    process: {
                        env: process.env
                    }
                })
        };
        return transporter.sendMail(mailOptions);
    }
};

module.exports = sendMail;
