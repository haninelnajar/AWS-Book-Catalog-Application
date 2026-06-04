const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const bookRoutes = require("./routes/bookRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();



app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));



app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "Book Catalog API",
    timestamp: new Date().toISOString(),
  });
});



app.get("/", (req, res) => {
  res.json({
    message: "Book Catalog API Running",
  });
});



app.use("/api/books", bookRoutes);



app.use(notFound);



app.use(errorHandler);

module.exports = app;