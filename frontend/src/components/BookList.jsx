import BookCard from "./BookCard";

function BookList({ books }) {
  if (!books.length) {
    return <p>No books found.</p>;
  }

  return (
    <>
      {books.map((book) => (
        <BookCard
          key={book.bookId}
          book={book}
        />
      ))}
    </>
  );
}

export default BookList;