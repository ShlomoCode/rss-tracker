const Feed = require('../api/models/feed');
const User = require('../api/models/user');
const parseRss = require('./rss2json');
const sendMail = require('./emails');
const { parser: parseHtml } = require('html-metadata-parser');

async function main () {
    console.log('processingFeeds started...');
    const feedsRew = await Feed.find();

    if (feedsRew.length === 0) {
        console.log('return: feeds not found!');
        return 'Wait!';
    }

    const feeds = feedsRew.filter((feed) => {
        if (feed.Subscribers.length === 0) {
            return false;
        } else {
            return true;
        }
    });

    if (feeds.length === 0) {
        console.log('return: 0 feeds with subscribers found!');
        return 'Wait!';
    } else {
        console.log(`${feeds.length} feeds with subscribers were found`);
    }

    for (const feed of feeds) {
        const AddressesToSend = [];
        for (let i = 0; i < feed.Subscribers.length; i++) {
            const user = await User.findById(feed.Subscribers[i]);

            if (!user) {
                try {
                    const feedsUnsubscribedCount = await Feed.updateMany({ Subscribers: feed.Subscribers[i] }, { $pull: { Subscribers: feed.Subscribers[i] } });
                    console.log(`userID ${feed.Subscribers[i]} Not Found. Removed from list and unsubscribed from ${feedsUnsubscribedCount.modifiedCount} feeds`);
                } catch (error) {
                    console.log(`userID ${feed.Subscribers[i]} Not Found. Removed from list (Not removed from feed due to error).`);
                }
                continue;
            }

            if (user?.verifyEmailStatus === true) {
                AddressesToSend.push(user.emailFront);
            } else {
                console.log(`userID ${feed.Subscribers[i]} doesn't have a verified email. Removed from list.`);
            }
        }

        if (AddressesToSend.length === 0) {
            console.log(`No subscriptions with verified email were found in feedID ${feed._id} (${feed.title})! Continued the next feed.`);
            continue;
        }

        let feedContent;
        try {
            feedContent = await parseRss(feed.url);
        } catch (error) {
            console.log(`Error accessing to feed page - ${feed.url}:
            ${error}`);
            continue;
        }

        const dateOfProcessing = new Date();

        const { title: feedTitle, items } = feedContent;

        for (const item of items) {
            const { LastCheckedOn } = feed;

            const pubDate = new Date(item.published);
            const checkDate = new Date(LastCheckedOn);

            if (pubDate > checkDate) {
                if (/\[מקודם\]/gm.test(item.description) || item.category.includes('דביק - פנים האתר') || item.category.includes('דביק - עמוד הבית') || (/^https:\/\/www\.jdn\.co\.il/.test(feed.url) && /&gt;&gt;<\/strong><\/a><\/p>/m.test(item.content))) {
                    console.log(`An advertisement has been removed: ${item.title}\n${item.description}`);
                    continue;
                }

                if (!item.thumbnail) {
                    try {
                        const htmlArticle = await parseHtml(item.link);
                        item.thumbnail = htmlArticle.og.image;
                    } catch (error) {
                        console.log(`An error accessing the article page ${item.link}`);
                        item.thumbnail = undefined;
                    }
                }

                console.log(`New article found: ${item.title}; sending email to ${address.length} subscribers...`);
                await sendMail.rss(item, feedTitle, address);
            } else {
                console.log('Outdated item. Skipped');
            }
        }

        await Feed.findByIdAndUpdate(feed._id, { LastCheckedOn: dateOfProcessing });
    }
    console.log('Processing Completed.');
}

module.exports = main;
