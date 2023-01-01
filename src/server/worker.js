const Feed = require('@models/feed');
const User = require('@models/user');
const Article = require('@models/article');
const parseRss = require('@/services/parseRss');
const emailSends = require('@services/email');
const { parser: parseHtml } = require('html-metadata-parser');
const { exposeArticle } = require('@utils/exposes');
const ms = require('ms');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main () {
    const feeds = await Feed.find({ });
    if (!feeds.length) return sleep(ms('1m'));
    for (const feed of feeds) {
        const usersForEmail = await User.find({
            _id: { $in: feed.subscribers },
            enableEmailNotifications: true
        });

        let feedContent;
        try {
            feedContent = await parseRss(feed.url);
        } catch (error) {
            console.log(`Error accessing to feed page (${decodeURI(feed.url)}):\n${error}`);
            continue;
        }

        const { items } = feedContent;
        const articles = items.reverse().filter((article) => {
            const published = new Date(article.published);
            const now = new Date();
            const diff = now - published;
            if (diff > ms('30 days')) {
                return false;
            }
            if (/\[מקודם\]/gm.test(article.description) ||
                article.category.includes('דביק - פנים האתר') ||
                article.category.includes('דביק - עמוד הבית') ||
                (/^https:\/\/www\.jdn\.co\.il/.test(feed.url) && /&gt;&gt;<\/strong><\/a><\/p>/m.test(article.content))
            ) return false;
            return true;
        });

        if (!articles.length) continue;

        for (const article of articles) {
            const articleExists = await Article.findOne({ url: article.link });
            const articleRelatedToFeed = articleExists ? articleExists.feeds.includes(feed._id) : false;
            if (articleExists && articleRelatedToFeed) continue;
            if (!articleRelatedToFeed) {
                if (articleExists) {
                    await Article.updateOne({ _id: articleExists._id }, { $push: { feeds: feed._id } });
                } else {
                    if (!article.thumbnail) {
                        try {
                            const { og } = await parseHtml(article.link);
                            article.thumbnail = og.image;
                        } catch (error) {
                            delete article.thumbnail;
                        }
                    }
                    try {
                        await Article.create({
                            title: article.title,
                            url: article.link,
                            feeds: feed._id,
                            published: article.published,
                            author: article.author,
                            description: article.description,
                            content: article.content,
                            tags: article.category,
                            image: article.thumbnail
                        });
                    } catch (error) {
                        console.log(`Error in creating article: ${error}`);
                        continue;
                    }
                }
                if (usersForEmail.length) {
                    try {
                        await emailSends.sendArticle({
                            article: exposeArticle(article),
                            feedTitle: feed.title,
                            feedUrl: feed.url,
                            toAddresses: usersForEmail.map(user => {
                                return {
                                    address: user.emailFront,
                                    allowAttachmentsInEmail: user.allowAttachmentsInEmail
                                };
                            })
                        });
                    } catch (error) {
                        console.log(`Error in sending email: ${error}`);
                    }
                }
            }
        }
    }
    return sleep(ms('1m'));
}

module.exports = main;