const cheerio = require('cheerio');
const sanitizeHtmlLib = require('sanitize-html');
const htmlSanitizer = require('@/utils/htmlSanitizer');

function exposeFeed (feed, userId) {
    const publicFeed = feed?.toObject ? feed.toObject() : feed;
    return {
        ...publicFeed,
        id: publicFeed._id,
        _id: undefined,
        subscribers: publicFeed.subscribers.length,
        isSubscribe: publicFeed.subscribers.toString().includes(userId)
    };
}

function exposeArticle (article, userId, { onlyDescription } = {}) {
    const publicArticle = article?.toObject ? article.toObject() : article;
    article.title = article.title.replace(/([א-ת] )(צפו)/, '$1• $2');
    if (onlyDescription) {
        delete publicArticle.content;
        const sensitizedDescription = sanitizeHtmlLib(publicArticle.description, {
            allowedTags: ['p', 'a'],
            allowedAttributes: {
                a: ['href']
            }
        });
        const $description = cheerio.load(sensitizedDescription);
        const descriptionReal = $description.root().find('p:first');
        return {
            ...publicArticle,
            readBy: publicArticle.readBy?.length || 0,
            readByMe: publicArticle.readBy?.toString().includes(userId) ?? false,
            id: publicArticle._id,
            _id: undefined,
            description: descriptionReal.html()
        };
    } else {
        const sensitizedContent = htmlSanitizer(publicArticle.content);
        const $content = cheerio.load(sensitizedContent);
        $content.root().find('a').attr('target', '_blank');
        $content.root().find('iframe').attr({ height: '597px', width: '1047px' });
        $content.root().find('iframe').not('[src]').remove();
        $content.root().find('.advads-marketing-content-in-the-content-of-the-article').remove();

        const sensitizedDescription = sanitizeHtmlLib(publicArticle.description, {
            allowedTags: ['p', 'a'],
            allowedAttributes: {
                a: ['href']
            }
        });
        const $description = cheerio.load(sensitizedDescription);
        const descriptionReal = $description.root().find('p:first');
        return {
            ...publicArticle,
            _id: undefined,
            id: publicArticle._id,
            readBy: publicArticle.readBy?.length || 0,
            readByMe: publicArticle.readBy?.toString().includes(userId) ?? false,
            content: $content.html(),
            description: descriptionReal.html()
        };
    };
}

module.exports = {
    exposeFeed,
    exposeArticle
};