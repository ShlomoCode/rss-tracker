/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
const { parse: rssToJson } = require('rss-to-json');
/**
 * קבלת פיד בתור אובייקט תקין
 * @param {string} urlFeed כתובת אינטרנט של הפיד המבוקש
 * @returns {Object} title, items[array], link
 */
module.exports = async (urlFeed) => {
    const rssObject = await rssToJson(urlFeed);
    return {
        title,
        items,
        link
    } = rssObject;
};
