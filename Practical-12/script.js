const authSection = document.getElementById("authSection");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");
let students = [];
let editingId = null;

function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "green" : "red";
}

document.getElementById("showLogin").onclick = function () {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");
};
document.getElementById("showRegister").onclick = function () {
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");
};

async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }
    return data;
}

document.getElementById("registerForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        try {
            const data = await api("/api/register", {
                method: "POST",
                body: JSON.stringify({
                    name: document.getElementById("adminName").value.trim(),
                    email: document.getElementById("adminEmail").value.trim(),
                    password: document.getElementById("adminPassword").value
                })
            });
            showMessage(data.message, true);
            this.reset();
            document.getElementById("showLogin").click();
        } catch (error) {
            showMessage(error.message);
        }
    }
);

document.getElementById("loginForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        try {
            const data = await api("/api/login", {
                method: "POST",
                body: JSON.stringify({
                    email: document.getElementById("loginEmail").value.trim(),
                    password: document.getElementById("loginPassword").value
                })
            });
            authSection.classList.add("hidden");
            dashboard.classList.remove("hidden");
            document.getElementById("logoutBtn").classList.remove("hidden");
            showMessage(data.message, true);
            loadStudents();
        } catch (error) {
            showMessage(error.message);
        }
    }
);

document.getElementById("logoutBtn").onclick = async function () {
    try {
        await api("/api/logout", { method: "POST" });
        dashboard.classList.add("hidden");
        authSection.classList.remove("hidden");
        this.classList.add("hidden");
        showMessage("Logged out successfully.", true);
    } catch (error) {
        showMessage(error.message);
    }
};

async function loadStudents() {
    try {
        students = await api("/api/students");
        displayStudents(students);
    } catch (error) {
        showMessage(error.message);
    }
}

function displayStudents(records) {
    const table = document.getElementById("studentTable");
    table.innerHTML = "";
    document.getElementById("totalStudents").textContent = students.length;
    records.forEach(student => {
        const row = document.createElement("tr");
        const values = [
            student.enrollment,
            student.name,
            student.branch,
            student.semester,
            student.email,
            student.mobile
        ];
        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn btn-warning btn-sm me-1";
        editButton.onclick = () => editStudent(student.id);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.onclick = () => deleteStudent(student.id);
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

document.getElementById("studentForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        const student = {
            enrollment: document.getElementById("enrollment").value.trim(),
            name: document.getElementById("studentName").value.trim(),
            branch: document.getElementById("branch").value,
            semester: Number(document.getElementById("semester").value),
            email: document.getElementById("studentEmail").value.trim(),
            mobile: document.getElementById("mobile").value.trim()
        };
        try {
            if (editingId === null) {
                await api("/api/students", {
                    method: "POST",
                    body: JSON.stringify(student)
                });
                showMessage("Student added successfully.", true);
            } else {
                await api("/api/students/" + editingId, {
                    method: "PUT",
                    body: JSON.stringify(student)
                });
                showMessage("Student updated successfully.", true);
            }
            resetForm();
            loadStudents();
        } catch (error) {
            showMessage(error.message);
        }
    }
);

function editStudent(id) {
    const student = students.find(item => item.id === id);
    if (!student) return;
    editingId = id;
    document.getElementById("enrollment").value = student.enrollment;
    document.getElementById("studentName").value = student.name;
    document.getElementById("branch").value = student.branch;
    document.getElementById("semester").value = student.semester;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("mobile").value = student.mobile;
    document.getElementById("enrollment").disabled = true;
    document.getElementById("formTitle").textContent = "Update Student";
    document.getElementById("saveBtn").textContent = "Update Student";
    document.getElementById("cancelEdit").classList.remove("hidden");
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }
    try {
        await api("/api/students/" + id, {
            method: "DELETE"
        });
        showMessage("Student deleted successfully.", true);
        loadStudents();
    } catch (error) {
        showMessage(error.message);
    }
}

function resetForm() {
    document.getElementById("studentForm").reset();
    editingId = null;
    document.getElementById("enrollment").disabled = false;
    document.getElementById("formTitle").textContent = "Add New Student";
    document.getElementById("saveBtn").textContent = "Add Student";
    document.getElementById("cancelEdit").classList.add("hidden");
}

document.getElementById("cancelEdit").onclick = resetForm;

document.getElementById("searchInput").addEventListener(
    "input",
    function () {
        const query = this.value.toLowerCase();
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(query) ||
            student.enrollment.toLowerCase().includes(query)
        );
        displayStudents(filtered);
    }
);

async function checkLogin() {
    try {
        const data = await api("/api/me");
        authSection.classList.add("hidden");
        dashboard.classList.remove("hidden");
        document.getElementById("logoutBtn").classList.remove("hidden");
        showMessage("Welcome, " + data.name, true);
        loadStudents();
    } catch (error) {
        authSection.classList.remove("hidden");
    }
}

checkLogin();
