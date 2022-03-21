function onLoggedOut() {
    const notifier = new AWN();
    function onOkClick() {
        location.reload();
    }
    notifier.confirm('Please refresh!', onOkClick, false, {
        labels: {
            confirm: 'You have successfully logged out'
        }
    });
}

const notifier = new AWN({
    position: 'bottom-left'
});

async function createCostumFeed() {
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
            notifier.success('הפיד נוצר בהצלחה. כעת ניתן להירשם אליו');
        },
        (err) => {
            if (err.response.data.message === 'Feed exists') {
                notifier.alert('הפיד הזה כבר קיים<br>...נסה להירשם אליו');
            } else {
                notifier.alert(`${err.response.status}: ${err.response.data.message}`);
            }
            console.log(err.response);
        },
        '...יוצר פיד'
    );
}

async function loadFeeds() {
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

        notifier.success(`${feeds.length} feeds has been loaded!`);
    });
}

function PushFeedToPage(feedItem) {
    const { title, subscriberSelf, Subscribers, _id, url } = feedItem;
    const item = `<div id="${_id}" class="feed-item">
    <h3><a href="${url.replace('/feed', '')}" target="_blank">${title}</a></h3>
    <div class="members-item-count"><span>${Subscribers}</span> מנויים</div>
    <button class="Subscribe-btn">${Subscribers ? '➖ Unsubscribe' : '➕ Subscribe'}</button>
    </div>`;
    $('#feeds').append(item);
    if (subscriberSelf === true) {
        $(`#${_id} .Subscribe-btn`).on('click', () => {
            unsubscribe(_id);
        });
    }
    if (subscriberSelf === false) {
        $(`#${_id} .Subscribe-btn`).on('click', () => {
            subscribe(_id);
        });
    }
}

async function subscribe(feedID) {
    notifier.asyncBlock(
        axios.post(`/feeds/subscribe/${feedID}`),
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

async function unsubscribe(feedID) {
    notifier.asyncBlock(
        axios.delete(`/feeds/subscribe/${feedID}`),
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

async function getVerifyCode() {
    const code = await swal({
        title: '!שים לב',
        icon: 'warning',
        text: `!המייל שלך לא מאומת
 
  .לא תוכל לקבל עדכונים מהמערכת עד שתאמת אותו
 
 חפש את מייל האימות מהמערכת (ייתכן שהוא הגיע לספאם או ל"קידומי מכירות") ולחץ על קישור האימות, או הכנס בתיבה שלמטה את הקוד`,
        content: {
            element: 'input',
            attributes: {
                placeholder: 'Enter here the verification code'
            }
        },
        buttons: ['התעלם כרגע', 'שלח']
    });

    if (code === null) {
        return notifier.tip('כל עוד המייל שלך לא יהיה מאומת, לא תקבל עדכונים מהמערכת', { labels: { tip: 'שים לב' } });
    }

    if (!/^[0-9]{5,6}$/.test(code)) {
        return notifier.alert('!לא זוהה קוד אימות תקין');
    }
    notifier.asyncBlock(
        axios.post('/users/verify', {
            verifyCode: code
        }),
        (resp) => {
            notifier.success('!המייל אומת בהצלחה');
            $('#email-verification-status').text(' המייל מאומת').removeClass('far fa-times-circle').removeClass('Not-Verified').addClass('fas fa-check-circle').off('click');

            // setTimeout(() => {
            //     location.reload();
            // }, 1400);
        },
        (err) => {
            notifier.alert(err.response.data.message);
        }
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
(async() => {
    const resp = await axios.get('/users/My-Status');
    $('#Hello #content').text(`שלום, ${resp.data.user.name}!`);
    switch (resp.data.user.verifyEmailStatus) {
    case true:
        $('#email-verification-status').text(' המייל מאומת').addClass('fas fa-check-circle');
        break;
    case false:
        // $('#email-verification-status').html(`<i class="far fa-times-circle"></i>  המייל לא מאומת!`)
        $('#email-verification-status').text(' המייל לא מאומת!').addClass('far fa-times-circle').addClass('Not-Verified').click(getVerifyCode);
        getVerifyCode();
        break;
    }
    // console.log(resp.data);
})();
