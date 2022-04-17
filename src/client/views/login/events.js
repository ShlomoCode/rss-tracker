import { login, signup, showLoginForm } from './lb.js';

$('#signup').click(function () {
    $('.message').css('transform', 'translateX(100%)');
    if ($('.message').hasClass('login')) {
        $('.message').removeClass('login');
    }
    $('.message').addClass('signup');
});
$('#login').click(showLoginForm);

$('#form-signup').on('submit', (event) => {
    event.preventDefault();
    const name = $('#signup-name').val();
    const email = $('#signup-email').val();
    const password = $('#signup-password').val();
    signup({
        name,
        email,
        password
    });
});

$('#form-login').on('submit', (event) => {
    event.preventDefault();
    const email = $('#login-email').val();
    const password = $('#login-password').val();
    login({ email, password });
});
