# RSS TO MAIL
פרויקט nodeJS למעקב אחרי פידי RSS ושליחת העדכונים למייל.
כולל הרשמה, התחברות ואימות מייל.
מיועד לעלות בסוף על הרקו, מתאים גם להפעלה רגילה במחשב.

# API
`/api/users` - post
* login
* signup

`/api/feeds`:

get: 
* get all feeds
* get feed

post:
* create feed (for registers only)

patch (feed id farameter requied):
* update feed - Subscribe only

delete (feed id farameter requied):
* delete feed - for admin only

`/api/status` - get:
* get status server
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
