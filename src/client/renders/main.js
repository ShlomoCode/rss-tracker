const path = require('path');
const Feed = require('../.././api/models/feed');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
    const { id: userID, name, emailFront: email } = res.locals.user;
    const hours = new Date().getHours();
    const timeMessages = {
        morning: 'בוקר טוב',
        afternoon: 'צהריים טובים',
        evening: 'לילה טוב'
    };
    function getTime() {
        if (hours >= 7 && hours < 12) {
            return 'morning';
        }
        if (hours >= 12 && hours < 20) {
            return 'afternoon';
        }
        if ((hours >= 18 && hours < 24) || (hours >= 0 && hours < 7)) {
            return 'evening';
        }
        // למקרה שלא נמצאה שום התאמה
        return 'ברוך הבא';
    }

    const subscribersCount = await Feed.count({ Subscribers: mongoose.Types.ObjectId(userID) })
    const variables = { time: timeMessages[getTime()], name, email, subscribersCount };
    res.render(path.join(__dirname, '../views/main', 'index.ejs'), variables);
};