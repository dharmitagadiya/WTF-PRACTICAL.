const loginLink = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");
const message = document.getElementById("message");

fetch("/api/user")
  .then((response) => response.json())
  .then((data) => {
    if (data.loggedIn) {
      if (loginLink) loginLink.classList.add("hidden");
      if (logoutLink) logoutLink.classList.remove("hidden");
      const userName = document.getElementById("userName");
      const userRole = document.getElementById("userRole");
      const userUsername = document.getElementById("userUsername");
      if (userName) {
        userName.textContent = data.user.name;
        userRole.textContent = data.user.role;
        userUsername.textContent = data.user.username;
      }
    }
  });

if (message) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("error")) {
    message.textContent = "Invalid username or password";
    message.classList.add("error");
    message.classList.remove("hidden");
  }
  if (params.get("logout")) {
    message.textContent = "You have been logged out successfully";
    message.classList.add("success");
    message.classList.remove("hidden");
  }
}
