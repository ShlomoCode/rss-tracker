/* eslint-disable no-undef */
function showLoginForm() {
    $('.message').css('transform', 'translateX(0)');
    if ($('.message').hasClass('login')) {
        $('.message').removeClass('signup');
    }
    $('.message').addClass('login');
}

async function login (input) {
    const { email, password } = input;

    let response;
    try {
        response = await axios.post('/users/login', {
            email: email,
            password: password
        });
    } catch (error) {
        if (error.response.status === 401) {
            new AWN({ position: 'bottom-left' }).alert(`שם המשתמש או הסיסמה שגויים
            <br>...נסה שוב`);
        } else {
            new AWN().alert(`${error.response.status}: ${error.response.data.message}`);
        }
        return console.log(error.response);
    }

    const { token } = response.data;
    Cookies.set('token', token, { expires: 14 });
    open('/', '_self');
}

async function signup (input) {
    const { name, email, password } = input;

    if (!/[0-9- א-תA-z]{3,15}/.test(name)) {
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
            if (err.response.data.message === 'Email exists') {
                notifierSignup.alert('המייל הזה כבר רשום<br>...נסה להתחבר');
                onResolveRegister();
            } else if (err.response.data.message === 'Weak password') {
                notifierSignup.alert('!הסיסמה חלשה מידי');
                if (err.response.data.weakness.warning !== '') {
                    notifierSignup.tip(err.response.data.weakness.warning);
                }
                if (err.response.data.weakness.suggestions.length > 0) {
                    notifierSignup.tip(err.response.data.weakness.suggestions[0]);
                }
            } else {
                notifierSignup.alert(`${err.response.status}: ${err.response.data.error.message}`);
            }
            console.log(err.response);
        });

    function onResolveRegister () {
        showLoginForm();
        $('#login-email').val(email);
        $('#login-password').val(password);
    }
}

export {
    login,
    signup,
    showLoginForm
};
