import BookCard from "./BookCard";

function BookList({ books }) {
  if (!books.length) {
    return (
      <p>
        No books found. Add your first
        book.
      </p>
    );
  }

  return (
    <div className="books-grid">
      {books.map((book) => (
        <BookCard
          key={book.bookId}
          book={book}
        />
      ))}
    </div>
  );
}

export default BookList;