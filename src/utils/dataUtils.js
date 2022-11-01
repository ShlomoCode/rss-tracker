function makePublicFeedFromMongoObject (mongoObject, userId) {
    const publicFeed = mongoObject.toObject();
    return {
        ...publicFeed,
        subscribers: publicFeed.subscribers.length,
        subscriberSelf: publicFeed.subscribers.toString().includes(userId),
    };
}

module.exports = {
    makePublicFeedFromMongoObject
};