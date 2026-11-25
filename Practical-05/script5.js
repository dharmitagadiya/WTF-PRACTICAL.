// Validation patterns
const namePattern = /^[A-Za-z\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^[0-9]{10}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const form = document.getElementById("patientForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const mobile = document.getElementById("mobile");
    const dob = document.getElementById("dob");
    const address = document.getElementById("address");
    const password = document.getElementById("password");
    const confirm = document.getElementById("confirm");
    const report = document.getElementById("report");
    
    name.value = name.value.trim().replace(/\s+/g, " ");
    email.value = email.value.trim();
    mobile.value = mobile.value.trim();
    address.value = address.value.trim();
    
    function showError(text, field) {
        message.style.color = "red";
        message.textContent = text;
        if (field) field.focus();
    }
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    if (!namePattern.test(name.value)) {
        showError("Enter a valid name using letters only.", name);
        return;
    }
    if (!emailPattern.test(email.value)) {
        showError("Enter a valid email address.", email);
        return;
    }
    if (!mobilePattern.test(mobile.value)) {
        showError("Enter a valid 10-digit Indian mobile number.", mobile);
        return;
    }
    const today = new Date();
    const todayString = today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
    if (dob.value > todayString) {
        showError("Date of birth cannot be in the future.", dob);
        return;
    }
    if (!address.value) {
        showError("Please enter your address.", address);
        return;
    }
    if (!passwordPattern.test(password.value)) {
        showError(
            "Password must have 8 characters, uppercase, lowercase, a number and a special character.",
            password
        );
        return;
    }
    if (password.value !== confirm.value) {
        showError("Passwords do not match.", confirm);
        return;
    }
    if (report.files.length > 0 &&
        (!report.files[0].name.toLowerCase().endsWith(".pdf") ||
         report.files[0].type !== "application/pdf")) {
        showError("Please upload a valid PDF medical report.", report);
        return;
    }
    message.style.color = "green";
    message.textContent =
        "Registration form validated successfully!";
});
