const nodemailer = require('nodemailer');
const imageToBase64 = require('image-to-base64');
const path = require('path');
const ejs = require('ejs');

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
     * @param {Object} item האייטם הספציפי שנשלח
     * @param {String} feedTitle שם הפיד
     * @param {Array} addresses כתובות מייל שצריכות לקבל את הפיד
     * @returns
     */
    async rss (item, feedTitle, feedUrl, addresses) {
        let { description, link, title, thumbnail: thumbnailLink, content, category, author, created } = item;

        title = title.replace(/([א-ת] )(צפו)/, '$1• $2');

        const pathImageExmple = path.join(__dirname, '../../client/images', 'example.png');
        const listFull = process.env.White_list_including_images?.replaceAll('.', '\.') || '.';
        const regexWhiteList = new RegExp(`^https?:\/\/(www\.)?(${listFull})`);

        if (!regexWhiteList.test(link) || !thumbnailLink) {
            thumbnailLink = pathImageExmple;
        }

        let thumbnail;
        try {
            thumbnail = await imageToBase64(thumbnailLink);
        } catch (error) {
            thumbnail = await imageToBase64(pathImageExmple);
        }

        const cidImage = Math.random().toString(36).substring(2, 7);

        const mailOptions = {
            from: process.env.gmail_user,
            bcc: addresses,
            subject: 'RSS חדש! 🎉 ⟫ ' + title + ` | ${feedTitle}`,
            html: await ejs.renderFile(path.join(__dirname, '../emails/templates/', 'rss.ejs'),
                {
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
    async verify (verifyCode, address, name) {
        const mailOptions = {
            from: process.env.gmail_user,
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
    }
};

module.exports = sendMail;
