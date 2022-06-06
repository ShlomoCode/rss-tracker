/* eslint-disable no-undef */
function showLoginForm () {
    $('.message').css('transform', 'translateX(0)');
    if ($('.message').hasClass('login')) {
        $('.message').removeClass('signup');
    }
    $('.message').addClass('login');
}

async function login (input) {
    const { email, password } = input;

    try {
        await axios.post('/users/login', {
            email: email,
            password: password
        });
        new AWN().success('התחברת בהצלחה');
        open('/', '_self');
    } catch (error) {
        if (error.response.status === 401) {
            new AWN({ position: 'bottom-left' }).alert(`!שם המשתמש או הסיסמה שגויים
            <br>...נסה שוב`);
        } else {
            new AWN().alert(`${error.response.status}: ${error.response.data?.message}`);
        }
        return console.log(error.response);
    }
}

async function signup (input) {
    const { name, email, password } = input;

    if (!/[0-9- א-תA-z]{2,15}/.test(name)) {
        return new AWN({ position: 'bottom-left' }).alert('שם חסר/לא תקין/קצר מידי');
    }

    const notifierSignup = new AWN({
        position: 'bottom-left',
        messages: {
            'async-block': '...מבצע הרשמה'
        }
    });
    notifierSignup.asyncBlock(axios.post('/users/signup', { email, password, name }),
        (resp) => {
            onResolveRegister();
            notifierSignup.success(`${resp.data.message}.<br> Please login...`);
        },
        (err) => {
            if (err.response.data?.message === 'Email exists') {
                notifierSignup.alert('המייל הזה כבר רשום<br>...נסה להתחבר');
                onResolveRegister();
            } else if (err.response.data?.message === 'Weak password') {
                notifierSignup.alert('!הסיסמה חלשה מידי');
                if (err.response.data.weakness.warning !== '') {
                    notifierSignup.tip(err.response.data.weakness.warning);
                }
                if (err.response.data.weakness.suggestions.length > 0) {
                    notifierSignup.tip(err.response.data.weakness.suggestions[0]);
                }
            } else {
                notifierSignup.alert(`${err.response.status}: ${err.response.data?.message}`);
            }
            console.log(err.response);
        });

    function onResolveRegister () {
        showLoginForm();
        $('#login-email').val(email);
        $('#login-password').val(password);
    }
}

/**
 * @param {Number} step - step of reset password
 */
async function resetPassword (step) {
    if (step === 1) {
        bootbox.prompt({
            title: 'אנא הזן את כתובת המייל שלך',
            inputType: 'email',
            value: step === 1 ? $('#login-email').val() : '',
            callback: async (email) => {
                if (!email) {
                    if (email === null) return;
                    return new AWN().alert('אנא הזן את כתובת המייל שלך');
                }
                if (sessionStorage.getItem('reset-password-email') === email) return resetPassword(2);
                const notifier = new AWN();
                notifier.asyncBlock(axios.post('/users/reset-password', { email }),
                    (resp) => {
                        new AWN().success('מייל איפוס סיסמה נשלח לכתובת המייל שלך');
                        sessionStorage.setItem('reset-password-email', email);
                        resetPassword(2);
                    },
                    (err) => {
                        notifier.alert(`${err.response.status}: ${err.response.data?.message}`);
                    });
            }
        });
    } else if (step === 2) {
        const email = sessionStorage.getItem('reset-password-email');
        bootbox.prompt({
            title: `הכנס את קוד האימות בן 5 ספרות שקיבלת לכתובת ${email}`,
            inputType: 'text',
            callback: (code) => {
                if (!code) {
                    if (code === null) return;
                    return new AWN().alert('אנא הזן את קוד האימות');
                }
                bootbox.prompt({
                    title: 'הכנס את הסיסמה החדשה',
                    inputType: 'password',
                    callback: (password) => {
                        if (!password) {
                            if (password === null) return;
                            return new AWN().alert('אנא הזן את הסיסמה החדשה');
                        }
                        const notifier = new AWN();
                        notifier.asyncBlock(axios.post('/users/reset-password-confirm', {
                            email,
                            resetPasswordToken: code,
                            newPassword: password
                        }),
                        (resp) => {
                            new AWN().success('הסיסמה שונתה בהצלחה, אנא התחבר');
                            sessionStorage.removeItem('reset-password-email');
                            $('#login-password').val(password);
                        },
                        (err) => {
                            notifier.alert(`${err.response.status}: ${err.response.data?.message}`);
                        });
                    }
                });
            }
        });
    } else {
        return new AWN().alert('משהו השתבש עם הפעולה, אנא צור קשר עם מנהל האתר');
    }
}

export {
    login,
    signup,
    showLoginForm,
    resetPassword
};
