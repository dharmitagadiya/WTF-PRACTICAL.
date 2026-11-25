const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

const users = [
  { username: "student", password: "library123", name: "Rahul Sharma", role: "Student" },
  { username: "staff", password: "staff123", name: "Meera Patel", role: "Staff" }
];

app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));
app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/css", express.static(__dirname));
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/js", express.static(__dirname));

app.use(
  session({
    secret: "centralcitylibrary",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 }
  })
);

function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

function sendView(res, fileName) {
  const viewsPath = path.join(__dirname, "views", fileName);
  if (fs.existsSync(viewsPath)) {
    return res.sendFile(viewsPath);
  }
  const rootPath = path.join(__dirname, fileName);
  if (fs.existsSync(rootPath)) {
    return res.sendFile(rootPath);
  }
  res.status(404).send(`File ${fileName} not found`);
}

app.get("/", (req, res) => {
  sendView(res, "home.html");
});

app.get("/about", (req, res) => {
  sendView(res, "about.html");
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  sendView(res, "login.html");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const foundUser = users.find(
    (u) => u.username === username && u.password === password
  );
  if (foundUser) {
    req.session.user = {
      username: foundUser.username,
      name: foundUser.name,
      role: foundUser.role
    };
    res.redirect("/dashboard");
  } else {
    res.redirect("/login?error=1");
  }
});

app.get("/dashboard", checkLogin, (req, res) => {
  sendView(res, "dashboard.html");
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error while logging out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login?logout=1");
  });
});

app.use((req, res) => {
  res.status(404);
  sendView(res, "notfound.html");
});

app.listen(PORT, () => {
  console.log("=================================================");
  console.log("  Central City Library Server is running!");
  console.log("  URL: http://localhost:" + PORT);
  console.log("=================================================");
});
