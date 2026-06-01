const express = require("express");

const router = express.Router();

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

/*
|--------------------------------------------------------------------------
| BOOK ROUTES
|--------------------------------------------------------------------------
*/

router.get("/", getBooks);

router.get("/:id", getBook);

router.post("/", createBook);

router.put("/:id", updateBook);

router.delete("/:id", deleteBook);

module.exports = router;