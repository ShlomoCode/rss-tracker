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
        return console.log(error);
    }
    const { token } = response.data;
    Cookies.set('token', token, { expires: 7 });
    open('/', '_self');
}

async function signup (input) {
    const { name, email, password } = input;

    let response;
    try {
        response = await axios.post('/users/signup', { email, password, name })
    } catch (error) {
        return console.log(error);
    }
    console.log(response.data);
    showLoginForm()
    $('#login-email').val(email);
    $('#login-password').val(password);
}

export {
    login,
    signup
};
