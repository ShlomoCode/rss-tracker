const url = location.href.match(/(https?:\/\/.+(\..+)?)\/unsubscribe\?userID=.+&email=(?<email>[a-z]+@[a-z]+\.[a-z]{2,6})/);
document.getElementById('email').innerHTML = url.groups.email;
