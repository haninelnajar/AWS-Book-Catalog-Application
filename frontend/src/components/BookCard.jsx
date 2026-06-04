import { Link } from "react-router-dom";

function BookCard({ book }) {
  return (
    <div className="book-card">
      <div className="book-cover">
        📖 Cover Coming Soon
      </div>

      <div className="book-content">
        <h3 className="book-title">
          {book.title}
        </h3>

        <p className="book-info">
          <strong>Author:</strong>{" "}
          {book.author}
        </p>

        <p className="book-info">
          <strong>Genre:</strong>{" "}
          {book.category}
        </p>

        <Link
          to={`/books/${book.bookId}`}
          className="book-button"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default BookCard;