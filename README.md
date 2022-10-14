# Rss Tracker - Server side

פרויקט Node.js + mongodb למעקב אחרי פידי [RSS](https://he.wikipedia.org/wiki/RSS).

כולל הרשמה, התחברות ואימות מייל.

מתאים לפריסה לוקאלית על המחשב, או על שרת.

# API

מאגר זה מכיל את קוד צד השרת בלבד. הקליינט בנוי בvuejs ונמצא במאגר נפרד.

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

חובה להריץ את כל הפקודות לפי הסדר.</br>
פקודת `npm run configure` מפעילה סקריפט אינטראקטיבי ליצירת קובץ `config.json`.</br>
משתני סביבה **ידרסו** את ההגדרות שבקובץ ה-json.

- 🧰 Clone the code:
  - ```git clone https://github.com/ShlomoCode/rss-tracker-server```
- 📦 Install dependencies:
  - `npm install`
- ⚙️ Configure the app:
  - `npm run configure`
- 🏃 Run the server:
  - `npm start`

אחרי הגדרת הקונפיג, יש לנווט בשורת הפקודה לתקיה, ולהריץ `npm start`. כברירת מחדל ממשק האתר יהיה זמין בכתובת <http://localhost:4000>.

# Libraries used in this project

## server-side

- morgan - logger

- nodemon - refresh the server on file change

- express - http server

- cookie-parser - parse cookies in the server side

- mongoose - connecting to mongoDB

- rss-to-json - get rss feed and convert it to json

- nodemailer - send emails

- zxcvbn - to check the strength of the password

- bcrypt - to encrypt the password

- jsonwebtoken - to create the token and validate it

- html-entities - לטיפול באתרים ששולחים בפיד את התוים המיוחדים (מירכאות לדוגמה) בפורמט [HTML Entities](https://www.w3schools.com/html/html_entities.asp)

- html-metadata-parser - get image from html for sites that don't support og:image (JDN example)

- image-to-base64 - download image from url and convert it to base64

- prompts - to get the user input in the configuration process (setup.js file)

- ms - convert milliseconds to human readable format or time in string to miliseconds

- ejs - template engine - emails templates

- javascript-time-ago - convert time to human readable format (for emails)

- express-async-errors - to handle async errors in express

- cross-env - Setting environment variables in the command line (for cross-platform)

- colors - to print colors in the console

- ajv - to validate the requests

- validator - to validate the input
