const API = "https://dummyjson.com/products";
const productList = document.getElementById("productList");
const message = document.getElementById("message");

// GET API - Display all products
async function getProducts() {
    message.textContent = "Loading products...";
    try {
        const response = await fetch(API + "?limit=12");
        if (!response.ok) {
            throw new Error("Unable to fetch products");
        }
        const data = await response.json();
        displayProducts(data.products);
        message.textContent = "Products loaded successfully.";
    } catch (error) {
        message.textContent = error.message;
    }
}

// Display products
function displayProducts(products) {
    productList.innerHTML = "";
    if (products.length === 0) {
        message.textContent = "No products found.";
        return;
    }
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        const image = document.createElement("img");
        image.src = product.thumbnail;
        image.alt = product.title;
        const title = document.createElement("h3");
        title.textContent = product.title;
        const price = document.createElement("p");
        price.textContent = "Price: $" + product.price;
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        productList.appendChild(card);
    });
}

// GET API - Search products
async function searchProducts() {
    const search = document.getElementById("searchInput").value.trim();
    if (search === "") {
        getProducts();
        return;
    }
    message.textContent = "Searching...";
    try {
        const response = await fetch(
            API + "/search?q=" + encodeURIComponent(search)
        );
        if (!response.ok) {
            throw new Error("Search failed");
        }
        const data = await response.json();
        displayProducts(data.products);
        message.textContent = "Search completed.";
    } catch (error) {
        message.textContent = error.message;
    }
}

// POST API - Add product
document.getElementById("productForm").addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();
        const title = document.getElementById("productTitle").value;
        const price = Number(document.getElementById("productPrice").value);
        if (!title.trim() || !Number.isFinite(price) || price <= 0) {
            message.textContent = "Enter a valid product name and price.";
            return;
        }
        const newProduct = {
            title: title,
            price: price
        };
        try {
            const response = await fetch(API + "/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newProduct)
            });
            if (!response.ok) {
                throw new Error("Unable to add product");
            }
            const data = await response.json();
            message.textContent =
                "Product added successfully! ID: " + data.id;
            document.getElementById("productForm").reset();
        } catch (error) {
            message.textContent = error.message;
        }
    }
);

// Load products when page opens
getProducts();
