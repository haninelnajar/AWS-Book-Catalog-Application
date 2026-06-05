const repo = require("../services/bookRepository");
const { uploadImage, deleteImage, getImageUrl } = require("../services/s3Service");

// GET / — list all books with display URLs
exports.list = async (req, res, next) => {
  try {
    const books = await repo.getAllBooks();
    const withUrls = await Promise.all(
      books.map(async (b) => ({ ...b, imageUrl: await getImageUrl(b.imageKey) }))
    );
    res.render("list", { books: withUrls });
  } catch (err) {
    next(err);
  }
};

// GET /books/:id — detail
exports.detail = async (req, res, next) => {
  try {
    const book = await repo.getBookById(req.params.id);
    if (!book) return res.status(404).send("Book not found");
    book.imageUrl = await getImageUrl(book.imageKey);
    res.render("detail", { book });
  } catch (err) {
    next(err);
  }
};

// GET /books/new — create form
exports.newForm = (req, res) => {
  res.render("form", { book: null });
};

// POST /books — create
exports.create = async (req, res, next) => {
  try {
    const { title, author, category, description } = req.body;
    if (!title || !author) return res.status(400).send("title and author are required");

    const imageKey = await uploadImage(req.file); // null if no file
    const book = await repo.createBook({ title, author, category, description, imageKey });
    res.redirect(`/books/${book.bookId}`);
  } catch (err) {
    next(err);
  }
};

// GET /books/:id/edit — edit form
exports.editForm = async (req, res, next) => {
  try {
    const book = await repo.getBookById(req.params.id);
    if (!book) return res.status(404).send("Book not found");
    book.imageUrl = await getImageUrl(book.imageKey);
    res.render("form", { book });
  } catch (err) {
    next(err);
  }
};

// POST /books/:id — update
exports.update = async (req, res, next) => {
  try {
    const existing = await repo.getBookById(req.params.id);
    if (!existing) return res.status(404).send("Book not found");

    const { title, author, category, description } = req.body;
    const data = { title, author, category, description };

    // New file → new unique key. Do NOT delete the old object (retain versions).
    if (req.file) {
      data.imageKey = await uploadImage(req.file);
    }

    await repo.updateBook(req.params.id, data);
    res.redirect(`/books/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};

// POST /books/:id/delete — delete book + its current image
exports.remove = async (req, res, next) => {
  try {
    const deleted = await repo.deleteBook(req.params.id);
    if (deleted && deleted.imageKey) {
      await deleteImage(deleted.imageKey);
    }
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
