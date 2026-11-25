let cart = [];
let total = 0;
let productCount = 3;

document.getElementById("themeBtn").addEventListener("click", function() {
    document.body.classList.toggle("dark");
    document.getElementById("feedback").textContent =
        "Theme changed successfully!";
});

document.getElementById("changeTextBtn").addEventListener("click", function() {
    document.getElementById("welcomeText").textContent =
        "Thank you for shopping with ShopEase!";
});

let products = document.getElementsByClassName("product");
for (let i = 0; i < products.length; i++) {
    products[i].addEventListener("mouseover", function() {
        this.style.transform = "scale(1.05)";
        this.style.borderColor = "green";
    });
    products[i].addEventListener("mouseout", function() {
        this.style.transform = "scale(1)";
        this.style.borderColor = "#ccc";
    });
}

let headings = document.getElementsByTagName("h2");
for (let i = 0; i < headings.length; i++) {
    headings[i].style.color = "#52796f";
}

document.querySelector("#header p").addEventListener("dblclick", function() {
    this.textContent = "Double-click event performed!";
});

document.querySelectorAll(".addBtn").forEach(function(button) {
    button.addEventListener("click", function() {
        let name = this.getAttribute("data-name");
        let price = Number(this.getAttribute("data-price"));
        cart.push({ name: name, price: price });
        total = total + price;
        updateCart();
        document.getElementById("feedback").textContent =
            name + " added to cart!";
    });
});

function updateCart() {
    let list = document.getElementById("cartList");
    list.innerHTML = "";
    if (cart.length === 0) {
        let item = document.createElement("li");
        item.textContent = "Your cart is empty.";
        list.appendChild(item);
    } else {
        cart.forEach(function(product) {
            let item = document.createElement("li");
            item.textContent = product.name + " - ₹" + product.price;
            list.appendChild(item);
        });
    }
    document.getElementById("total").textContent = "Total: ₹" + total;
}

document.getElementById("clearCartBtn").addEventListener("click", function() {
    cart = [];
    total = 0;
    updateCart();
    document.getElementById("feedback").textContent =
        "Shopping cart cleared!";
});

let search = document.getElementById("search");
search.addEventListener("keydown", function() {
    document.getElementById("keyMessage").textContent =
        "You are typing...";
});

search.addEventListener("keyup", function() {
    let value = this.value.toLowerCase();
    document.querySelectorAll(".product").forEach(function(product) {
        let name = product.querySelector(".product-name")
                            .textContent.toLowerCase();
        product.style.display = name.includes(value) ? "" : "none";
    });
    document.getElementById("keyMessage").textContent =
        "Search updated: " + this.value;
});

document.querySelectorAll(".product-img").forEach(function(img) {
    img.addEventListener("click", function() {
        document.getElementById("preview").src = this.src;
        document.getElementById("preview").alt = this.alt;
        document.getElementById("feedback").textContent =
            "Image preview updated!";
    });
});

document.getElementById("addProductBtn").addEventListener("click", function() {
    productCount++;
    let product = document.createElement("div");
    product.className = "product";
    let heading = document.createElement("h3");
    heading.className = "product-name";
    heading.textContent = "New Product " + productCount;
    let description = document.createElement("p");
    description.textContent = "Price: ₹500";
    let button = document.createElement("button");
    button.textContent = "Add to Cart";
    button.setAttribute("data-name", "New Product " + productCount);
    button.setAttribute("data-price", "500");
    button.className = "addBtn";
    button.addEventListener("click", function() {
        cart.push({
            name: this.getAttribute("data-name"),
            price: Number(this.getAttribute("data-price"))
        });
        total += 500;
        updateCart();
        document.getElementById("feedback").textContent =
            "New product added to cart!";
    });
    product.appendChild(heading);
    product.appendChild(description);
    product.appendChild(button);
    document.querySelector(".product-container").appendChild(product);
    
    // Add mouse events to the new product
    product.addEventListener("mouseover", function() {
        this.style.transform = "scale(1.05)";
    });
    product.addEventListener("mouseout", function() {
        this.style.transform = "scale(1)";
    });
    document.getElementById("feedback").textContent =
        "New product created successfully!";
});

document.getElementById("replaceBtn").addEventListener("click", function() {
    let oldText = document.getElementById("welcomeText");
    let newText = document.createElement("h3");
    newText.id = "welcomeText";
    newText.textContent = "Welcome to the new ShopEase experience!";
    oldText.replaceWith(newText);
    document.getElementById("feedback").textContent =
        "Welcome message replaced!";
});

document.getElementById("removeBtn").addEventListener("click", function() {
    let container = document.querySelector(".product-container");
    let lastProduct = container.lastElementChild;
    if (lastProduct) {
        lastProduct.remove();
        document.getElementById("feedback").textContent =
            "Last product removed!";
    } else {
        document.getElementById("feedback").textContent =
            "No products left to remove.";
    }
});

document.getElementById("category").addEventListener("change", function() {
    document.getElementById("formFeedback").textContent =
        "Selected enquiry: " + this.value;
});

document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let name = document.getElementById("name").value;
    document.getElementById("formFeedback").textContent =
        "Thank you, " + name + "! Your message has been submitted.";
    this.reset();
});
