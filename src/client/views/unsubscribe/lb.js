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
    notifier.asyncBlock(axios.delete('/api/users/unsubscribe'), (resp) => {
        console.log(resp.data);
        notifier.info(`הוסרת בהצלחה, ובוטלה הרשמתך ל${resp.data.feedsUnsubscribedCount} מינויים`);
    }
    , (err) => {
        console.log(err.response);
        notifier.alert(err.response.data.message);
    });
}
$('#unsubscribe').on('click', unsubscribe);