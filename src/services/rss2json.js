/* eslint-disable no-undef */
const { parse: rssToJson } = require('rss-to-json');
const { decode } = require('html-entities');
/**
 * קבלת פיד בתור אובייקט תקין
 * @param {string} urlFeed כתובת אינטרנט של הפיד המבוקש
 * @returns {Object} title, items[array], link
 */
module.exports = async (urlFeed) => {
    const resObject = {
        title,
        items,
        link
    } = await rssToJson(urlFeed);
    resObject.title = decode(title);
    resObject.items = resObject.items.map((item) => {
        if (item.title) item.title = decode(item.title);
        if (item.description) {
            item.description = item.description.replaceAll(/<p>The post <a rel="nofollow" href="https?:\/\/.+">.+<\/a> appeared first on <a rel="nofollow" href="https:\/\/.+">.+<\/a>\.?<\/p>/gm, '');
            item.description = item.description.replaceAll(/<p>הפוסט <a (?:rel="nofollow" )?href="https?:\/\/.+">.+<\/a> הופיע לראשונה ב-<a (?:rel="nofollow" )?href="https?:\/\/.+">.+<\/a>.<\/p>/g, '');
        }
        if (item.content) {
            item.content = item.content.replace(/<p>הפוסט <a (:?rel="nofollow" )?href="https?:\/\/.+">.+<\/a> הופיע לראשונה ב-<a rel="nofollow" href="https?:\/\/.+">.+<\/a>\.<\/p>/gm, '');
            item.content = item.content.replaceAll(/<p>The post <a rel="nofollow" href="https?:\/\/.+">.+<\/a> appeared first on <a rel="nofollow" href="https:\/\/.+">.+<\/a>\.?<\/p>/gm, '');
            item.content = item.content.replace(/<div class="advads-marketing-content-in-the-content-of-the-article.+/mgs, '');
        }
        return item;
    });
    return resObject;
};