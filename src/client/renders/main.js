const path = require('path');

module.exports = (req, res) => {
    const hours = new Date().getHours();
    const timeMesseges = {
        morning: 'בוקר טוב',
        afternoon: 'צהריים טובים',
        evening: 'לילה טוב'
    };
    function getTime () {
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
    const { name, email } = res.locals.user;
    const variables = { time: timeMesseges[getTime()], name, email };
    res.render(path.join(__dirname, '../views/main', 'index.ejs'), variables);
};