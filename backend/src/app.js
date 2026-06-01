const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const bookRoutes = require("./routes/bookRoutes");
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


app.get("/", (req, res) => {
  res.json({
    message: "Book Catalog API Running",
  });
});

app.use("/api/books", bookRoutes);


app.use(errorHandler);

module.exports = app;