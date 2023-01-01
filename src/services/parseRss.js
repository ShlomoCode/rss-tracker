/* eslint-disable no-undef */
const { parse } = require('rss-to-json');
const { decode } = require('html-entities');
/**
 * @param {string} feedUrl כתובת אינטרנט של הפיד המבוקש
 * @returns {Object} title, items[array], link
 */
module.exports = async (feedUrl) => {
    const resObject = { title, items, link } = await parse(feedUrl);
    resObject.title = decode(title);
    resObject.items = resObject.items.map((item) => {
        if (item.title) item.title = decode(item.title);
        if (item.content) {
            item.content = item.content.replace(/<p>הפוסט <a (:?rel="nofollow" )?href="https?:\/\/.+">.+<\/a> הופיע לראשונה ב-<a rel="nofollow" href="https?:\/\/.+">.+<\/a>\.<\/p>/gm, '');
            item.content = item.content.replaceAll(/<p>The post <a rel="nofollow" href="https?:\/\/.+">.+<\/a> (appeared first|first appeared ) on <a rel="nofollow" href="https:\/\/.+">.+<\/a>\.?<\/p>/gm, '');
        }
        return item;
    });
    return resObject;
};