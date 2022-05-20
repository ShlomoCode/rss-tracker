$('#unsubscribe').on('mouseover', () => {
    $('.emoji .mouth').removeClass('happy');
    $('.emoji .mouth').addClass('sad');
    $(this).on('mouseout', () => {
        $('.emoji .mouth').removeClass('sad');
    });
});

$('#cancel').on('mouseover', () => {
    $('.emoji .mouth').removeClass('sad');
    $('.emoji .mouth').addClass('happy');
    $(this).on('mouseout', () => {
        $('.emoji .mouth').removeClass('happy');
    });
});

async function unsubscribe () {
    const notifier = new AWN();
    notifier.asyncBlock(axios.post('/api/subscriptions/unsubscribe-all'), (resp) => {
        console.log(resp.data);
        notifier.info(`ביטלת בהצלחה את הרשמתך לכל המינויים (היית מנוי ל-${resp.data.feedsUnsubscribedCount} מינויים)`);
        setTimeout(() => {
            window.location.href = '/';
        }, 2700);
    }
    , (err) => {
        console.log(err.response);
        notifier.alert(err.response.data?.message);
    });
}
$('#unsubscribe').on('click', unsubscribe);