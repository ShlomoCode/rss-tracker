function onLoggedOut () {
    const notifier = new AWN();
    notifier.confirm('The page will reload in 2.5 seconds...', () => location.reload(), false, {
        labels: {
            confirm: 'YOU HAVE SUCCESSFULLY LOGGED OUT'
        }
    });
    setTimeout(() => {
        location.reload();
    }, 2500);
}

const notifier = new AWN({
    position: 'bottom-left'
});

async function createCostumFeed () {
    const value = await swal(
        `
    הכנס כאן כתובת אתר/קטגוריה/תגית וכדו' למעקב.
    ניתן להכניס גם קישור ישיר לפיד`,
        {
            content: 'input',
            buttons: ['cannel', 'OK']
        }
    );

    if (value === null) {
        return notifier.info('בוטל בהצלחה!');
    }

    if (!/^https?:\/\/[\w-]+\.\w\w+/.test(value)) {
        return notifier.alert('לא זוהתה כתובת אתר תקינה!');
    }

    let url = value;
    url = url.replace(/(\/$)/, '');
    if (!/feed/.test(value)) {
        url = url + '/feed';
    }

    notifier.asyncBlock(
        axios.post('/feeds', { url }),
        (resp) => {
            console.log(resp.data);
            PushFeedToPage(resp.data.feed);
            notifier.success('הפיד נוצר בהצלחה. כעת ניתן להירשם אליו');
        },
        (err) => {
            if (err.response.data?.message === 'Feed exists') {
                notifier.alert('הפיד הזה כבר קיים<br>...נסה להירשם אליו');
            } else {
                notifier.alert(`${err.response.status}: ${err.response.data.message}`);
            }
            console.log(err.response);
        },
        '...יוצר פיד'
    );
}

async function loadFeeds () {
    $('.feed-item').remove();

    const notifier = new AWN({ position: 'bottom-left' });
    notifier.asyncBlock(axios.get('/feeds'), (resp) => {
        const feeds = resp.data.feeds;

        if (feeds.length === 0) {
            return notifier.alert('עדיין אין פידים במערכת.<br>אתה יכול ליצור אחד... :)');
        }

        for (let i = 0; i < feeds.length; i++) {
            PushFeedToPage(feeds[i], [i]);
        }

        notifier.info(`${feeds.length} feeds has been loaded!`);
    });
}

function PushFeedToPage (feedItem) {
    const { title, subscriberSelf, Subscribers, _id, url } = feedItem;
    const item = `<div id="${_id}" class="feed-item">
    <h3><a href="${url.replace('/feed', '')}" target="_blank">${title}</a></h3>
    <div class="members-item-count" dir="rtl"><span>${Subscribers}</span> מנויים</div>
    <button class="Subscribe-btn">${subscriberSelf ? '➖ Unsubscribe' : '➕ Subscribe'}</button>
    </div>`;
    $('#feeds').append(item);
    if (subscriberSelf) {
        $(`#${_id} .Subscribe-btn`).on('click', () => {
            unsubscribe(_id);
        });
    }
    if (!subscriberSelf) {
        $(`#${_id} .Subscribe-btn`).on('click', () => {
            subscribe(_id);
        });
    }
}

async function subscribe (feedID) {
    notifier.asyncBlock(
        axios.post(`/subscriptions/${feedID}`),
        (resp) => {
            const feedElement = $(`#${feedID} .Subscribe-btn`);
            feedElement.off('click');
            feedElement.on('click', () => {
                unsubscribe(feedID);
            });
            feedElement.text('➖ Unsubscribe');
            const subscribersCount = $(`#${feedID} .members-item-count > span`).text();
            $(`#${feedID} .members-item-count > span`).text(parseInt(subscribersCount) + 1);
            notifier.success('נרשמת בהצלחה');
        },
        (err) => {
            console.log(err.response);

            if (err.response.status === 429) {
                return notifier.alert(err.response.data.message);
            }

            if (err.response.status === 409) {
                return notifier.alert('אתה כבר רשום לפיד זה');
            }

            notifier.alert(err.response.data?.message);
        },
        '...נרשם'
    );
}

async function unsubscribe (feedID) {
    notifier.asyncBlock(
        axios.delete(`/subscriptions/${feedID}`),
        (resp) => {
            const feedElement = $(`#${feedID} .Subscribe-btn`);

            feedElement.off('click');

            feedElement.on('click', () => {
                subscribe(feedID);
            });

            feedElement.text('➕ Subscribe');

            const subscribersCount = $(`#${feedID} .members-item-count > span`).text();
            $(`#${feedID} .members-item-count > span`).text(parseInt(subscribersCount) - 1);

            notifier.success('הוסרת בהצלחה');
        },
        (err) => {
            if (err.response.status === 409) {
                return notifier.alert('כבר ביטלת את הרשמתך לפיד זה');
            }

            console.log(err.response);
            notifier.alert(err.response.data?.message);
        },
        '...מסיר'
    );
}

$('#sign-out').on('click', () => {
    Cookies.remove('token');
    onLoggedOut();
});

$('#add-costum-feed').on('click', createCostumFeed);

// refresh feeds
$('#refresh-feeds').on('click', () => {
    loadFeeds();
});

// טעינת הפידים מיד בטעינת הדף
loadFeeds();