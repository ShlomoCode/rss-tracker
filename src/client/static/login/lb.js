/* eslint-disable no-undef */
import { showLoginForm } from './events.js';

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
    Cookies.set('token', token, { expires: 7 });
    open('/', '_self');
}

async function signup (input) {
    const { name, email, password } = input;

    if (!/[0-9-\ א-תA-z]{3,15}/.test(name)) {
        return new AWN({ position: 'bottom-left' }).alert('!שם חסר/לא תקין');
    }

    const notifierSignup = new AWN({
        position: 'bottom-left',
        // labels: { async: 'מבצע הרשמה' },
        messages: {
            // async: '...אנא המתן',
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
                notifierSignup.alert('המייל הזה כבר רשום<br>...נסה להתחבר', { position: 'bottom-left' });
                onResolveRegister();
            } else {
                notifierSignup.alert(`${err.response.status}: ${err.response.data.message}`, { position: 'bottom-left' });
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
    signup
};
