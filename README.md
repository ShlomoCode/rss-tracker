# Rss Tracker - Server side

פרויקט Node.js + mongodb למעקב אחרי פידי [RSS](https://he.wikipedia.org/wiki/RSS).

כולל הרשמה, התחברות ואימות מייל.

מתאים לפריסה לוקאלית על המחשב, או על שרת.

# API

הAPIs מיועדים לתקשורת בין הקליינט לסרבר, אך ניתן לממש קליינט עצמי.

כל הAPIs דורשים אימות על ידי שליחת מזהה סשן בתוך jwt, בתור עוגיה בשם `jwt`, או כBearer ב-authorization header:

```Authorization: Bearer <jwt-token>```

 את הטוקן ניתן לקבל בכתובת הlogin על ידי שליחת שם משתמש וסיסמה.

כל הפרמטרים הם חובה, אלא אם כן צוין אחרת.

להלן תיעוד בסיסי של הנתיבים שקיימים כרגע והפרמטרים שהם דורשים:

<details>
<summary>users</summary>

## users

APIs תחת הנתיב `/api/users`.
מכילים פעולות הקשורות למשתמשים.

#### signup

הרשמה.

    POST /api/users/signup
  
   body: `{
        "name": "name",
        "email": "email",
        "password": "password"
    }`

#### login

התחברות.

    POST /api/users/login
  
   body: `{
        "username": "username",
        "password": "password"
    }`

#### log-out

התנתקות ומחיקת הסשן הפעיל מהדאטהבייס.

    POST /api/users/log-out

#### verify

אימות מייל עבור המשתמש המחובר כעת.

    POST /api/users/verify
  
query: `{
       "verifyCode": "5 digit code"
    }`

#### re-send verify email

שליחת מייל אימות מחדש למייל המשתמש המחובר כעת.
מוגבל לפעמים אחת ביום.

    POST /api/users/resendVerificationEmail

body: `{
        "email": "email"
    }`

</details>

<details>
<summary>feeds</summary>

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

</details>

<details>
<summary>subscriptions</summary>

## subscriptions

ניהול הרשמות לפידים.

#### subscribe to feed

    POST /api/subscriptions/:subscriptionId

#### unsubscribe from feed

    DELETE /api/subscriptions/:subscriptionId

#### unsubscribe from all feeds

    POST /api/subscriptions/unsubscribe-all

</details>

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
GMAIL_USER # gmail username
GMAIL_PASSWORD # account google password or "password for app" - https://support.google.com/mail/answer/185833
JWT_SECRET # JWT secret key
```

#### Optional variables

```
MAX_FEEDS_PER_USER = 10 # MAX_FEEDS_PER_USER. default: 10
PORT # PORT - for localhost. default: 80.
WEB_SITE_ADDRESS # The server address.
ALLOWED_DOMAINS_WITH_IMAGES="hm-news.co.il|jdn.co.il|93fm.co.il|bahazit.co.il" # sites for which images will be sent.
ALLOWED_DOMAINS_NO_IMAGES="pinatkafe.com|internet-israel.com|geektime.co.il" # White list to sent without images
```

אחרי הגדרת הקונפיג, יש לנווט בשורת הפקודה לתקיה, ולהריץ `npm start`. כברירת מחדל ממשק האתר יהיה זמין בכתובת <http://localhost>.

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

* ms - convert milliseconds to human readable format or time in string to miliseconds

* ejs - template engine - site and emails

* javascript-time-ago - convert time to human readable format (for emails)

* express-async-errors - to handle async errors in express

* cross-env - Setting environment variables in the command line (for cross-platform) 

* colors - to print colors in the console

* ajv - to validate the requests

* validator - to validate the input

## client-side

* [jQuery](https://jquery.com)

* [axios](https://github.com/axios/axios)

* [awesome-notifications](https://f3oall.github.io/awesome-notifications)

* [sweet](https://www.npmjs.com/package/sweetalert)
