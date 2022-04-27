# RSS TO MAIL

פרויקט nodeJS למעקב אחרי פידי [RSS](https://he.wikipedia.org/wiki/RSS) ושליחת העדכונים למייל.

כולל הרשמה, התחברות ואימות מייל.

מתאים לפריסה לוקאלית על המחשב, או על שרת, וכן מתאים לפריסה מהירה על שרת heroku.

# API

כל הAPIs דורשים אימות על ידי שליחת עוגיה בשם `token` עם מזהה jwt.
את העוגיה הנ"ל ניתן לקבל בכתובת הלוגין על ידי שליחת שם משתמש וסיסמה.
כל הנתיבים הם תחת הנתיב `/api/`.
כל הפרמטרים הם חובה, אלא אם כן צוין אחרת.

## users

APIs תחת הנתיב `/api/users`.
מכילים פעולות הקשורות למשתמשים.

#### login

התחברות.

    POST /api/users/login
  
   body: `{
        "username": "username",
        "password": "password"
    }`

#### signup

הרשמה.

    POST /api/users/signup
  
   body: `{
        "name": "name",
        "email": "email",
        "password": "password"
    }`

#### verify

אימות מייל עבור המשתמש המחובר כעת.

    POST /api/users/verify
  
query: `{
       "verifyCode": "verifyCode"
    }`

#### unsubscribe

ביטול אישור קבלת מיילים עבור המשתמש המחובר כעת.

    DELETE /api/users/unsubscribe

#### re-send verify email

שליחת מייל אימות מחדש למייל המשתמש המחובר כעת.
מוגבל לפעמים אחת ביום.

    POST /api/users/againSendVerificationEmail

## feeds

APIs תחת הנתיב `/api/feeds`.
מכילים פעולות הקשורות לערוצי העדכונים (RSS).
בקבלת מידע על פיד, מושמטים פרטים על משתמשים אחרים שנרשמו לפיד.

#### get all feeds

מחזיר את כל הפידים במערכת.

    GET /api/feeds

#### get specific feed

מחזיר מידע על פיד ספציפי.

    GET /api/feeds/:id

#### create new feed

יצירת פיד חדש.

    POST /api/feeds
    query: `{
        "url": "url"
    }`

#### Subscribe to feed

הרשמה לפיד.

    POST /api/feeds/subscribe/:id

#### Unsubscribe from feed

ביטול הרשמה לפיד.

    DELETE /api/feeds/unsubscribe/:id

## APIs for admin - עשוי להתבטל בהמשך

### users

#### delete user

מחיקת משתמש מהמערכת.
זמין רק למנהלים.

    DELETE /api/users/:id

#### get all users

מחזיר את כל המשתמשים במערכת.
זמין רק למנהלים.
פרטים רגישים במיוחד כגון סיסמאות מושמטים מהפלט.

    GET /api/users

# self-hosted

הגרסה הציבורים מכילה הגבלות שונות, הן בכמות העדכונים שניתן להירשם (בגלל מגבלה של גוגל על כמות שליחת המיילים), והן ברשימה לבנה של אתרים שאליהם ניתן להירשם (ע"מ שהאתר יהיה פתוח בסינונים השונים).
הפתרון לכך הוא אירוח עצמי של הפרויקט;

## פריסה לוקאלית

### config

יש להוריד את המאגר למחשב, ולמלא את הקונפיג;

הקונפיג מוגדר בקובץ `config.env` תחת התקיה הראשית של הפרויקט.

הקונפיג מוכנס בצורה של `שם ערך = ערך`, שורה תחת שורה.

[פרטים נוספים על התחביר](https://www.npmjs.com/package/dotenv  "פרטים נוספים על התחביר").

#### Required variables

```
MONGO_URI # mongoDB connection string
gmail_user # gmail username
gmail_password # accunt google password or "password for app" - https://support.google.com/mail/answer/185833
JWT_KEY # JWT secret key
```

#### Optional variables

```
countMaxFeedsForUser = 10 # countMaxFeedsForUser. default: 10
PORT # PORT - for localhost. default: 80.
WEB_SITE_ADDRESS # site address - for costume domain on heroku or vps server.
White_list_including_images="hm-news.co.il|jdn.co.il|93fm.co.il|bahazit.co.il" # sites for which images will be sent.
White_list_does_not_include_images="pinatkafe.com|internet-israel.com|geektime.co.il" # White list to sent without images
```

אחרי הגדרת הקונפיג, יש לנווט בשורת הפקודה לתקיה, ולהריץ `npm start`. כברירת מחדל ממשק האתר יהיה זמין בכתובת <http://localhost>.

## Quick deployment on Heroku

click on the heroku button 👇👇 and fill the config required:

* mongoDB uri
* gmail user
* gmail password

<div  align='center'>

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ShlomoCode/rss-to-mail/tree/master)

</div>
You can also fill optional configs listed above.

### מניעת "הירדמות" האפליקציה

בתוכנית החינמית של heroku, [השרת נכבה מעצמו](https://devcenter.heroku.com/articles/free-dyno-hours#dyno-sleeping) אחרי 30 דקות ללא בקשה חיצונית לשרת.
ניתן לעקוף זאת על ידי אימות אשראי בחשבון ההרקו, וכך מקבלים סה"כ 1000 שעות חינם בחודש, שמספיקות לפעילות רציפה של האפליקציה.
לאחר מכן יש לשלוח "בקשת דמה" לאפליקציה.
 ניתן לעשות זאת באמצעות אתרים כמו [זה](https://kaffeine.herokuapp.com/) או [זה](https://www.downnotifier.com/), או באמצעות אפליקציית גוגל סקריפט (מבוסס על [הפוסט הזה](https://blog.chv.ovh/site-monitoring)):

יש ליצור ב[גוגל סקריפט](https://script.google.com) סקריפט חדש, ולהכניס בו את הקוד הבא (כמובן לתקן את שם האפליקציה וכתובת המייל לשליחת הדיווח אם האפליקציה לא תקינה):

 ```JS
const siteUrl = 'https://appname.herokuapp.com/api/status';
const emailAddress = 'my.mail@gmail.com';

function fetch() {
    const siteCall = UrlFetchApp.fetch(siteUrl, {
        validateHttpsCertificates: false,
        followRedirects: true,
        muteHttpExceptions: true,
    });
    const siteStatus = siteCall.getResponseCode();
    if (siteStatus !== 200) {
        const body = `the response of google apps scripts request was: status ${siteStatus}. check the status quickly! ${siteUrl}`;
        const subject = 'something wrong in heroku apps';
        GmailApp.sendEmail(emailAddress, subject, body);
        Logger.log('something failed. email send succesfuly');
    } else {
        Logger.log(`${siteUrl} is ${siteStatus} code.`);
    }
}
```

after that, you add trigger to the script in every less 30 minutes.
script will be triggered every 30 minutes, get to you site, if the site is not working, send email to the email address in the `emailAddress` variable.

# Libraries used in this project

## server-side

* morgan - logger

* nodemon - refresh the server on file change

* express - http server

* cookie-parser - parse cookies in the server side

* mongoose - connecting to mongoDB

* rss-to-json - get rss feed and convert it to json

* nodemailer - send emails

* zxcvbn - to check the strength of the password

* bcrypt - to encrypt the password

* jsonwebtoken - to create the token and validate it

* html-entities - לטיפול באתרים ששולחים בפיד את התוים המיוחדים (מירכאות לדוגמה) בפורמט [HTML Entities](https://www.w3schools.com/html/html_entities.asp)

* html-metadata-parser - get image from html for sites that don't support og:image (JDN example)

* image-to-base64 - download image from url and convert it to base64

* dotenv - config file

* ms - convert miliseconds to human readable format or time in string to miliseconds

## client-side

* [jQuery](https://jquery.com)

* [axios](https://github.com/axios/axios)

* [js-cookie](https://github.com/js-cookie/js-cookie)

* [awesome-notifications](https://f3oall.github.io/awesome-notifications)

* [sweet](https://www.npmjs.com/package/sweetalert)
