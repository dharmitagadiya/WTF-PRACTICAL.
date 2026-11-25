const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

const DB_CONFIG = { host: "localhost", user: "root", password: "" };
const DB_NAME = "techmart";
let pool;

async function initDatabase() {
  const first = await mysql.createConnection(DB_CONFIG);
  await first.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
  await first.end();
  pool = mysql.createPool({ ...DB_CONFIG, database: DB_NAME });
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    product_id   VARCHAR(20)   PRIMARY KEY,
    product_name VARCHAR(100)  NOT NULL,
    category     VARCHAR(50)   NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    description  TEXT
  )`);
  console.log("Database connected and table ready.");
}

function clean(v) {
  return String(v ?? "").replace(/<[^>]*>/g, "").trim();
}

function getData(body) {
  return {
    product_id: clean(body.product_id),
    product_name: clean(body.product_name),
    category: clean(body.category),
    price: clean(body.price),
    quantity: clean(body.quantity),
    description: clean(body.description),
  };
}

function validate(d) {
  const err = [];
  if (!/^[A-Za-z0-9-]{1,20}$/.test(d.product_id))
    err.push("Product ID must be 1-20 letters, numbers or hyphen.");
  if (d.product_name === "" || d.product_name.length > 100)
    err.push("Product Name is required (max 100 characters).");
  if (d.category === "" || d.category.length > 50)
    err.push("Category is required (max 50 characters).");
  if (d.price === "" || isNaN(d.price) || Number(d.price) <= 0)
    err.push("Price must be a number greater than 0.");
  if (!/^\d+$/.test(d.quantity))
    err.push("Quantity must be a whole number (0 or more).");
  return err;
}

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY product_name");
    res.json({ success: true, products: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, errors: ["Could not load products."] });
  }
});

// POST - Create product
app.post("/api/products", async (req, res) => {
  const d = getData(req.body);
  const errors = validate(d);
  if (errors.length) return res.status(400).json({ success: false, errors });
  try {
    await pool.query(
      "INSERT INTO products (product_id, product_name, category, price, quantity, description) VALUES (?,?,?,?,?,?)",
      [d.product_id, d.product_name, d.category, d.price, d.quantity, d.description]
    );
    res.json({ success: true, message: "Product added successfully." });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(400).json({ success: false, errors: ["Product ID already exists."] });
    console.error(e);
    res.status(500).json({ success: false, errors: ["Could not add product. Please try again."] });
  }
});

// PUT - Update product
app.put("/api/products/:id", async (req, res) => {
  const d = getData({ ...req.body, product_id: req.params.id });
  const errors = validate(d);
  if (errors.length) return res.status(400).json({ success: false, errors });
  try {
    const [r] = await pool.query(
      "UPDATE products SET product_name=?, category=?, price=?, quantity=?, description=? WHERE product_id=?",
      [d.product_name, d.category, d.price, d.quantity, d.description, d.product_id]
    );
    if (r.affectedRows === 0)
      return res.status(404).json({ success: false, errors: ["Product not found."] });
    res.json({ success: true, message: "Product updated successfully." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, errors: ["Could not update product."] });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const [r] = await pool.query("DELETE FROM products WHERE product_id = ?", [clean(req.params.id)]);
    if (r.affectedRows === 0)
      return res.status(404).json({ success: false, errors: ["Product not found."] });
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, errors: ["Could not delete product."] });
  }
});

initDatabase()
  .then(() => app.listen(3000, () => console.log("Open http://localhost:3000")))
  .catch((e) => {
    console.error("Could not connect to MySQL. Is MySQL running?", e.message);
    process.exit(1);
  });
