function showLoginForm() {
    $(".message").css("transform", "translateX(0)");
    if ($(".message").hasClass("login")) {
        $(".message").removeClass("signup");
    }
    $(".message").addClass("login");
}


$("#signup").click(function () {
    $(".message").css("transform", "translateX(100%)");
    if ($(".message").hasClass("login")) {
        $(".message").removeClass("login");
    }
    $(".message").addClass("signup");
});

$("#login").click(showLoginForm);

// // // // //
import { login, signup } from './lb.js';

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

export {
    showLoginForm
}