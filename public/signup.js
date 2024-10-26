// Check if password matches
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("registerForm").addEventListener("submit", function (event) {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 6) {
      event.preventDefault(); // Prevent the form from submitting
      document.getElementById("error-message").innerHTML = "Password must be at least 6 characters long.";
      document.getElementById("error-message").style.display = "block";
    } else {
      if (password !== confirmPassword) {
        event.preventDefault(); // Prevent the form from submitting
        document.getElementById("error-message").innerHTML = "Passwords do not match!"
        document.getElementById("error-message").style.display = "block";
      } else {
        document.getElementById("error-message").style.display = "none";
      }
    }
  });
});