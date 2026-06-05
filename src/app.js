const path = require("path");
const express = require("express");

const bookRoutes = require("./routes/bookRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "Book Catalog", timestamp: new Date().toISOString() });
});

app.use("/", bookRoutes);

// 404
app.use((req, res) => {
  res.status(404).send("Not found");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error: " + err.message);
});

module.exports = app;
