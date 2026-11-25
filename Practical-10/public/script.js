// Registration
document.getElementById("registerForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword =
        document.getElementById("confirmPassword").value;
    let message = document.getElementById("message");
    if (name === "") {
        message.textContent = "Name is required";
        return;
    }
    if (password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)) {
        message.textContent = "Enter a strong password";
        return;
    }
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match";
        return;
    }
    try {
        let response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name, email, password
            })
        });
        let data = await response.json();
        message.textContent = data.message;
    } catch (error) {
        message.textContent = "Something went wrong";
    }
});

// Login
document.getElementById("loginForm")
.addEventListener("submit", async function(e) {
    e.preventDefault();
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    try {
        let response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email, password
            })
        });
        let data = await response.json();
        document.getElementById("message").textContent =
            data.message;
    } catch (error) {
        document.getElementById("message").textContent =
            "Something went wrong";
    }
});

// XSS Prevention
function testXSS() {
    let input = document.getElementById("userInput").value;
    document.getElementById("output").textContent = input;
}
