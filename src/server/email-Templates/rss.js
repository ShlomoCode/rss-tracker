/**
 * פונקציה שמחזירה את הכתובת שבה האתר פעיל
 * כדי שהקישור אימות יישלח באופן תקין ועדכני
 * @returns Website address
 */
function checkWebsiteAddress() {
    if (process.env.WEB_SITE_ADDRESS) {
        return process.env.WEB_SITE_ADDRESS;
    }

    if (process.env.HEROKU_APP_NAME) {
        return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    } else {
        return `http://localhost:${process.env.PORT || 80}`;
    }
}

/**
 *
 * @param {String} name
 * @param {String} mail
 * @returns body מעובד
 */
function body(userID, name, email, code) {
    return 'aaa';
}

module.exports = body;
