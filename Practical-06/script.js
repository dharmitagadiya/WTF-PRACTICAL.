const promoText = document.getElementById("promoText");
const countdownEl = document.getElementById("countdown");
const themeBtn = document.getElementById("themeBtn");
const greeting = document.getElementById("greeting");
const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const viewCount = document.getElementById("viewCount");
const sessionTime = document.getElementById("sessionTime");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorText = document.getElementById("errorText");
const retryBtn = document.getElementById("retryBtn");
const packageContainer = document.getElementById("packageContainer");
const selectedText = document.getElementById("selectedText");
const enquiryBtn = document.getElementById("enquiryBtn");
const clearBtn = document.getElementById("clearBtn");
const enquirySteps = document.getElementById("enquirySteps");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

let allPackages = [];

/* PART A: TIMERS */
const offers = [
  "Summer Sale: Up to 30% OFF on all packages!",
  "Book 2 trips and get 1 night FREE!",
  "Student Special: Extra 10% discount with ID card!",
  "Family Offer: Kids under 5 travel FREE!"
];
let offerIndex = 0;
function showNextOffer() {
  promoText.textContent = offers[offerIndex];
  offerIndex++;
  if (offerIndex >= offers.length) {
    offerIndex = 0;
  }
}
showNextOffer();
setInterval(showNextOffer, 3000);

let secondsLeft = 10 * 60;
function updateCountdown() {
  if (secondsLeft <= 0) {
    countdownEl.textContent = "Offer Expired";
    clearInterval(countdownTimer);
    return;
  }
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const mm = minutes < 10 ? "0" + minutes : minutes;
  const ss = seconds < 10 ? "0" + seconds : seconds;
  countdownEl.textContent = mm + ":" + ss;
  secondsLeft--;
}
const countdownTimer = setInterval(updateCountdown, 1000);

setTimeout(function () {
  popup.classList.remove("hidden");
}, 5000);

closePopup.addEventListener("click", function () {
  popup.classList.add("hidden");
});

/* PART B: LOCAL STORAGE */
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    themeBtn.textContent = "Dark Mode";
  }
}
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme);

themeBtn.addEventListener("click", function () {
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "light");
    applyTheme("light");
  } else {
    localStorage.setItem("theme", "dark");
    applyTheme("dark");
  }
});

function saveSelectedDestination(id) {
  localStorage.setItem("selectedDestinationId", id);
  showSelectedDestination();
  highlightSelectedCard();
}

function showSelectedDestination() {
  const savedId = localStorage.getItem("selectedDestinationId");
  if (savedId === null) {
    selectedText.textContent = "You have not selected any destination yet.";
    return;
  }
  if (allPackages.length === 0) {
    selectedText.textContent = "Loading your selected destination...";
    return;
  }
  const pack = allPackages.find(function (item) {
    return item.id === Number(savedId);
  });
  if (pack) {
    selectedText.textContent =
      pack.name + " (" + pack.location + ") - " + pack.days +
      " days - Rs. " + pack.price;
  }
}

function highlightSelectedCard() {
  const savedId = localStorage.getItem("selectedDestinationId");
  const cards = document.querySelectorAll(".card");
  cards.forEach(function (card) {
    if (card.dataset.id === savedId) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

clearBtn.addEventListener("click", function () {
  localStorage.removeItem("selectedDestinationId");
  enquirySteps.innerHTML = "";
  showSelectedDestination();
  highlightSelectedCard();
});

/* PART C: SESSION STORAGE */
function setupSession() {
  let views = sessionStorage.getItem("pageViews");
  if (views === null) {
    views = 0;
  }
  views = Number(views) + 1;
  sessionStorage.setItem("pageViews", views);
  viewCount.textContent = views;

  let startTime = sessionStorage.getItem("sessionStart");
  if (startTime === null) {
    startTime = new Date().toLocaleTimeString();
    sessionStorage.setItem("sessionStart", startTime);
  }
  sessionTime.textContent = startTime;

  const savedName = sessionStorage.getItem("userName");
  if (savedName) {
    greeting.textContent = "Welcome back, " + savedName + "!";
  }
}

saveNameBtn.addEventListener("click", function () {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("Please enter your name first.");
    return;
  }
  sessionStorage.setItem("userName", name);
  greeting.textContent = "Welcome, " + name + "!";
  nameInput.value = "";
});
setupSession();

/* PART D: FETCH API */
async function fetchPackages() {
  const response = await fetch("destinations.json");
  if (!response.ok) {
    throw new Error("Could not load data. Status code: " + response.status);
  }
  const data = await response.json();
  return data;
}

function displayPackages(packages) {
  packageContainer.innerHTML = "";
  packages.forEach(function (pack) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = pack.id;
    card.innerHTML =
      '<img src="' + pack.image + '" alt="' + pack.name + '">' +
      '<div class="card-body">' +
        "<h3>" + pack.name + "</h3>" +
        "<p>" + pack.location + " | " + pack.days + " days</p>" +
        "<p>" + pack.description + "</p>" +
        '<p class="price">Rs. ' + pack.price + "</p>" +
        '<button class="btn selectBtn">Select</button>' +
      "</div>";
    const selectBtn = card.querySelector(".selectBtn");
    selectBtn.addEventListener("click", function () {
      saveSelectedDestination(pack.id);
    });
    packageContainer.appendChild(card);
  });
}

async function loadPackages(callbackAfterLoad) {
  loading.classList.remove("hidden");
  errorBox.classList.add("hidden");
  packageContainer.innerHTML = "";
  try {
    await new Promise(function (resolve) {
      setTimeout(resolve, 1000);
    });
    allPackages = await fetchPackages();
    displayPackages(allPackages);
    callbackAfterLoad();
  } catch (error) {
    errorText.textContent = "Sorry! Something went wrong. " + error.message;
    errorBox.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

retryBtn.addEventListener("click", function () {
  loadPackages(afterPackagesLoaded);
});

function afterPackagesLoaded() {
  showSelectedDestination();
  highlightSelectedCard();
}

/* PART E: CALLBACKS IN SEQUENCE */
function addStep(message) {
  const li = document.createElement("li");
  li.textContent = message;
  enquirySteps.appendChild(li);
}

function checkAvailability(callback) {
  addStep("Step 1: Checking availability...");
  setTimeout(function () {
    addStep("Seats are available.");
    callback();
  }, 1500);
}

function confirmPrice(callback) {
  addStep("Step 2: Confirming price...");
  setTimeout(function () {
    addStep("Price confirmed.");
    callback();
  }, 1500);
}

function sendEnquiry(callback) {
  addStep("Step 3: Sending your enquiry...");
  setTimeout(function () {
    addStep("Enquiry sent successfully!");
    callback();
  }, 1500);
}

enquiryBtn.addEventListener("click", function () {
  if (localStorage.getItem("selectedDestinationId") === null) {
    alert("Please select a destination first.");
    return;
  }
  enquirySteps.innerHTML = "";
  enquiryBtn.disabled = true;
  checkAvailability(function () {
    confirmPrice(function () {
      sendEnquiry(function () {
        addStep("All done! Our team will contact you soon.");
        enquiryBtn.disabled = false;
      });
    });
  });
});

loadPackages(afterPackagesLoaded);
