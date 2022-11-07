# Rss Tracker - Server side

פרויקט למעקב אחרי תכנים מאתרים שתומכים בטכנולוגיית [RSS](https://he.wikipedia.org/wiki/RSS), לדוגמה בלוגים ואתרי חדשות.</br>
מאפשר לקבל כל אייטם חדש ישירות למייל, או לצפות בתוכן בממשק אינטרנטי.</br>
מתאים גם לפריסה עצמית בקלות על מחשב או על שרת.

**טכנולוגיות**:</br>
צד שרת: Node.js + MongoDB</br>
צד לקוח: Vue.js + Vuetify

# API Documentation

>מאגר זה מכיל את קוד צד השרת בלבד. הקליינט בנוי כ[SPA](https://en.wikipedia.org/wiki/Single-page_application) בVue.js ונמצא ב[repo נפרד](https://github.com/ShlomoCode/rss-tracker-client).

**מקרא**:

באם תחת הAPI הרלוונטי מופיע `Active session required: yes`, קריאה לAPI זה דורשת צירוף מזהה סשן פעיל.</br>
ניתן לשלוח את הסשן בתוך cookie בשם `session` או בתוך הכותרת `Authorization` בצורה `<Bearer <session`.

<details>

> את הסשן ניתן לקבל בכתובת הlogin על ידי שליחת שם משתמש וסיסמה.
> באם ההתחברות תקינה, הסשן יחזור כcookie בשם `session` עם הגדרת `httpOnly` ותפוגה של 30 ימים, וכן בתשובת הJSON.</br>
> יש לשים לב שייתכן שסשן יפוג קודם, לדוגמה במקרה של שינוי סיסמה.
> ניתן לבטל את הטוקן באופן יזום ע"י שליחת בקשה לכתובת הlogout בצירוף הסשן כעוגיה/header, כנ"ל.

</details>

כל הפרמטרים הם חובה, אלא אם כן צוין אחרת.

להלן תיעוד בסיסי של הנתיבים שקיימים כרגע והפרמטרים שהם דורשים, מחולק לפי פונקציונליות; יש לחוץ על שם המקטע כדי להרחיב/לכווץ את הפירוט.

<details>
<summary>users</summary>

## users

APIs תחת הנתיב `/api/users`. מכילים פעולות הקשורות למשתמשים.

#### signup

הרשמת משתמש חדש.

```
    POST /api/users/signup
```

**body:**

- email
- password

**Active session required**: no

#### login

התחברות למשתמש קיים.

```
    POST /api/users/login
```

**body**:

- email
- password

**Active session required**: no

#### log out

התנתקות ומחיקת הסשן הפעיל מהדאטהבייס.

```
    POST /api/users/logout
```

**Active session required**: yes

#### send verify email

בקשת שליחת מייל אימות למייל המשתמש המחובר כעת.

```
    POST /api/users/send-verification-email
```

none parameters.

**Active session required**: yes

#### verify

אימות מייל עבור המשתמש המחובר כעת.

```
    POST /api/users/verify
```

**body**:

- code [5 digits]

**Active session required**: yes

### forgot password

בקשת שליחת מייל לאיפוס סיסמה.

```
    POST /api/users/forgot-password
```

**body**:

- email

**Active session required**: no

### change password

שינוי סיסמה באמצעות קוד אימות.

```
    POST /api/users/change-password
```

**body**:
    - email
    - newPassword
    - token [5 digits]

**Active session required**: no

</details>

<details>
<summary>feeds</summary>

## feeds

APIs תחת הנתיב `/api/feeds`. מכילים פעולות הקשורות לערוצי העדכונים (RSS). בקבלת מידע על פיד, מושמטים פרטים על משתמשים אחרים שנרשמו לפיד.

#### get all feeds

קבלת כל הפידים הקיימים במערכת.

```
    GET /api/feeds
```

**Active session required**: yes

#### get specific feed

מחזיר פיד ספציפי.

```
    GET /api/feeds/:id
```

**params**:

- id [feed id - mongo id]

**Active session required**: yes

#### create new feed

יצירת פיד חדש.
באם הוגדרה רשימה לבנה - כפוף להיצאות הםיד תחת דומיין מורשה.

```
    POST /api/feeds
```

**body**:
    - url [feed url. prefix - etc. '/feed' is required]

**Active session required**: yes

</details>

<details>
<summary>subscriptions</summary>

## subscriptions

ניהול הרשמות לפידים (קבלה למייל של כל תוכן חדש בפיד המנוי).

#### subscribe to feed

הרשמה לקבלת עדכונים למייל עבור פיד מסוים.

```
    POST /api/subscriptions/:feedId
```

**params**:
    - feedId [mongo id]

**Active session required**: yes

#### unsubscribe from feed

ביטול הרשמה לקבלת עדכונים למייל עבור פיד מסוים.

```
    DELETE /api/subscriptions/:feedId
```

**params**:
    - feedId [mongo id]

**Active session required**: yes

#### unsubscribe from all feeds

ביטול כל המנויים הקיימים עבור המשתמש המחובר.
כרגע לא ממומש בקליינט.

```
    POST /api/subscriptions/unsubscribe-all
```

none parameters.

**Active session required**: yes

</details>

<details>
<summary>general</summary>

## general

APIs תחת הנתיב `/api/general`. עבור פעולות כלליות

#### get statistics

קבלת סטטיסטיקות כלליות עבור המערכת.

```
    GET /api/general/statistics
```

none parameters.

**Active session required**: no
</details>

# self-hosted

הגרסה הציבורים מכילה הגבלות שונות, הן בכמות העדכונים שניתן להירשם, והן ברשימה לבנה של אתרים שאליהם ניתן להירשם. הפתרון לכך הוא אירוח עצמי של הפרויקט;

דרישות:

- nodejs
- mongodb URI - לוקאלי או מרוחק (ניתן לפתוח מסד בחינם ב<https://mongodb.com>)
- משתמש Google עם "סיסמה לאפליקציה" עבור Gmail.

חובה להריץ את כל הפקודות לפי הסדר.</br>
פקודת `npm run configure` מפעילה סקריפט אינטראקטיבי ליצירת קובץ `config.json`.</br>
משתני סביבה **ידרסו** את ההגדרות שבקובץ ה-json.

- 🧰 Clone the code:
  - `git clone https://github.com/ShlomoCode/rss-tracker-server`
- 📦 Install dependencies:
  - `npm install`
- ⚙️ Configure the app:
  - `npm run configure`
- 🏃 Run the server:
  - `npm start`

אחרי הגדרת הקונפיג, יש לנווט בשורת הפקודה לתקיה, ולהריץ `npm start`.

# Libraries used in this project (server side)

<details>

- morgan - logger

- nodemon - refresh the server on file change

- express - http server

- cookie-parser - parse cookies in the server side

- mongoose - connecting to mongoDB

- rss-to-json - get rss feed and convert it to json

- nodemailer - send emails

- zxcvbn-ts - to check the strength of the password

- bcrypt - to encrypt the password

- html-entities - לטיפול באתרים ששולחים בפיד את התוים המיוחדים (מירכאות לדוגמה) בפורמט [HTML Entities](https://www.w3schools.com/html/html_entities.asp)

- html-metadata-parser - get image from html for sites that don't support og:image (JDN example)

- image-to-base64 - download image from url and convert it to base64

- prompts - to get the user input in the configuration process (setup.js file)

- ms - convert milliseconds to human readable format or time in string to milliseconds

- ejs - template engine - emails templates

- javascript-time-ago - convert time to human readable format (for emails)

- express-async-errors - to handle async errors in express

- cross-env - Setting environment variables in the command line (for cross-platform)

- colors - to print colors in the console

- ajv - to validate the requests

- validator - to validate the input

- module-alias - to use aliases in the paths require()

- sanitize-html - to sanitize the html

- cheerio - apply changes to the html before send to client

<details>
