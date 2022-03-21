  

# RSS TO MAIL

פרויקט nodeJS למעקב אחרי פידי RSS ושליחת העדכונים למייל.

כולל הרשמה, התחברות ואימות מייל.

מיועד לעלות בסוף על הרקו, מתאים גם להפעלה לוקאלית במחשב.

  

# API

`/api/users`

* login - `post`

* signup - `post`

* verify - `post`

* unsubscribe - `patch`

* delete - `post` (for admin only)

  

`/api/feeds`:

  

`get`:

* get all feeds (for registered only)

* get feed (for registered only)

  

`post`:

* create feed (for registered only)

  

`delete` (feed id parameter requied):

* delete feed - for admin only

  

`/api/feeds/Subscribe` (feed id parameter requied):

*  `post` - Subscribe

*  `delete` - UnSubscribe

  

`/api/status` - `get`:

* get server status

  

# אירוח עצמי של rss to mail

הגרסה הציבורים מכילה הגבלות שונות, הן בכמות העדכונים שניתן להירשם (בגלל מגבלה של גוגל על כמות שליחת המיילים), והן ברשימה לבנה של אתרים שאליהם ניתן להירשם (ע"מ שהאתר יהיה פתוח בסינונים השונים).
הפתרון לכך הוא אירוח עצמי של הפרויקט;

  

## פריסה לוקאלית

  

### config

הקונפיג מוגדר בקובץ `config.env` תחת התקיה הראשית של הפרויקט.

  

[פרטים נוספים על התחביר](https://www.npmjs.com/package/dotenv  "פרטים נוספים על התחביר").

#### ערכי חובה

```

MONGO_URI # כתובת URI של מסד נתונים mongoDB.

gmail_user # כתובת אימייל של gmail שממנה ישלחו המיילים

gmail_password # סיסמת החשבון - יש להפעיל גישה ל"אפליקציות לא מאובטחו", או (מומלץ!) להפעיל אימות דו שלבי ולהשתמש ב"סיסמה לאפליקציה".

JWT_KEY # מפתח ההצפנה עבור jwt. ניתן להכניס ערך רנדומלי.

```

#### ערכים אופציונליים

```

countMaxFeedsForUser = 10 # מספר הפידים המרבי שכל יוזר יוכל להירשם אליו, ברירת מחדל: 10

PORT # הפורט שבו האתר יהיה זמין - רלוונטי רק עבור אתר שפועל בlocalhost. ברירת מחדל: 80.

WEB_SITE_ADDRESS # אם האתר פועל ברשת, לדוגמה על שרת VPS ולא על localhost/heroku. דוגמה: https://my-syte.com

White_list_including_images="hm-news.co.il|jdn.co.il|93fm.co.il|bahazit.co.il" # אתרים שבהם הפידים יישלחו כולל תמונה

White_list_does_not_include_images="pinatkafe.com|internet-israel.com|geektime.co.il" # אתרים שבהם הפידים יישלחו ללא תמונה

```

## פריסה מהירה על הרקו

יש ללחוץ על הכפתור 👇👇 ולמלא את הפרטים הנדרשים:

* mongoDB uri

* gmail - username

* gmail - password

ניתן למלא גם את הקונפיג האופציונלי.

  

<div  align='center'>

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ShlomoCode/rss-to-mail/tree/master)

</div>

  
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
לאחר מכן יש להוסיף בטריגרים הפעלה מתוזמנת כל פחות מ-30 דקות.
כעת גוגל סקריפט ישלח בקשות דמה לאתר, ו"יעיר" אותו. בנוסף, אם האפליקציה בהרקו קרסה - תקבלו על כך מייל עדכון לכתובת שציינתם במשתנה `emailAddress`.

# ספריות בשימוש:

## צד שרת

* morgan - לוגר בקשות

* nodemon - לרענון אוטומטי של הרשת בכל שינוי

* express - שרת HTTP

* mongoose - התממשקות עם הדאטה בייס

* rss-to-json - קבלת הפידים כjson

* nodemailer - שליחת המיילים

* zxcvbn - בדיקת חוזק סיסמאות

* bcrypt - הצפנה ואימות לסיסמאות המשתמשים

* jsonwebtoken - ליצירת הטוקן (ואימות שלו במידלוורס)

* html-entities - לטיפול באתרים ששולחים בפיד את התוים המיוחדים (מירכאות לדוגמה) בפורמט [HTML Entities](https://www.w3schools.com/html/html_entities.asp)

* html-metadata-parser - לקבלת תמונת הכתבה עבור אתרים שלא מחזירים תמונה בפיד, כגון JDN

* image-to-base64 - להורדת התמונה והמרתה לbase64

* dotenv - קונפיג

* cookie-parser - קבלת העוגיות בצד השרת

## צד לקוח

* [jQuery](https://jquery.com)

* [axios](https://github.com/axios/axios)

* [js-cookie](https://github.com/js-cookie/js-cookie)

* [awesome-notifications](https://f3oall.github.io/awesome-notifications)

* [sweet](https://www.npmjs.com/package/sweetalert)
