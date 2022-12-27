const nodemailer = require('nodemailer');
const imageToBase64 = require('image-to-base64');
const path = require('path');
const ejs = require('ejs');
const TimeAgo = require('javascript-time-ago');
const he = require('javascript-time-ago/locale/he.json');
TimeAgo.addDefaultLocale(he);

function generateDateTimeString (time) {
    const daysNames = [
        'יום ראשון',
        'יום שני',
        'יום שלישי',
        'יום רביעי',
        'יום חמישי',
        'יום שישי',
        'שבת'
    ];
    const dayName = daysNames[time.getDay()];
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${dayName}, ${hours}:${minutes}`;
}

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
 * @param {Object[]} data.toAddresses כתובות מייל שצריכות לקבל את המאמר
 * @returns {Promise} - nodemailer sendmail promise
 */
async function sendArticle ({ article, feedTitle, feedUrl, toAddresses }) {
    const {
        description,
        link,
        title,
        thumbnail,
        content,
        author,
        created
    } = article;

    const domainsAllowedImagesAttached = process.env.DOMAINS_ALLOWED_ATTACHED_IMAGES || [];
    const isDomainAllowedForImages = domainsAllowedImagesAttached.includes(new URL(article.link).host);

    const usersAllowAttachmentsInEmail = toAddresses.filter(recipient => recipient.allowAttachmentsInEmail);
    const usersNotAllowAttachmentsInEmail = toAddresses.filter(recipient => !recipient.allowAttachmentsInEmail);

    let thumbnailBase64;
    if (isDomainAllowedForImages && thumbnail && usersAllowAttachmentsInEmail.length) {
        try {
            thumbnailBase64 = await imageToBase64(thumbnail);
        } catch (error) {
            thumbnailBase64 = null;
        }
    }

    const cidImage = Math.random().toString(36).substring(2, 7);

    const ejsData = {
        description,
        title,
        url: link,
        author,
        feedUrl: feedUrl.replace(/feed\/?/, ''),
        time: generateDateTimeString(new Date(created)),
        content,
        imageUrl: thumbnailBase64 ? `cid:${cidImage}` : thumbnail,
        feedTitle,
        timeAgo: new TimeAgo().format(new Date(created)),
        manageSubscriptionsUrl: `${process.env.FRONTEND_URL}/subscriptions}`
    };

    const mailOptions = {
        from: process.env.GMAIL_USER,
        bcc: usersAllowAttachmentsInEmail.map(recipient => recipient.address),
        subject: `${feedTitle} ⟫ ${title}`,
        html: await ejs.renderFile(path.join(__dirname, '../templates', 'article.ejs'), ejsData),
        attachments: []
    };
    if (isDomainAllowedForImages) {
        mailOptions.attachments = [{
            path: `data:image/jpg;base64,${thumbnailBase64}`,
            filename: title,
            cid: cidImage
        }];
    };

    const promises = [];

    if (usersAllowAttachmentsInEmail.length && isDomainAllowedForImages) {
        promises.push(transporter.sendMail(mailOptions));
    }

    if (usersNotAllowAttachmentsInEmail.length) {
        ejsData.imageUrl = thumbnail;
        promises.push(transporter.sendMail({
            ...mailOptions,
            bcc: usersNotAllowAttachmentsInEmail.map(recipient => recipient.address),
            attachments: []
        })
        );
    }
    return Promise.all(promises);
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
        html: await ejs.renderFile(
            path.join(__dirname, '../templates', 'verification.ejs'),
            {
                code,
                email: address,
                verifyUrl: `${process.env.FRONTEND_URL}/verify?code=${code}`
            }
        )
    };
    return transporter.sendMail(mailOptions);
}

/**
 * @param {String} data.token קוד האימות
 * @param {String} data.address כתובת המייל
 * @returns {Promise} - nodemailer sendmail promise
 * @description שליחת מייל לאיפוס סיסמא
 * */
async function forgotPassword ({ token, address }) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: address,
        subject: `קוד האימות שלך לאיפוס הסיסמה הוא: ${token}`,
        html: await ejs.renderFile(
            path.join(__dirname, '../templates', 'forgot-password.ejs'),
            {
                token,
                email: address
            }
        )
    };
    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendArticle,
    verifyEmail,
    forgotPassword
};
