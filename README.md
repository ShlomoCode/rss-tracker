
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
* `post` - Subscribe
* `delete` - UnSubscribe

`/api/status` - `get`:
* get server status

# אירוח עצמי של rss to mail
הגרסה הציבורים מכילה הגבלות שונות, הן בכמות העדכונים שניתן להירשם (בגלל מגבלה של גוגל על כמות שליחת המיילים), והן ברשימה לבנה של אתרים שאליהם ניתן להירשם (ע"מ שהאתר יהיה פתוח בסינונים השונים).
הפתרון לכך הוא אירוח עצמי של הפרויקט.

## פריסה לוקאלית

### config
הקונפיג מוגדר בקובץ `config.env` תחת התקיה הראשית של הפרויקט.

[פרטים נוספים על התחביר](https://www.npmjs.com/package/dotenv "פרטים נוספים על התחביר").
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
```
## פריסה מהירה על הרקו

<div align='center'>
 
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ShlomoCode/rss-to-mail/tree/master)
</div>

# ספריות בשימוש:
* morgan - loger
* nodemon - לרענון אוטומטי של הרשת בכל שינוי
* express - שרת HTTP
* mongoose - התממשקות עם הדאטה בייס
* rss-to-json - קבלת הפידים כjson
* nodemailer - שליחת המיילים
* zxcvbn - בדיקת חוזק סיסמאות
* bcrypt - הצפנה ואימות לסיסמאות המשתמשים
* jsonwebtoken - ליצירת הטוקן (ואימות שלו במידלוור)
* html-entities - לטיפול באתרים ששולחים בפיד את התוים המיוחדים (מירכאות לדוגמה) בפורמט [HTML Entities](https://www.w3schools.com/html/html_entities.asp)
* html-metadata-parser - לקבלת תמונת הכתבה עבור אתרים שלא מחזירים תמונה בפיד, כגון JDN
* image-to-base64 - להורדת התמונה והמרתה לbase64
* dotenv - קונפיג
