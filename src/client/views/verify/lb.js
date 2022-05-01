const notifier = new AWN({ position: 'bottom-left' });
axios.defaults.baseURL = '/api';

const codes = document.querySelectorAll('.code');
codes[0].focus();

let keywordsIsActive = true;
for (const [indexCodeInput, codeInput] of codes.entries()) {
    $(codeInput).on('keydown', e => {
        const input = e.originalEvent.key;
        if (input === 'Backspace') {
            return setTimeout(() => codes[indexCodeInput - 1]?.focus(), 10);
        }
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(input) && keywordsIsActive) {
            if (input === 'Backspace') {
                return codes[indexCodeInput - 1]?.focus();
            }
            e.preventDefault(); // off default input
            codeInput.value = input;
            if (indexCodeInput === codes.length - 1) {
                return sendVerifyCodeToAuth([...codes].map(element => element.value).join(''));
            }
            codes[indexCodeInput + 1]?.focus();
        }
    });
}

function sendVerifyCodeToAuth (inputStringCode) {
    if (!/^[0-9]{5,6}$/.test(inputStringCode.replaceAll(' ', ''))) {
        return notifier.alert('!לא זוהה קוד אימות תקין');
    }
    keywordsIsActive = false;
    notifier.asyncBlock(
        axios.post('/users/verify', null, { params: { verifyCode: inputStringCode } }),
        (resp) => {
            notifier.success('כעת החשבון שלך פעיל', {
                labels: { success: '!המייל אומת בהצלחה' }
            });
            setTimeout(() => {
                open('/', '_self');
            }, 1400);
            keywordsIsActive = true;
        },
        (err) => {
            console.log(err.response.data);
            notifier.alert(err.response.data.message);
            if (/already verified/.test(err.response.data.message)) {
                return setTimeout(() => {
                    open('/', '_self');
                }, 1400);
            }
            for (const code of codes) {
                code.value = '';
            }
            codes[0].focus();
            keywordsIsActive = true;
        }
    );
}

if (location.search.split('?verifyCode=')[1]) {
    const codeSearch = location.search.split('?verifyCode=')[1];
    for (let i = 0; i < codes.length; i++) {
        codes[i].value = codeSearch.split('')[i];
    }
    sendVerifyCodeToAuth(codeSearch);
}

$('#log-out').on('click', () => {
    if (confirm('אתה בטוח שברצונך להתנתק מהחשבון?')) {
        Cookies.remove('token');
        notifier.tip('התנתקת בהצלחה');
        setTimeout(() => {
            open('/login', '_parent');
        }, 1400);
    }
});

$('#again-send-verification-email').on('click', async () => {
    const confirmSend = await swal({
        title: 'האם אתה בטוח שברצונך לשלוח את המייל שוב?',
        text: 'ייתכן שהמייל נכנס לקידומי מכירות/ספאם, יש לבדוק שם לפני בקשת שליחה חוזרת.\nשימו לב - ניתן לבקש שליחה חוזרת רק פעם ביום!',
        icon: 'warning',
        buttons: {
            cancel: true,
            confirm: 'שלח בכל זאת'
        }
    });

    if (confirmSend) {
        notifier.async(axios.post('/users/resendVerificationEmail'),
            (resp) => {
                notifier.success('!המייל נשלח בהצלחה');
            },
            (error) => {
                console.log(error.response.data);
                if (error.response.status === 429) {
                    return $(notifier.alert(`ניתן לשלוח מייל אימות רק פעם ביום. נסה שוב בעוד ${error.response.data.tryAgainAfter}`)).css({ direction: 'rtl' });
                }
                notifier.alert(error.response.data.message);
            });
    }
});