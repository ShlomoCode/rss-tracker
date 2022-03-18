const Feed = require('../api/models/feed');
const User = require('../api/models/user');
const parseRss = require('./rss2json');
const sendMail = require('./emails');
const { parser: parseHtml } = require('html-metadata-parser');

async function main() {
    console.log('processingFeeds started...');
    const feedsRew = await Feed.find();

    if (feedsRew.length === 0) {
        return console.log('feeds not found!');
    }

    const feeds = feedsRew.filter((feed) => {
        if (feed.Subscribers.length === 0) {
            return false;
        } else {
            return true;
        }
    });

    if (feeds.length === 0) {
        return console.log('return: No feeds with subscribers found!');
    } else {
        console.log(`${feeds.length} feeds with subscribers were found`);
    }

    for (const feed of feeds) {
        const AddressesToSend = [];
        for (let i = 0; i < feed.Subscribers.length; i++) {
            const user = await User.findById(feed.Subscribers[i]);
            if (user?.verifyEmailStatus === true) {
                AddressesToSend.push(user.emailFront);
            } else {
                console.log(`userID ${feed.Subscribers[i]} doesn't have a verified email. Removed from list.`);
            }
        }

        if (AddressesToSend.length === 0) {
            continue;
        }

        let feedContent;
        try {
            feedContent = await parseRss(feed.url);
        } catch (error) {
            console.log(`error: ${error}`);
            continue;
        }

        const dateOfProcessing = new Date();

        const { title: feedTitle, items } = feedContent;

        for (const item of items) {
            const { LastCheckedOn } = feed;

            const pubDate = new Date(item.published);
            const checkDate = new Date(LastCheckedOn);

            if (pubDate > checkDate) {
                if (/\[מקודם\]/gm.test(item.description)) {
                    console.log(`An advertisement has been removed: ${item.title}\n${item.description}`);
                    continue;
                }

                if (!item.thumbnail) {
                    const htmlFeedLink = await parseHtml(item.link);
                    item.thumbnail = htmlFeedLink.og.image;
                }
                await sendMail.rss(item, feedTitle, AddressesToSend);
            } else {
                console.log(`Outdated item: ${item}`);
            }
        }

        await Feed.findByIdAndUpdate(feed._id, { LastCheckedOn: dateOfProcessing });
    }
    console.log('Processing Completed.');
}

module.exports = main;
