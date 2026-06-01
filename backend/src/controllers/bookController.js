const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook: updateBookRecord,
  deleteBook: deleteBookRecord,
} = require("../services/bookRepository");

/*
|--------------------------------------------------------------------------
| GET ALL BOOKS
|--------------------------------------------------------------------------
*/
exports.getBooks = async (req, res, next) => {
  try {
    const books = await getAllBooks();

    res.json(books);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOK
|--------------------------------------------------------------------------
*/
exports.getBook = async (req, res, next) => {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE BOOK
|--------------------------------------------------------------------------
*/
exports.createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      category,
      description,
    } = req.body || {};

    if (!title || !author) {
      return res.status(400).json({
        message: "title and author are required",
      });
    }

    const book = await createBook({
      title,
      author,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOK
|--------------------------------------------------------------------------
*/
exports.updateBook = async (req, res, next) => {
  try {
    const existingBook = await getBookById(req.params.id);

    if (!existingBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const updatedBook = await updateBookRecord(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      book: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BOOK
|--------------------------------------------------------------------------
*/
exports.deleteBook = async (req, res, next) => {
  try {
    const deletedBook = await deleteBookRecord(
      req.params.id
    );

    if (!deletedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    next(error);
  }
};