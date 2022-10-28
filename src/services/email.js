const nodemailer = require('nodemailer');
const imageToBase64 = require('image-to-base64');
const path = require('path');
const ejs = require('ejs');
const TimeAgo = require('javascript-time-ago');
const he = require('javascript-time-ago/locale/he.json');
TimeAgo.addDefaultLocale(he);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

/**
 * @param {Object} data.item האייטם הספציפי שנשלח
 * @param {String} data.feedTitle שם הפיד
 * @param {String} data.feedUrl כתובת הפיד
 * @param {String[]} data.addresses כתובות מייל שצריכות לקבל את הפיד
 * @returns {Promise} - nodemailer sendmail promise
 */
async function sendArticle ({ item, feedTitle, feedUrl, toAddresses }) {
    let { description, link, title, thumbnail: thumbnailLink, content, category, author, created } = item;

    title = title.replace(/([א-ת] )(צפו)/, '$1• $2');

    const listFull = process.env.ALLOWED_DOMAINS_WITH_IMAGES?.replaceAll('.', '.') || '.';
    const regexWhiteList = new RegExp(`^https?://(www.)?(${listFull})`);

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
        bcc: toAddresses,
        subject: 'RSS חדש! 🎉 ⟫ ' + title + ` | ${feedTitle}`,
        html: await ejs.renderFile(path.join(__dirname, '../templates', 'rss.ejs'),
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
    return transporter.sendMail(mailOptions);
}

/**
 * @param {String} data.code קוד האימות
 * @param {String} data.address כתובת המייל
 * @returns {Promise} - nodemailer sendmail promise
 * @description שליחת מייל לאימות כתובת מייל
 **/
async function verifyEmail ({ code, address }) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: address,
        subject: `קוד האימות שלך להשלמת ההרשמה הוא: ${code}`,
        html: await ejs.renderFile(path.join(__dirname, '../templates', 'verification.ejs'),
            {
                code,
                email: address
            })
    };
    return transporter.sendMail(mailOptions);
}

/**
 * @param {String} data.code קוד האימות
 * @param {String} data.address כתובת המייל
 * @param {String} data.name שם היוזר
 * @returns {Promise} - nodemailer sendmail promise
 * @description שליחת מייל לאיפוס סיסמא
 * */
async function resetPassword ({ code, address, name }) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: address,
        subject: `קוד האימות שלך לאיפוס הסיסמה הוא: ${code}`,
        html: await ejs.renderFile(path.join(__dirname, '../templates', 'reset-password.ejs'),
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

module.exports = {
    sendArticle,
    verifyEmail,
    resetPassword
};
