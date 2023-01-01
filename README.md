## The project is at work. see [#refactor](https://github.com/ShlomoCode/rss-tracker-server/pull/2)
# Rss Tracker - Server side

פרויקט למעקב אחרי תכנים מאתרים שתומכים בטכנולוגיית [RSS](https://he.wikipedia.org/wiki/RSS), לדוגמה בלוגים ואתרי חדשות.</br>
מאפשר לקבל כל אייטם חדש ישירות למייל, או לצפות בתוכן בממשק אינטרנטי מעוצב ורספונסיבי בצורה מלאה.</br>

**טכנולוגיות**:</br>
צד שרת: Node.js + MongoDB</br>
צד לקוח: Vue.js + Vuetify

# Screenshots
<img src="https://user-images.githubusercontent.com/78599753/209749571-3cb9b2c8-3f05-4bd8-af29-7d35c852f068.png" width="45%"></img>
<img src="https://user-images.githubusercontent.com/78599753/209747399-87f6902f-9818-4043-902b-45770c64e899.png" width="45%"></img>
<img src="https://user-images.githubusercontent.com/78599753/209749823-22679ebf-08e8-4656-b7a8-753cb4e8bda8.png" width="45%"></img>
<img src="https://user-images.githubusercontent.com/78599753/209749095-17e3fdf8-b9d0-4bae-85b0-a47a491283bb.png" width="45%"></img> 

# Self-hosted

הגרסה הציבורית מכילה הגבלות שונות, הן בכמות הפידים שניתן להירשם אליהם, והן ברשימה לבנה של אתרים שאליהם ניתן להירשם. הפתרון לכך הוא אירוח עצמי של הפרויקט;

דרישות:

- nodejs
- mongodb URI - לוקאלי או מרוחק (ניתן לפתוח מסד בחינם ב<https://mongodb.com>)
- משתמש Google עם "סיסמה לאפליקציה" עבור Gmail.

חובה להריץ את כל הפקודות לפי הסדר.</br>
פקודת `npm run configure` מפעילה סקריפט אינטראקטיבי ליצירת קובץ `config.json`.</br>
משתני סביבה **ידרסו** את ההגדרות שבקובץ ה-json.

שימו לב! בנוסף יש להוריד את קבצי הקליינט - https://github.com/ShlomoCode/rss-tracker-client, להריץ את הפקודה `npm run build` ולהעלות את תוכן התיקייה `dist` לתוך התקיה `public` בתקיית הסרבר, או להגיש עצמאית את הקבצים באמצעות nginx, apache או כל שרת קבצים אחר.

- 🧰 Clone the code:
  - `git clone https://github.com/ShlomoCode/rss-tracker-server`
- 📦 Install dependencies:
  - `npm install`
- ⚙️ Configure the app:
  - `npm run configure`
- 🏃 Run the server:
  - `npm start`

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

</details>
