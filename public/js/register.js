function registerUser(event) {
    event.preventDefault();

    var email = document.getElementById('email').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confirm_password = document.getElementById('confirm_password').value;

    // TEMPORARY client-side validation
    if (password !== confirm_password) {
        alert("Passwords do not match. Please re-enter your passwords.");
        return;
    }

    alert("Registration successful! Redirecting to Login.");
    window.location.href = "/login";
}