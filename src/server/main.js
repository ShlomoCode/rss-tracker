const Feed = require('@/models/feed');
const User = require('@/models/user');
const parseRss = require('@services/rss2json');
const emailSends = require('@services/email');
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
        const dateOfProcessing = new Date();
        const users = await Promise.all(feed.Subscribers.map(async (userId) => {
            const user = await User.findById(userId);
            return user;
        }));
        const usersFiltered = users.filter((user) => {
            return Boolean(user && user.verified);
        });

        if (usersFiltered.length === 0) {
            console.log(`${feed.Title} has no subscribers`);
            try {
                console.log('Update lestCheckedAt & continue...');
                await Feed.findByIdAndUpdate(feed._id, { LastCheckedOn: dateOfProcessing });
            } catch (error) {
                console.log(error);
            }
            continue;
        }

        const addresses = usersFiltered.map((user) => {
            return user.emailFront;
        });

        let feedContent;
        try {
            feedContent = await parseRss(feed.url);
        } catch (error) {
            console.log(`Error accessing to feed page - ${feed.url}:
            ${error}`);
            continue;
        }

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
                        delete item.thumbnail;
                    }
                }

                console.log(`New article found: ${item.title}; sending email to ${addresses.length} subscribers...`);
                try {
                    const response = await emailSends.sendArticle({
                        item,
                        feedTitle,
                        feedUrl: feed.url,
                        toAddresses: addresses
                    });
                    console.log('Email sent: ' + response.response);
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log('Outdated item. Skipped');
            }
        }

        await Feed.findByIdAndUpdate(feed._id, { LastCheckedOn: dateOfProcessing });
    }
    console.log('Processing Completed.');
}

module.exports = main;
